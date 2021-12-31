import * as R from 'ramda';
import managedStore from  '../store';
import {
   capitalizeFirst,
   isNothing,
   isSomething,
   arrayContainsSomething,
   getObjectFromArrayByKeyValue,
   ifThen,
   compareIndexValues,
   spicyCurry
} from './index';
import { replacedRowVisibility, replacedColumnVisibility } from '../actions/metadataActions';
import { updatedFilter } from '../actions/filterActions';
import { updatedCellVisibility, hasChangedCell } from '../actions/cellActions';
import {
   stateMetadataProp,
   dbRowFilters,
   dbColumnFilters,
   filterFilterExpression,
   filterCaseSensitive,
   filterRegex,
   filterIndex, 
   cellRow, 
   cellColumn,
   stateColumnVisibility,
   stateRowVisibility,
   stateColumnFilters,
   stateRowFilters,
   statePastColumnVisibility,
   statePastRowVisibility,
} from './dataStructureHelpers';
import { cellsInRow, cellsInColumn } from './cellHelpers';
import { ROW_AXIS, COLUMN_AXIS } from '../constants';

export const getAxisFilterName = axis => R.concat(axis, 'Filters');

/***
 * these functions are for use by the reducers for UPDATED_ROW_FILTERS and UPDATED_COLUMN_FILTERS
 ***/
const removeOldFilter = R.curry((payload, filterArr) =>
   R.cond([
      [(payload, filterArr) => (isNothing(filterArr) || isNothing(payload) ? true : false), R.always([])],
      [(payload, filterArr) => !arrayContainsSomething(filterArr), R.always([])],
      [
         R.T,
         (payload, filterArr) =>
            R.reduce(
               (accumulator, filter) =>
                  R.propEq('index', filter.index, payload) ? accumulator : R.concat(accumulator, [filter]),
               []
            )(filterArr),
      ],
   ])(payload, filterArr)
);

export const updatedAxisFilters = (payload, filterName, stateObj, filterArr) =>
   R.pipe(
      removeOldFilter(payload), // remove the existing version of the axis' filter if it exists, from the filters array
      R.concat([payload]), // add the new filter from the payload to the filters array
      R.assoc(filterName, R.__, stateObj), // put the new filters array into the state obj
   )(filterArr);

/****
 * figure out how many rows or columns are hidden due to filtering, for use by Sheet.js & ColumnHeaders.js
 ****/
const confirmAxis = axis => (axis === ROW_AXIS || axis === COLUMN_AXIS ? axis : '');

export const getVisibilityForAxis = (axis, state) => stateMetadataProp(state, R.concat(axis, 'Visibility'));

const numHiddenItems = R.reduce(
   (accumulator, visibilityObj) => (!visibilityObj.isVisible ? accumulator + 1 : accumulator),
   0,
   R.__
);

const getNumHiddenItemsForAxis = R.pipe(
   getVisibilityForAxis,
   R.values,
   numHiddenItems,
);

const pluralizeTail = R.pipe(R.tail, R.toLower, R.concat(R.__, 's'));

const capitalizedPlural = R.converge(R.concat, [capitalizeFirst, pluralizeTail]);

// create either "totalRows" or "totalColumns" from the axis which will be either "row" or "column"
const createTotalsKey = axis => (confirmAxis(axis) ? R.pipe(capitalizedPlural, R.concat('total'))(axis) : null);

export const getTotalForAxis = R.curry(
   (axis, state) => stateMetadataProp(state, createTotalsKey(axis)) || 0 //returning 0 if the totalsKey is bogus)
);

export const getRequiredNumItemsForAxis = (axis, state) => R.converge(
      R.subtract, 
      [getTotalForAxis, getNumHiddenItemsForAxis]
   )(axis, state);

/****
 * row visibility, for use by Sheet.js
 *****/
export const shouldShowRow = R.curry((rowVisibility, cell) => arrayContainsSomething(rowVisibility)
   ? R.pipe(
      cellRow,
      getObjectFromArrayByKeyValue('index', R.__, rowVisibility),
      rowVisibilityObj => isSomething(rowVisibilityObj) ? rowVisibilityObj.isVisible : true
   )(cell)
   : true // ie if the visibility arr is empty that means show everything
);

