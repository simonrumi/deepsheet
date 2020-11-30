import {
   OPENED_TITLE_EDITOR,
   CHANGED_TITLE_VALUE,
   POSTING_UPDATED_TITLE,
   COMPLETED_TITLE_UPDATE,
   TITLE_UPDATE_FAILED,
   TITLE_EDIT_CANCELLED,
   TITLE_ERROR_DETECTED,
} from '../actions/titleTypes';
import { FETCHED_SHEET } from '../actions/sheetTypes';
import { COMPLETED_CREATE_SHEET } from '../actions/sheetTypes';
import { isSomething } from '../helpers';

const titleReducer = (state = {}, action) => {
   switch (action.type) {
      case FETCHED_SHEET:
         return {
            text: action.payload.title,
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

      case POSTING_UPDATED_TITLE:
         return {
            ...state,
            isEditingTitle: true,
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
            errorMessage: isSomething(action.payload.errorMessage) ? action.payload.errorMessage : null,
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
            text: state.initialValue, // restoring the value prior to editing
            isEditingTitle: false,
            isCallingDb: false,
            isStale: false,
            errorMessage: null,
         };

      default:
         return state;
   }
};

export default titleReducer;
