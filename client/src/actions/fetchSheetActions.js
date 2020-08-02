import managedStore from '../store';
import { UPDATED_SHEET_ID, FETCHING_SHEET, FETCHED_SHEET, FETCH_SHEET_ERROR } from './fetchSheetTypes';

/* single sheet */
export const updatedSheetId = sheetId => {
   managedStore.store.dispatch({ type: UPDATED_SHEET_ID, payload: sheetId });
};

export const fetchingSheet = sheetId => {
   managedStore.store.dispatch({ type: FETCHING_SHEET, payload: sheetId });
};

export const fetchedSheet = sheet => {
   managedStore.store.dispatch({ type: FETCHED_SHEET, payload: sheet });
};

export const fetchSheetError = err => {
   managedStore.store.dispatch({ type: FETCH_SHEET_ERROR, payload: err });
};
