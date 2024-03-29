import * as R from 'ramda';
import managedStore from '../store';
import { ROW_AXIS, COLUMN_AXIS } from '../constants';
import {
   REPLACED_COLUMN_VISIBILITY,
   REPLACED_ROW_VISIBILITY,
   RESET_VISIBLITY,
} from '../actions/metadataTypes';
import { HIDE_FILTERED, CLEAR_ALL_FILTERS, } from '../actions/filterTypes';
import { toggledShowFilterModal } from '../actions/filterActions';
import { hasChangedMetadata, updatedColumnFilters, updatedRowFilters } from '../actions/metadataActions';
import { updatedCell, hasChangedCell } from '../actions/cellActions';
import {
   getObjectFromArrayByKeyValue,
   isNothing,
   isSomething,
   arrayContainsSomething,
   forLoopMap,
   ifThenElse,
} from '../helpers';
import { getTotalForAxis, getAxisVisibilityName } from '../helpers/visibilityHelpers';
import {
   getCellFromStore,
   getAllCells,
   maybeCorrectCellVisibility,
   isCellEmpty,
   isTextInCell,
} from '../helpers/cellHelpers';
import {
   stateMetadataProp,
   stateFrozenRows,
   stateFrozenColumns,
	cellRow,
	cellColumn,
} from '../helpers/dataStructureHelpers';
import { FILTER_EDIT } from '../actions/filterTypes';

/* these are used by multiple functions below */
const getAxis = data =>
   R.ifElse(
      R.isNil,
      () => COLUMN_AXIS,
      () => ROW_AXIS
   )(data.rowIndex);

const getOtherAxis = axis => (axis === ROW_AXIS ? COLUMN_AXIS : ROW_AXIS);

const getVisibilityActionTypeByAxis = axis =>
   axis === ROW_AXIS ? REPLACED_ROW_VISIBILITY : REPLACED_COLUMN_VISIBILITY;

const getStateFromData = data => R.path(['store', 'getState'], data)(); // note that we are running the getState() function once we have it

const getFilters = (axisName, state) => R.pipe(R.concat(R.__, 'Filters'), stateMetadataProp(state))(axisName);

/**** filterAxes and related functions *****/
const makeVisibilityAction = (axis, payload) => ({
   type: getVisibilityActionTypeByAxis(axis),
   payload,
});

const dispatchVisibilityActions = R.curry((data, newAxesVisibility) =>
   R.map(
      axis => {
         const axisVisibilityName = getAxisVisibilityName(axis);
         const visibilityPayload = R.prop(axisVisibilityName, newAxesVisibility);
         data.store.dispatch(makeVisibilityAction(axis, visibilityPayload));
         return true; // just to stop console complaining about not returning a value
      },
      [ROW_AXIS, COLUMN_AXIS]
   )
);

// note that the 3rd parameter to R.reduce is the string to operate on - it will be passed as a parameter to escapeRegexChars
const escapeRegexChars = R.memoizeWith(
   R.identity,
   R.reduce((processedString, char) => {
      const charNums = [91, 94, 36, 46, 124, 63, 42, 43, 40, 41, 92]; // nums for the chars [^$.|?*+()\
      const charCode = char.charCodeAt(0);
      const needsEscaping = R.includes(charCode, charNums);
      const maybeEscapedChar = needsEscaping ? String.fromCharCode(92, charCode) : char;
      return R.concat(processedString, maybeEscapedChar);
   }, '')
);

const isCellShownByFilter = R.curry((cell, filter, axisOfFilter) => {
   if (cell[axisOfFilter] !== filter.index) {
      return true; // because this filter does not apply to this cell
   }
	if (filter.hideBlanks && isCellEmpty(cell)) {
		return false;
	}
   const flags = filter.caseSensitive ? '' : 'i';
   const filterExpression = filter.regex
      ? filter.filterExpression || ''
      : escapeRegexChars(filter.filterExpression || '');
   const regex = new RegExp(filterExpression, flags);
	return isTextInCell({ cell, text: regex, isRegex: true });
});

