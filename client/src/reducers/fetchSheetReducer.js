import { TRIGGERED_FETCH_SHEET, FETCHING_SHEET, FETCHED_SHEET, FETCH_SHEET_ERROR } from '../actions/fetchSheetTypes';
import { POSTING_CREATE_SHEET, COMPLETED_CREATE_SHEET, SHEET_CREATION_FAILED } from '../actions/sheetTypes';
import { isNothing } from '../helpers';

const fetchSheetReducer = (state = null, action) => {
   switch (action.type) {
      case TRIGGERED_FETCH_SHEET:
         console.log('fetchSheetReducer got TRIGGERED_FETCH_SHEET with action.payload', action.payload);
         if (isNothing(action.payload)) {
            return state;
         }
         return { ...state, sheetId: action.payload };

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

      default:
         return state;
   }
};

export default fetchSheetReducer;
