import { reducer as reduxFormReducer } from 'redux-form';
import { cellDbUpdatesReducer, cellKeysReducer } from './cellReducers';
import { focusReducer } from './focusReducer';
import titleReducer from './titleReducer';
import filterModalReducer from './filterModalReducer';
import sheetReducer from './sheetReducer';
import sheetsReducer from './sheetsReducer';
import menuReducer from './menuReducer';
import { editorReducer, editorRefReducer } from './editorReducers';
import authReducer from './authReducers';
import metadataReducer from './metadataReducer';
import { TITLE_EDIT_CANCELLED } from '../actions/titleTypes';

export const staticReducers = {
   sheet: sheetReducer,
   sheets: sheetsReducer,
   metadata: metadataReducer,
   editorRef: editorRefReducer,
   editor: editorReducer,
   title: titleReducer,
   form: reduxFormReducer.plugin({
      titleForm: (state, action) => {
         switch (action.type) {
            case TITLE_EDIT_CANCELLED:
               return undefined;
            default:
               return state;
         }
      },
   }),
   filterModal: filterModalReducer,
   cellDbUpdates: cellDbUpdatesReducer,
   cellKeys: cellKeysReducer,
   menu: menuReducer,
   focus: focusReducer,
   auth: authReducer,
};
