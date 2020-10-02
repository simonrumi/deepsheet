import managedStore from '../store';

import { createNewSheet } from '../services/sheetServices';
import { stateIsLoggedIn } from '../helpers/dataStructureHelpers';

import { POSTING_CREATE_SHEET, COMPLETED_CREATE_SHEET, SHEET_CREATION_FAILED } from './sheetTypes';

export const createdSheet = async newSheetData => {
   managedStore.store.dispatch({ type: POSTING_CREATE_SHEET });
   if (!stateIsLoggedIn(managedStore.state)) {
      managedStore.store.dispatch({
         type: SHEET_CREATION_FAILED,
         payload: { errorMessage: 'Not logged in so sheet was not created in the db' },
      });
      return;
   }
   try {
      const response = await createNewSheet(newSheetData);

      managedStore.store.dispatch({
         type: COMPLETED_CREATE_SHEET,
         payload: { sheet: response.data.createSheet },
      });
   } catch (err) {
      console.error('did not successfully create the sheet in the db: err:', err);
      managedStore.store.dispatch({
         type: SHEET_CREATION_FAILED,
         payload: { errorMessage: 'sheet was not created in the db: ' + err },
      });
   }
};