/*****
 * column visibility, for use by ColumnHeaders.js.
 * These functions are similar to the row filtering ones above, but different due to the
 * different structure of data available to ColumnHeaders.js compared with Sheet.js,
 * consequently it doesn't seem worthwhile trying to generalize any of these functions
 ****/
export const shouldShowColumn = R.curry((colVisibilityArr, columnIndex) => arrayContainsSomething(colVisibilityArr)
   ? R.pipe(
      getObjectFromArrayByKeyValue,
      colVisibilityObj => isSomething(colVisibilityObj) ? colVisibilityObj.isVisible : true
   )('index', columnIndex, colVisibilityArr)
   : true // ie if the visibility arr is empty that means show everything
);

/* isFirstColumn for use by Sheet.js */
export const isFirstColumn = cell => cell?.column === 0;

export const getAxisVisibilityName = axis => R.concat(axis, 'Visibility'); // will be "rowVisibility" or "columnVisibility"

/**** isLastVisibleItemInAxis and related functions ****/
const findHighestVisibleItem = R.curry((currentIndex, visibilityArr) => {
   const isVisibleAtCurrentIndex = getObjectFromArrayByKeyValue('index', currentIndex, visibilityArr).isVisible;
   if (currentIndex === 0 || isVisibleAtCurrentIndex) {
      return currentIndex;
   }
   return findHighestVisibleItem(currentIndex - 1, visibilityArr);
});

const getAxisIndex = R.curry((axis, cell) => axis === ROW_AXIS ? cellRow(cell) : cellColumn(cell));

const arrayIsNothing = array => isNothing(array) || !arrayContainsSomething(array);

const getVisibilityArr = R.curry((axis, state) => R.pipe(getAxisVisibilityName, stateMetadataProp(state))(axis));

export const isLastVisibleItemInAxis = R.curry((axis, totalInAxis, state, cell) => { 
   const endIndex = totalInAxis - 1;
   return R.ifElse(
      // if the visiblity object is empty
      R.pipe(
         getVisibilityArr(axis), //receives state
         arrayIsNothing,
      ),
      // then compare the index of the last item to the current index
      R.pipe(
         R.thunkify(getAxisIndex)(axis, cell), // ignores sheet parameter sent to it
         R.equals(endIndex) // receives axis index
      ),
      // else find the index of the highest visible item and compare that to the current index
      R.pipe(
         getVisibilityArr(axis), //receives state
         findHighestVisibleItem(endIndex), // receives visibilityArr
         R.equals(getAxisIndex(axis, cell)) // receives highest visible's index
      )
   )(state);
});

const mapWithUpdatedFilter = axis =>
   R.map(filter => {
      const isInitializingSheet = true;
      return updatedFilter(
         {
            filterExpression: filterFilterExpression(filter),
            caseSensitive: filterCaseSensitive(filter),
            regex: filterRegex(filter),
            showFilterModal: false,
            rowIndex: axis === ROW_AXIS ? filterIndex(filter) : null,
            columnIndex: axis === COLUMN_AXIS ? filterIndex(filter) : null,
         },
         isInitializingSheet
      );
   }); // this function is called with the filters array

const isAxisItemVisible = (visibilityGetterFn, axisIndex) => R.pipe(
   visibilityGetterFn,
   R.ifElse(
      arrayContainsSomething,
      R.pipe(
         getObjectFromArrayByKeyValue('index', axisIndex),
         R.prop('isVisible')
      ),
      R.T
   )
)(managedStore.state);

export const isCellVisible = cell => {
   const columnVisible = isAxisItemVisible(stateColumnVisibility, cell.column);
   const rowVisible = isAxisItemVisible(stateRowVisibility, cell.row);
   return columnVisible && rowVisible;
}


export const applyFilters = sheet => {
   const rowFilters = dbRowFilters(sheet);
   const columnFilters = dbColumnFilters(sheet);
   mapWithUpdatedFilter(ROW_AXIS)(rowFilters);
   mapWithUpdatedFilter(COLUMN_AXIS)(columnFilters);
};

export const initializeAxesVisibility = () => {
   replacedRowVisibility([]);
   replacedColumnVisibility([]);
} 

export const isVisibilityCalculated = state => 
   stateColumnVisibility(state) 
   && stateRowVisibility(state);

