import { reducer as reduxFormReducer } from 'redux-form';
import { cellDbUpdatesReducer, cellKeysReducer } from './cellReducers';
import { focusReducer } from './focusReducer';
import titleReducer from './titleReducer';
import sheetReducer from './sheetReducer';
import sheetsReducer from './sheetsReducer';
import menuReducer from './menuReducer';
import { editorReducer, editorRefReducer } from './editorReducers';
import authReducer from './authReducers';
import metadataReducer from './metadataReducer';
import { TOGGLED_SHOW_FILTER_MODAL } from '../actions/types';
import { TITLE_EDIT_CANCELLED } from '../actions/titleTypes';
import { UPDATED_FILTER } from '../actions/metadataTypes';

// TODO move this to it's own folder
export const filterModalReducer = (state = { showFilterModal: false }, action) => {
   switch (action.type) {
      case TOGGLED_SHOW_FILTER_MODAL:
         const { showModal, rowIndex, colIndex } = action.payload;
         return { ...state, showFilterModal: showModal, rowIndex, colIndex };

      case UPDATED_FILTER:
         return action.payload;

      default:
         return state;
   }
};

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
