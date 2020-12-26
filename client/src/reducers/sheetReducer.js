import { TRIGGERED_FETCH_SHEET, FETCHING_SHEET, FETCHED_SHEET, FETCH_SHEET_ERROR } from '../actions/sheetTypes';
import { POSTING_CREATE_SHEET, COMPLETED_CREATE_SHEET, SHEET_CREATION_FAILED } from '../actions/sheetTypes';
import { CELLS_LOADED } from '../actions/cellTypes';
import { isNothing } from '../helpers';

const sheetReducer = (state = null, action) => {
   switch (action.type) {
      case TRIGGERED_FETCH_SHEET:
         if (isNothing(action.payload)) {
            return {...state, errorMessage: null };
         }
         return { ...state, sheetId: action.payload, errorMessage: null };

      case FETCHING_SHEET:
         const { sheetId, userId } = action.payload;
         return {
            sheetId,
            userId,
            isCallingDb: true,
            errorMessage: null,
         };

      case POSTING_CREATE_SHEET:
         return {
            ...state,
            isCallingDb: true,
            errorMessage: null,
         };

      case FETCHED_SHEET:
         return {
            ...state,
            isCallingDb: false,
            errorMessage: null,
            sheetId: action.payload.id,
         };

      case COMPLETED_CREATE_SHEET:
         return {
            ...state,
            isCallingDb: false,
            errorMessage: null,
            sheetId: action.payload.sheet.id,
         };

      case FETCH_SHEET_ERROR:
      case SHEET_CREATION_FAILED:
         return {
            ...state,
            sheetId: null,
            isCallingDb: false,
            errorMessage: action.payload,
         };

      case CELLS_LOADED:
         return {
            ...state,
            cellsLoaded: true
         }

      default:
         return state;
   }
};

export default sheetReducer;
