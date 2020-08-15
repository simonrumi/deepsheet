import { UPDATED_SHEET_ID, FETCHING_SHEET, FETCHED_SHEET, FETCH_SHEET_ERROR } from '../actions/fetchSheetTypes';
import { POSTING_CREATE_SHEET, COMPLETED_CREATE_SHEET, SHEET_CREATION_FAILED } from '../actions/sheetTypes';
import { DEFAULT_SHEET_ID } from '../constants';

const fetchSheetReducer = (state = DEFAULT_SHEET_ID, action) => {
   switch (action.type) {
      case UPDATED_SHEET_ID:
         console.log('fetchSheetReducer got UPDATED_SHEET_ID with action.payload', action.payload);
         return action.payload;

      case FETCHING_SHEET:
         return {
            sheetId: action.payload,
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
         return action.payload.id;

      case COMPLETED_CREATE_SHEET:
         return action.payload.sheet.id;

      case FETCH_SHEET_ERROR:
      case SHEET_CREATION_FAILED:
         return {
            sheetId: null,
            isCallingDb: false,
            errorMessage: action.payload,
         };

      default:
         return state;
   }
};

export default fetchSheetReducer;
