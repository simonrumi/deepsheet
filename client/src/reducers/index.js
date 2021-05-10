import authReducer from './authReducers';
import { cellDbUpdatesReducer, cellKeysReducer } from './cellReducers';
import dragMonitorReducer from './dragMonitorReducer';
import filterModalReducer from './filterModalReducer';
import { focusReducer } from './focusReducer';
import menuReducer from './menuReducer';
import metadataReducer from './metadataReducer';
import sheetReducer from './sheetReducer';
import sheetsReducer from './sheetsReducer';
import sortModalReducer from './sortModalReducer';
import titleReducer from './titleReducer';

export const staticReducers = {
   auth: authReducer,
   cellDbUpdates: cellDbUpdatesReducer,
   cellKeys: cellKeysReducer,
   dragMonitor: dragMonitorReducer,
   filterModal: filterModalReducer,
   focus: focusReducer,
   menu: menuReducer,
   metadata: metadataReducer,
   sheet: sheetReducer,
   sheets: sheetsReducer,
   sortModal: sortModalReducer,
   title: titleReducer,
};