export const updateOrAddPayloadToState = (payload, state) => {
   return arrayContainsSomething(payload)
      ? R.pipe(
         R.filter(stateItem =>
            R.pipe(
            R.find(payloadItem => payloadItem.index === stateItem.index), // if the state has an entry with the same index as payloadItem
               isNothing // filter that entry out of the state
            )(payload)
         ),
         R.concat(payload)
      )(state || [])
      : state || [];
}

// for use by filterModalReducer
export const getInitialFilterValues = ({ state, rowIndex, columnIndex }) => {
   const existingColumnFilter = getObjectFromArrayByKeyValue('index', columnIndex, stateColumnFilters(state));
   if (isSomething(existingColumnFilter)) {
      return existingColumnFilter;
   }
   const existingRowFilter = getObjectFromArrayByKeyValue('index', rowIndex, stateRowFilters(state));
   if (isSomething(existingRowFilter)) {
      return existingRowFilter;
   }
   return null;
};

export const isFilterEngaged = (index, filters) => arrayContainsSomething(filters)
   ? R.pipe(
      R.find(R.pipe(
         R.prop('index'), 
         R.equals(index)
      )),
      filterObj => isNothing(filterObj?.filterExpression) && isNothing(filterObj?.hideBlanks)
         ? false
         : isSomething(filterObj?.filterExpression) || filterObj?.hideBlanks
   )(filters)
   : false;

const sendUpdatesForChangedCells = ({ changedCells }) => {
   if (arrayContainsSomething(changedCells)) {
      R.forEach(
         cell => {
            updatedCellVisibility(cell);
            hasChangedCell({ row: cellRow(cell), column: cellColumn(cell) });
         }, 
         changedCells
      );
   }
}

const findChangedCells = spicyCurry(
      ({ axis, changedVisibilityItems }) => { 
      const changedCells = R.reduce(
         (accumulator, visibilityItem) => {
            const cellsInAxisItem = axis === ROW_AXIS 
               ? cellsInRow({ state: managedStore.state, rowIndex: visibilityItem.index }) 
               : cellsInColumn({ state: managedStore.state, columnIndex: visibilityItem.index });
            return R.concat(accumulator, cellsInAxisItem);
         },
         [],
         changedVisibilityItems
      );
      return { changedCells };
   }, 
   { axis: 'row', changedVisibilityItems: [ { index: 3, isVisible: false } ] }
);

const findChangedVisibilityItems = ({ oldVisibility, newVisibility }) => {
   const changedVisibilityItems = R.reduce(
      (accumulator, visibilityItem) => {
         const oldVisibilityItem = getObjectFromArrayByKeyValue('index', visibilityItem.index, oldVisibility);
         return oldVisibilityItem?.isVisible === visibilityItem.isVisible
            ? accumulator
            : R.append(visibilityItem, accumulator)
      }, 
      [], 
      newVisibility
   );
   return { changedVisibilityItems };
}

// this will be called in metadataActions--hasChangedMetadata
export const updateFilteredCells = () => {   
   // to see what visibility items have changed, compare the most recent past to the present
   // (all these need to be sorted so they are in the same order for the R.equals comparison below)
	const oldColumnVisibility = R.sort(compareIndexValues, statePastColumnVisibility(managedStore.state));
   const newColumnVisibility = R.sort(compareIndexValues, stateColumnVisibility(managedStore.state));
   const oldRowVisibility = R.sort(compareIndexValues, statePastRowVisibility(managedStore.state));
   const newRowVisibility = R.sort(compareIndexValues, stateRowVisibility(managedStore.state));

   ifThen({
      ifCond: R.pipe(R.equals, R.not),
      thenDo: [ findChangedVisibilityItems, findChangedCells({axis: COLUMN_AXIS}), sendUpdatesForChangedCells ],
      params: { 
         ifParams: [oldColumnVisibility, newColumnVisibility], 
         thenParams: { oldVisibility: oldColumnVisibility, newVisibility: newColumnVisibility }
      }
   });

   ifThen({
      ifCond: R.pipe(R.equals, R.not),
      thenDo: [ findChangedVisibilityItems, findChangedCells({axis: ROW_AXIS}), sendUpdatesForChangedCells ],
      params: { 
         ifParams: [oldRowVisibility, newRowVisibility],
         thenParams: { oldVisibility: oldRowVisibility, newVisibility: newRowVisibility },
      }
   });
}