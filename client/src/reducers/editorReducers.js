import { UPDATED_EDITOR, SET_EDITOR_REF } from '../actions/editorTypes';

export const editorReducer = (state = {}, action) => {
   switch (action.type) {
      case UPDATED_EDITOR:
         return action.payload;
      default:
         return state;
   }
};

export const editorRefReducer = (state = {}, action) => {
   switch (action.type) {
      case SET_EDITOR_REF:
         return action.payload;
      default:
         return state;
   }
};
