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

export const staticReducers = {
   sheet: sheetReducer,
   sheets: sheetsReducer,
   metadata: metadataReducer,
   editorRef: editorRefReducer,
   editor: editorReducer,
   title: titleReducer,
   filterModal: filterModalReducer,
   cellDbUpdates: cellDbUpdatesReducer,
   cellKeys: cellKeysReducer,
   menu: menuReducer,
   focus: focusReducer,
   auth: authReducer,
};
