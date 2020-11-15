import {
   OPENED_TITLE_EDITOR,
   POSTING_UPDATED_TITLE,
   COMPLETED_TITLE_UPDATE,
   TITLE_UPDATE_FAILED,
   TITLE_EDIT_CANCELLED,
} from '../actions/titleTypes';
import { FETCHED_SHEET } from '../actions/sheetTypes';
import { COMPLETED_CREATE_SHEET } from '../actions/sheetTypes';
import { isSomething } from '../helpers';

// action.payload contains
// {  text: some title,
//    isEditingTitle: true/false,
//    sheetId: some sheetId }
const titleReducer = (state = {}, action) => {
   switch (action.type) {
      case FETCHED_SHEET:
         return {
            text: action.payload.title,
            isEditingTitle: false,
            isCallingDb: false,
            isStale: false,
            needsUpdate: false,
            lastUpdated: Date.now(),
         };

      case COMPLETED_CREATE_SHEET:
         return {
            text: action.payload.sheet.title,
            isEditingTitle: false,
            isCallingDb: false,
            isStale: false,
            needsUpdate: false,
            lastUpdated: Date.now(),
         };

      case OPENED_TITLE_EDITOR:
         return { ...state, isEditingTitle: action.payload };

      case POSTING_UPDATED_TITLE:
         console.log('titleReducer got POSTING_UPDATED_TITLE action');
         return {
            text: state.text,
            isEditingTitle: true,
            isCallingDb: true,
            isStale: true,
            needsUpdate: true,
            errorMessage: null,
            lastUpdated: isSomething(state.lastUpdated) ? state.lastUpdated : null,
         };

      case COMPLETED_TITLE_UPDATE:
         console.log('titleReducer got COMPLETED_TITLE_UPDATE action');
         return {
            text: action.payload.text,
            isEditingTitle: false,
            isCallingDb: false,
            isStale: false,
            needsUpdate: false,
            errorMessage: null,
            lastUpdated: action.payload.lastUpdated,
         };

      case TITLE_UPDATE_FAILED:
         console.log('titleReducer got TITLE_UPDATE_FAILED action');
         return {
            text: action.payload.text,
            isEditingTitle: true,
            isCallingDb: false,
            isStale: false,
            needsUpdate: true,
            errorMessage: isSomething(action.payload.errorMessage) ? action.payload.errorMessage : null,
            lastUpdated: isSomething(state.lastUpdated) ? state.lastUpdated : null,
         };

      case TITLE_EDIT_CANCELLED:
         return {
            ...state,
            isEditingTitle: false,
            isCallingDb: false,
            errorMessage: null,
         };

      default:
         return state;
   }
};

export default titleReducer;
