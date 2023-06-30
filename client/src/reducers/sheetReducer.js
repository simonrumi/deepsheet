import * as R from 'ramda';
import {
   TRIGGERED_FETCH_SHEET,
   FETCHING_SHEET,
   FETCHED_SHEET,
   FETCH_SHEET_ERROR,
   POSTING_CREATE_SHEET,
   COMPLETED_CREATE_SHEET,
   SHEET_CREATION_FAILED,
} from '../actions/sheetTypes';
import { CELLS_LOADED, CELLS_UPDATED, CELLS_REDRAW_COMPLETED } from '../actions/cellTypes';
import { CLEARED_ALL_ERROR_MESSAGES } from '../actions/types';
import { isNothing, arrayContainsSomething } from '../helpers';
import { addErrorMessage } from '../helpers/authHelpers';
import { ALL_CELLS } from '../constants';

// TODO SHEET_HISTORY NEXT
// start by saving some history so we have something to load
// need to load the history as well as the sheet
// might be the undoReducer is the place to do that 

const sheetReducer = (state = null, action) => {
   switch (action.type) {
      case TRIGGERED_FETCH_SHEET:
         if (isNothing(action.payload)) {
            return { ...state, errorMessage: null };
         }
         return { ...state, sheetId: action.payload || null, errorMessage: null };

      case FETCHING_SHEET:
         const { userId, sheetId = null } = action.payload;
         return {
            ...state,
            userId,
				sheetId,
            isCallingDb: true,
            errorMessage: null,
            cellsLoaded: false,
         };

      case POSTING_CREATE_SHEET:
         return {
            ...state,
            isCallingDb: true,
            errorMessage: null,
         };

      case FETCHED_SHEET:
			console.log('sheetReducer--FETCHED_SHEET will set isCallingDb to false');
         return {
            ...state,
            isCallingDb: false,
            errorMessage: null,
            sheetId: R.path(['payload', 'present', 'id'], action),
         };

      case COMPLETED_CREATE_SHEET:
         return {
            ...state,
            isCallingDb: false,
            errorMessage: null,
            sheetId: action.payload.sheet.id, // TODO SHEET_HISTORY this will have to become something like R.path(['payload', 'sheetHistory', 'present', 'id'], action),
         };

      case FETCH_SHEET_ERROR:
      case SHEET_CREATION_FAILED:
         return {
            ...state,
            // sheetId: null,
            isCallingDb: false,
				errorMessage: addErrorMessage({ err: action.payload, errArr: state.errorMessage }),
         }

      case CELLS_LOADED:
         return {
            ...state,
            cellsLoaded: true,
            cellsUpdateInfo: [{ changeType: CELLS_LOADED, data: [ALL_CELLS] }],
            cellsRenderCount: state.cellsRenderCount === undefined ? 1 : state.cellsRenderCount + 1,
         };

      case CELLS_UPDATED:
         // payload will be like this
         // { changeType: UPDATED_COLUMN_WIDTH, data: { some data relating to the change type } }
         const cellsUpdateInfo = R.has('cellsUpdateInfo', state) && arrayContainsSomething(state.cellsUpdateInfo)
            ? [ ...state.cellsUpdateInfo, action.payload ]
            : [ action.payload ];
         return {
            ...state,
            cellsUpdateInfo,
            cellsRenderCount: state.cellsRenderCount === undefined ? 1 : state.cellsRenderCount + 1,
         };

      case CELLS_REDRAW_COMPLETED:
         return {
            ...state,
            cellsUpdateInfo: [],
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

export default sheetReducer;