const getRowAndColumn = (axis, itemIndex, otherAxisIndex) =>
   axis === ROW_AXIS ? { row: itemIndex, column: otherAxisIndex } : { row: otherAxisIndex, column: itemIndex };

const checkCellsAgainstFilters = R.curry((axis, otherAxisFilters, cellsInAxisItem) => {
   return R.reduce((cellAccumulator, cell) => {
      return (
         cellAccumulator &&
         R.reduce(
            (filterAccumulator, otherAxisFilter) =>
               filterAccumulator && isCellShownByFilter(cell, otherAxisFilter, getOtherAxis(axis)),
            true
         )(otherAxisFilters)
      );
   }, true)(cellsInAxisItem);
});

const getCellsInAxisItem = R.curry((data, axis, itemIndex, _) => {
   const totalInOtherAxis = getTotalForAxis(getOtherAxis(axis), getStateFromData(data));
   return forLoopMap(otherAxisIndex => {
      const { row, column } = getRowAndColumn(axis, itemIndex, otherAxisIndex);
      return getCellFromStore({row, column, state: getStateFromData(data)});
   }, totalInOtherAxis);
});

const getAxisFreezes = axis => axis === ROW_AXIS ? stateFrozenRows(managedStore.state) : stateFrozenColumns(managedStore.state);

const isAxisItemFrozen = (axis, itemIndex) => {
   const axisFreezes = getAxisFreezes(axis);
   const frozen = getObjectFromArrayByKeyValue('index', itemIndex, axisFreezes);
   if (isSomething(frozen) && frozen.isFrozen) {
      return true;
   }
   return false;
};

const getVisibilityForCellsInAxisItem = (data, axis, itemIndex) => {
   if (isAxisItemFrozen(axis, itemIndex)) {
      return true;
   }
   const otherAxisFilters = getFilters(getOtherAxis(axis), getStateFromData(data));
   return R.ifElse(
      // if there are no filters
      otherAxisFilters => isNothing(otherAxisFilters) || !arrayContainsSomething(otherAxisFilters),
      // return true
      R.T,
      // else check the cells in the axis item (e.g. cells in row 1) against the filters in the opposite axis (e.g. all columnFilters)
      otherAxisFilters => R.pipe(
         getCellsInAxisItem,
         checkCellsAgainstFilters(axis, otherAxisFilters),
      )(data, axis, itemIndex, otherAxisFilters)
   )(otherAxisFilters); // note otherAxisFilters obj is given to all 3 ifElse Fns - condition, onTrue and onFalse
};

const getNewVisibilityForAxisItem = R.curry((data, axis, itemIndex) => ({
   index: itemIndex,
   isVisible: getVisibilityForCellsInAxisItem(data, axis, itemIndex),
}));

const filterAllItemsInAxis = R.curry((data, axis) => {
   const axisVisibilityArr = R.times(
      getNewVisibilityForAxisItem(data, axis),
      getTotalForAxis(axis, getStateFromData(data))
   );
   return R.pipe(getAxisVisibilityName, R.assoc(R.__, axisVisibilityArr, {}))(axis);
});

const filterAxes = data => {
   const newVisibility = R.pipe(
      R.map(filterAllItemsInAxis(data)),
      R.mergeAll //converts the array to an object like {rowVisibility: {...}, columnVisibility: {...}}
   )([ROW_AXIS, COLUMN_AXIS]);
   dispatchVisibilityActions(data, newVisibility);
   return data;
};
/***** end filterAxes and related functions *****/

const getAxisVisibilityByIndex = (axis, axisIndex, state) => {
   const visibilityObj = R.pipe(
      getAxisVisibilityName,
      stateMetadataProp(state),
      getObjectFromArrayByKeyValue('index', axisIndex)
   )(axis);
   return visibilityObj ? visibilityObj.isVisible : true; // if there's no visibilityObj then we should show the Axis Item, so return true
};

