import {
   FETCHING_SHEETS,
   FETCHED_SHEETS,
   FETCH_SHEETS_ERROR,
   DELETING_SHEETS,
   DELETED_SHEETS,
   DELETE_SHEETS_ERROR,
   UPDATED_SHEETS_TREE,
   UPDATED_SHEETS_TREE_NODE,
} from '../actions/sheetsTypes';

import { replaceNodeWithinSheetsTree } from '../helpers/sheetsHelpers';

const sheetsReducer = (state = {}, action) => {
   switch (action.type) {
      case FETCHING_SHEETS:
         return {
            ...state,
            isCallingDb: true,
            errorMessage: null,
         };

      case FETCHED_SHEETS:
         return {
            ...state,
            isCallingDb: false,
            errorMessage: null,
            sheets: action.payload,
         };

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
         return {
            ...state,
            isCallingDb: false,
            errorMessage: null,
            sheets: action.payload, // these are the new sheets
         };

      case DELETE_SHEETS_ERROR:
         return {
            ...state,
            isCallingDb: false,
            errorMessage: action.payload,
         };

      case UPDATED_SHEETS_TREE:
         return {
            ...state,
            sheetsTree: action.payload,
         }

         case UPDATED_SHEETS_TREE_NODE:
            const updatedSheetsTree = replaceNodeWithinSheetsTree(action.payload, state.sheetsTree);
            return {
               ...state,
               sheetsTree: updatedSheetsTree,
            }

      default:
         return state;
   }
};

export default sheetsReducer;
