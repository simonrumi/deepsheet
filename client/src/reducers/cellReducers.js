import * as R from 'ramda';
import managedStore from '../store';
import { isSomething, isNothing, } from '../helpers';
import { createUpdatedCellState, createCellKey } from '../helpers/cellHelpers';
import { dbCells, cellRow, cellColumn, floatingCellNumber } from '../helpers/dataStructureHelpers';
import { addErrorMessage } from '../helpers/authHelpers';
import {
   UPDATED_CELL,
   UPDATED_CELL_VISIBILITY,
   POSTING_UPDATED_CELLS,
   COMPLETED_SAVE_CELLS,
   CELLS_UPDATE_FAILED,
   HAS_CHANGED_CELL,
   COMPLETED_SAVE_CELL,
   HAS_ADDED_CELL,
   POSTING_DELETE_SUBSHEET_ID,
   COMPLETED_DELETE_SUBSHEET_ID,
   DELETE_SUBSHEET_ID_FAILED,
   ADDED_CELL_KEYS,
   REMOVED_CELL_KEYS,
   CLEARED_ALL_CELL_KEYS,
	UPDATED_END_OF_ROW_CELL,
} from '../actions/cellTypes';
import { ADDED_FLOATING_CELL, UPDATED_FLOATING_CELL, DELETED_FLOATING_CELL } from '../actions/floatingCellTypes';
import { FETCHED_SHEET } from '../actions/sheetTypes';
import { COMPLETED_CREATE_SHEET } from '../actions/sheetTypes';
import { CLEARED_ALL_ERROR_MESSAGES } from '../actions/types';

const processCellAction = R.curry((state, sheetId, action) => {
   switch (action.type) {
      case UPDATED_CELL:
         return { ...state, ...action.payload };

      case UPDATED_CELL_VISIBILITY:
         return { ...state, visible: action.payload.visible }

		case UPDATED_END_OF_ROW_CELL:
			return { ...state, isEndOfRow: action.payload.isEndOfRow } // didn't end up using isEndOfRow but keeping it in case it is useful in future

      case COMPLETED_SAVE_CELL:
         return createUpdatedCellState(action.payload, state, sheetId);
      
      case POSTING_DELETE_SUBSHEET_ID:
         /* action.payload looks like this:
         {
            row, 
            column, 
            content: {
               formattedText, 
               subsheetId
            },
            sheetId, 
         } */
         return {
            ...state,
            ...R.dissoc('sheetId', action.payload),
            isStale: true,
            isCallingDb: true,
         };

      case COMPLETED_DELETE_SUBSHEET_ID:
         return { ...state, ...action.payload, isStale: false, isCallingDb: false  };

      case DELETE_SUBSHEET_ID_FAILED:
         return { ...state, ...action.payload, isStale: true, isCallingDb: false  };

      default:
         return state;
   }
});

export const cellReducerCreator = thunkifiedCreatorFunc => {
   const store = managedStore.store;
   if (!store || !store.reducerManager) {
      console.error('ERROR: createCellReducers failed as there was no reducerManager');
      return;
   }
   const cellReducers = thunkifiedCreatorFunc();
   const combineNewReducers = store.reducerManager.addMany(cellReducers);
   store.replaceReducer(combineNewReducers);
}

const isCellAction = ({ action }) => isSomething(action?.type) && isSomething(cellRow(action?.payload)) && isSomething(cellColumn(action?.payload));
const isMatchingCell = ({ cell, action }) => isCellAction({ action }) && cellRow(cell) === cellRow(action.payload) && cellColumn(cell) === cellColumn(action.payload);

const cellReducerFactory = (cell, sheetId) => 
   (state = {}, action) => isMatchingCell({ cell, action }) ? processCellAction(state, sheetId, action) : state;

export const createCellReducers = sheet => {
   const thunkifiedCreatorFunc = R.thunkify(
      R.pipe(
         dbCells,
         R.reduce(
            (accumulator, cell) => {
               const cellReducer = cellReducerFactory(cell, sheet.id);
               const cellKey = createCellKey(cellRow(cell), cellColumn(cell));
               accumulator[cellKey] = cellReducer;
               return accumulator;
            },
            {}
         )
      )
   )(sheet);
   cellReducerCreator(thunkifiedCreatorFunc);
};

export const addCellReducers = (cells, sheetId) => {
   const thunkifiedCreatorFunc = R.thunkify(
      R.reduce(
         (accumulator, cell) => {
            const cellReducer = cellReducerFactory(cell, sheetId);
            const cellKey = createCellKey(cellRow(cell), cellColumn(cell));
            accumulator[cellKey] = cellReducer;
            return accumulator;
         },
         {}
      )
   )(cells);
   cellReducerCreator(thunkifiedCreatorFunc);
}

const isFloatingCellInArr = ({ floatingCell, arr }) => R.pipe(
	R.find(existingCell => floatingCellNumber(existingCell) === floatingCellNumber(floatingCell)),
	isSomething
)(arr);

const isCellInArr = ({ cell, arr }) => R.pipe(
	R.find(existingCell => cellRow(existingCell) === cellRow(cell) && cellColumn(existingCell) === cellColumn(cell)),
	isSomething
)(arr);

