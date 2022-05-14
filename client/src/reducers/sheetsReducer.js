import {
   FETCHING_SHEETS,
   FETCHED_SHEETS,
   FETCH_SHEETS_ERROR,
   DELETING_SHEETS,
   DELETED_SHEETS,
   DELETE_SHEETS_ERROR,
   UPDATED_SHEETS_TREE,
   UPDATED_SHEETS_TREE_NODE,
	TOGGLED_SHEETS_TREE_NODE_IS_EXPANDED,
   SHEETS_TREE_STALE,
   SHEETS_TREE_CURRENT,
} from '../actions/sheetsTypes';
import { CLEARED_ALL_ERROR_MESSAGES } from '../actions/types';
import { replaceNodeWithinSheetsTree } from '../helpers/sheetsHelpers';
import { addErrorMessage } from '../helpers/authHelpers';

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
				errorMessage: addErrorMessage({ err: action.payload, errArr: state.errorMessage }),
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

      case SHEETS_TREE_STALE:
         return {
            ...state,
            sheetsTreeStale: true,
         }

      case SHEETS_TREE_CURRENT:
         return {
            ...state,
            sheetsTreeStale: false,
         }

      case DELETE_SHEETS_ERROR:
         return {
            ...state,
            isCallingDb: false,
				errorMessage: addErrorMessage({ err: action.payload, errArr: state.errorMessage }),
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

		case TOGGLED_SHEETS_TREE_NODE_IS_EXPANDED:
			const newNode = {
				...action.payload,
				isExpanded: !action.payload.isExpanded
			}
			const sheetsTreeWithToggle = replaceNodeWithinSheetsTree(newNode, state.sheetsTree);
			return {
				...state,
				sheetsTree: sheetsTreeWithToggle,
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

export default sheetsReducer;
