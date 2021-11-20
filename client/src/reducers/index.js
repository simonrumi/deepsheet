import authReducer from './authReducers';
import { cellDbUpdatesReducer, cellKeysReducer } from './cellReducers';
import cellRangeReducer from './cellRangeReducer';
import clipboardReducer from './clipboardReducer';
import dragMonitorReducer from './dragMonitorReducer';
import filterModalReducer from './filterModalReducer';
import { focusReducer } from './focusReducer';
import menuReducer from './menuReducer';
import metadataReducer from './metadataReducer';
import pasteOptionsModalReducer from './pasteOptionsModalReducer';
import sheetReducer from './sheetReducer';
import sheetsReducer from './sheetsReducer';
import sortModalReducer from './sortModalReducer';
import titleReducer from './titleReducer';
import globalInfoModalReducer from './globalInfoModalReducer';

export const staticReducers = {
   auth: authReducer,
   cellDbUpdates: cellDbUpdatesReducer,
   cellKeys: cellKeysReducer,
   cellRange: cellRangeReducer,
   clipboard: clipboardReducer,
   dragMonitor: dragMonitorReducer,
   filterModal: filterModalReducer,
   focus: focusReducer,
   menu: menuReducer,
   metadata: metadataReducer,
	pasteOptionsModal: pasteOptionsModalReducer,
   sheet: sheetReducer,
   sheets: sheetsReducer,
   sortModal: sortModalReducer,
   title: titleReducer,
   globalInfoModal: globalInfoModalReducer,
};