export const cellDbUpdatesReducer = (state = {}, action) => {
	const currentAddedCellsArr = state.addedCells || []; // using this value in a few places, so adding it here for convenience

   switch (action.type) {
      case COMPLETED_CREATE_SHEET:
         return {
            ...state,
            isCallingDb: false,
            isStale: false,
            errorMessage: null,
            lastUpdated: Date.now(),
         };

      case FETCHED_SHEET:
         return {
            ...state,
            isCallingDb: false,
            isStale: false,
            errorMessage: null,
         };

      case POSTING_UPDATED_CELLS:
         return {
            ...state,
            isCallingDb: true,
            isStale: true,
            errorMessage: null,
            lastUpdated: isSomething(state.lastUpdated) ? state.lastUpdated : null,
         };

      case COMPLETED_SAVE_CELLS:
         return {
            ...state,
            isCallingDb: false,
            isStale: false,
            errorMessage: null,
            lastUpdated: action.payload.lastUpdated,
            changedCells: [],
         };

      case CELLS_UPDATE_FAILED:
         return {
            ...state,
            isCallingDb: false,
            isStale: true,
            errorMessage: addErrorMessage({ err: action.payload, errArr: state.errorMessage }),
            lastUpdated: isSomething(state.lastUpdated) ? state.lastUpdated : null,
         };

      case HAS_CHANGED_CELL:
         const changedCells = state.changedCells || [];
			const addedCells = state.addedCells || [];
			const newlyChangedCell = action.payload;
			const cellAlreadyInChangedArr = isCellInArr({ cell: newlyChangedCell, arr: changedCells });
			const cellAlreadyInAddedArr = isCellInArr({ cell: newlyChangedCell, arr: addedCells });

			if (cellAlreadyInChangedArr || cellAlreadyInAddedArr) {
				return state;
			}

         return {
            ...state,
            isStale: true,
            changedCells: R.pipe(
					R.pick(['row', 'column']), 
					R.append(R.__, changedCells)
				)(newlyChangedCell),
         };

		case UPDATED_FLOATING_CELL:
			const changedFloatingCells = state.changedCells || [];
			const addedFloatingCells = state.addedCells || [];
			const newlyChangedFloatingCell = action.payload;
			const floatingCellAlreadyInChangedArr = isFloatingCellInArr({ floatingCell: newlyChangedFloatingCell, arr: changedFloatingCells });
			const floatingCellAlreadyInAddedArr = isFloatingCellInArr({ floatingCell: newlyChangedFloatingCell, arr: addedFloatingCells });

			if (floatingCellAlreadyInChangedArr || floatingCellAlreadyInAddedArr) {
				return state;
			}

			return {
            ...state,
            isStale: true,
            changedCells: R.pipe(
					R.pick(['number']), 
					R.append(R.__, changedFloatingCells),
				)(newlyChangedFloatingCell),
         };

		case HAS_ADDED_CELL:
			if (isNothing(action?.payload) || isNothing(cellRow(action.payload)) || isNothing(cellColumn(action.payload))) {
				return state;
			}
			const newCellAlreadyAdded = R.find(
            addedCell => cellRow(addedCell) === cellRow(action.payload) && cellColumn(addedCell) === cellColumn(action.payload),
            currentAddedCellsArr
         );
			const updatedAddedCellsArr = isNothing(newCellAlreadyAdded)
				? R.append(action.payload, currentAddedCellsArr)
				: currentAddedCellsArr;
			return {
				...state,
				addedCells: updatedAddedCellsArr,
				isStale: true,
			};

		case ADDED_FLOATING_CELL:
			if (isNothing(action?.payload) || isNothing(floatingCellNumber(action.payload))) {
				return state;
			}
			const newAddedCellsArr = isFloatingCellInArr({ floatingCell: action.payload, arr: currentAddedCellsArr })
				? currentAddedCellsArr
				: R.pipe(R.pick(['number']), R.append(R.__, currentAddedCellsArr))(action.payload);
			return {
				...state,
				addedCells: newAddedCellsArr,
				isStale: true,
			};

		// TODO make DELETED_CELL action as well (requires a whole new funtionality in the sheet)

		case DELETED_FLOATING_CELL:
			return {
				...state,
				addedCells: R.filter(addedCell => floatingCellNumber(addedCell) !== floatingCellNumber(action.payload), currentAddedCellsArr),
				changedCells: R.filter(changedCell => floatingCellNumber(changedCell) !== floatingCellNumber(action?.payload), state.changedCells || []),
				deletedCells: isFloatingCellInArr({ floatingCell: action.payload, arr: currentAddedCellsArr })
					? state.deletedCells || [] // the deleted cell was in the addedCells array, but has been removed from there. So no need to identify it as a deleted cell
					: R.append(action.payload, state.deletedCells || []),
				isStale: true,
			}

		case CLEARED_ALL_ERROR_MESSAGES:
			return { 
				...state,
				errorMessage: null,
			}

      default:
         return state;
   }
};

export const cellKeysReducer = (state = [], action) => {
   switch (action.type) {
      case ADDED_CELL_KEYS:
         return action.payload instanceof Array ? R.concat(state, action.payload) : R.append(action.payload, state);

      case REMOVED_CELL_KEYS:
         return action.payload instanceof Array ? R.without(action.payload, state) : R.without([action.payload], state);

      case CLEARED_ALL_CELL_KEYS:
         return [];

      default:
         return state;

   }
}