const getCellVisibilityForAxis = R.curry((cell, axis, state) => {
   const otherAxis = getOtherAxis(axis);
   const otherAxisIndex = cell[otherAxis];
   return getAxisVisibilityByIndex(otherAxis, otherAxisIndex, state);
});

// this returns an aray of 2 functions, one for each axis, which take the data as an argument and return something like
// {index: 0, isVisible: true}
// this array is used by the reduce function in setVisibilityForCell() below
const getCellVisibilityFnsFromCell = cell => R.map(getCellVisibilityForAxis(cell), [ROW_AXIS, COLUMN_AXIS]);

// every cell is going to be run through this function
const setVisibilityForCell = (data, cell) => {
   const state = getStateFromData(data);
   const newCellVisibility = R.reduce(
      (accumulator, visibilityFn) => visibilityFn(state) && accumulator,
      true,
      getCellVisibilityFnsFromCell(cell)
   );
   R.when(
      newVisibility => newVisibility !== cell.visible,
      newVisibility => {
			updatedCell({ ...cell, visible: newVisibility });
			hasChangedCell({ row: cellRow(cell), column: cellColumn(cell) });
		}
   )(newCellVisibility);
};

const getCellsFromData = data => R.pipe(
      getStateFromData, 
      getAllCells 
   )(data);

const filterCells = data => {
   const cells = getCellsFromData(data);
   R.forEach(cell => {
      setVisibilityForCell(data, cell);
   }, cells);
};
/**** end filterCells and related functions ******/

/**** functions related to addNewFilter *****/

const getFilterIndex = data => (R.isNil(data.rowIndex) ? data.columnIndex : data.rowIndex);

const getNewFilter = data =>
   R.mergeAll([
      R.assoc('index', getFilterIndex(data), {}),
      R.pick(['filterExpression', 'caseSensitive', 'regex', 'hideBlanks'])(data),
   ]);

const addNewFilter = data => {
   if (!data.isInitializingSheet) {
      ifThenElse({
         ifCond: R.equals(ROW_AXIS),
         thenDo: () => {
            R.pipe(
               getNewFilter,
               updatedRowFilters
            )(data)
         },
         elseDo: () => {
            R.pipe(
               getNewFilter,
               updatedColumnFilters
            )(data)
         },
         params: { ifParams: getAxis(data) }
      });
   }
   return data;
};
/**** end addNewFilter and related functions ******/

/* getDataFromActionAndStore - creates a data object for passing to subsequent functions in hideFiltered's pipe */
const getDataFromActionAndStore = (actionData, isInitializingSheet, store) => R.mergeAll([actionData, { store, isInitializingSheet }]);

const hideFiltered = R.pipe(
   getDataFromActionAndStore,
   addNewFilter,
   filterAxes,
   filterCells
);

const clearAllFilters = store => {
   store.dispatch({ type: RESET_VISIBLITY });
   toggledShowFilterModal();
   const filterDataReset = {
      filterExpression: '',
      hideBlanks: false,
      caseSensitive: false,
      regex: false,
      showFilterModal: false,
      rowIndex: null,
      columnIndex: 0, //doesn't really matter which filter icon that was clicked on, so we pretend it was column A
   };
   const isInitializingSheet = false;
   R.pipe(
      getDataFromActionAndStore, 
      filterAxes, 
      filterCells
   )(filterDataReset, isInitializingSheet, store);
};

const filterSheet = store => next => async action => {
   switch (action.type) {
      case HIDE_FILTERED:
         const { filterOptions, isInitializingSheet } = action.payload;
         hideFiltered(filterOptions, isInitializingSheet, store);
         if (!isInitializingSheet) {
            hasChangedMetadata({ changeType: FILTER_EDIT, data: filterOptions });
         }
			maybeCorrectCellVisibility(store);
         break;
      case CLEAR_ALL_FILTERS:
         clearAllFilters(store);
         hasChangedMetadata({ changeType: FILTER_EDIT, data: {} });
         break;
      default:
   }
   return next(action);
};

export default filterSheet;