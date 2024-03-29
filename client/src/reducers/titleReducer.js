import {
   OPENED_TITLE_EDITOR,
   CHANGED_TITLE_VALUE,
   POSTING_UPDATED_TITLE,
   COMPLETED_TITLE_UPDATE,
   TITLE_UPDATE_FAILED,
   TITLE_EDIT_CANCELLED,
   TITLE_ERROR_DETECTED,
} from '../actions/titleTypes';
import { FINISHED_EDITING_TITLE } from '../actions/titleTypes';
import { FETCHED_SHEET } from '../actions/sheetTypes';
import { COMPLETED_CREATE_SHEET } from '../actions/sheetTypes';
import { CLEARED_ALL_ERROR_MESSAGES } from '../actions/types';
import { isSomething } from '../helpers';
import { decodeText } from '../helpers/cellHelpers';
import { addErrorMessage } from '../helpers/authHelpers';

const titleReducer = (state = {}, action) => {
   switch (action.type) {
      case FETCHED_SHEET:
         return {
            text: decodeText(action.payload.title),
            initialValue: action.payload.title,
            isEditingTitle: false,
            isCallingDb: false,
            isStale: false,
            lastUpdated: Date.now(),
         };

      case COMPLETED_CREATE_SHEET:
         return {
            text: action.payload.sheet.title,
            initialValue: action.payload.sheet.title,
            isEditingTitle: false,
            isCallingDb: false,
            isStale: false,
            lastUpdated: Date.now(),
         };

      case OPENED_TITLE_EDITOR:
         return { ...state, isEditingTitle: action.payload };

      case CHANGED_TITLE_VALUE:
         return { ...state, text: action.payload, isStale: true }

      case FINISHED_EDITING_TITLE:
         return {
            ...state,
            text: decodeText(action.payload.value),
            isStale: true,
            isEditingTitle: false,
            isCallingDb: false,
            lastUpdated: Date.now()
         }

      case POSTING_UPDATED_TITLE:
         return {
            ...state,
            isEditingTitle: false,
            isCallingDb: true,
            isStale: true,
            errorMessage: null,
            lastUpdated: isSomething(state.lastUpdated) ? state.lastUpdated : null,
         };

      case COMPLETED_TITLE_UPDATE:
         return {
            ...state,
            text: action.payload.text,
            initialValue: action.payload.text,
            isEditingTitle: false,
            isCallingDb: false,
            isStale: false,
            errorMessage: null,
            lastUpdated: action.payload.lastUpdated,
         };

      case TITLE_UPDATE_FAILED:
         return {
            ...state,
            text: state.initialValue, // restoring the value that the db has
            isEditingTitle: true,
            isCallingDb: false,
            isStale: false,
            errorMessage: addErrorMessage({ err: action.payload.errorMessage, errArr: state.errorMessage }),
            lastUpdated: isSomething(state.lastUpdated) ? state.lastUpdated : null,
         };

      case TITLE_ERROR_DETECTED:
         return {
            ...state,
            errorMessage: action.payload
         }

      case TITLE_EDIT_CANCELLED:
         return {
            ...state,
            text: decodeText(state.initialValue), // restoring the value prior to editing
            isEditingTitle: false,
            isCallingDb: false,
            isStale: false,
            errorMessage: null,
         };

		case CLEARED_ALL_ERROR_MESSAGES:
			return {
				...state,
				errorMessage: null,
			}

      default:
         return state;
   }
};

export default titleReducer;
