import {
   FETCHING_SHEETS,
   FETCHED_SHEETS,
   FETCH_SHEETS_ERROR,
   DELETING_SHEETS,
   DELETED_SHEETS,
   DELETE_SHEETS_ERROR,
} from '../actions/sheetsTypes';

const sheetsReducer = (state = {}, action) => {
   switch (action.type) {
      case FETCHING_SHEETS:
         return {
            ...state,
            isCallingDb: true,
            errorMessage: null,
         };

      case FETCHED_SHEETS:
         return action.payload;

      case FETCH_SHEETS_ERROR:
         return {
            ...state,
            isCallingDb: false,
            errorMessage: action.payload,
         };

      case DELETING_SHEETS:
         return {
            ...state,
            isCallingDb: true,
            errorMessage: null,
         };

      case DELETED_SHEETS:
         // note action.payload looks like { sheets: [ {id etc}, {id etc}, ] }
         return {
            ...action.payload,
            isCallingDb: false,
            errorMessage: null,
         };

      case DELETE_SHEETS_ERROR:
         return {
            ...state,
            isCallingDb: false,
            errorMessage: action.payload,
         };

      default:
         return state;
   }
};

export default sheetsReducer;
