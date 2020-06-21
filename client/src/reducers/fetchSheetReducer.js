import { UPDATED_SHEET_ID, FETCHING_SHEET, FETCHED_SHEET, FETCH_SHEET_ERROR } from '../actions/fetchSheetTypes';
import { DEFAULT_SHEET_ID } from '../constants';

const fetchSheetReducer = (state = DEFAULT_SHEET_ID, action) => {
   switch (action.type) {
      case UPDATED_SHEET_ID:
         return action.payload;

      case FETCHING_SHEET:
         return {
            sheetId: action.payload,
            isCallingDb: true,
            errorMessage: null,
         };

      case FETCHED_SHEET:
         return action.payload.id;

      case FETCH_SHEET_ERROR:
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
