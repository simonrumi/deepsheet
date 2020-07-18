import managedStore from '../store';
import { createSheetMutation } from '../queries/sheetMutations';
import { POSTING_CREATE_SHEET, COMPLETED_CREATE_SHEET, SHEET_CREATION_FAILED } from './sheetTypes';

export const createdSheet = async (rows, columns, title) => {
   managedStore.store.dispatch({ type: POSTING_CREATE_SHEET });
   try {
      const response = await createSheetMutation(rows, columns, title);
      managedStore.store.dispatch({
         type: COMPLETED_CREATE_SHEET,
         payload: { sheet: response.data.createSheet },
      }); //note that "createSheet" is the name of the mutation in sheetMutation.js
   } catch (err) {
      console.error('did not successfully create the sheet in the db: err:', err);
      managedStore.store.dispatch({
         type: SHEET_CREATION_FAILED,
         payload: { errorMessage: 'sheet was not created in the db: ' + err },
      });
   }
};
