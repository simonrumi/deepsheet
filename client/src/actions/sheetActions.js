import managedStore from '../store';

import { POSTING_CREATE_SHEET } from './sheetTypes';

export const createdSheet = async newSheetData => {
   managedStore.store.dispatch({ type: POSTING_CREATE_SHEET, payload: newSheetData });
};
