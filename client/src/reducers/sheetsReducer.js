import { FETCHING_SHEETS, FETCHED_SHEETS, FETCH_SHEETS_ERROR } from '../actions/sheetsTypes';

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

      default:
         return state;
   }
};

export default sheetsReducer;
