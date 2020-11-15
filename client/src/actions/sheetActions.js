import managedStore from '../store';
import { POSTING_CREATE_SHEET } from './sheetTypes';
import { TRIGGERED_FETCH_SHEET, FETCHING_SHEET, FETCHED_SHEET, FETCH_SHEET_ERROR } from './sheetTypes';

export const createdSheet = async newSheetData => {
   managedStore.store.dispatch({ type: POSTING_CREATE_SHEET, payload: newSheetData });
};

/* single sheet */
export const triggeredFetchSheet = sheetId => {
   managedStore.store.dispatch({ type: TRIGGERED_FETCH_SHEET, payload: sheetId });
};

export const fetchingSheet = ({ sheetId, userId }) => {
   managedStore.store.dispatch({ type: FETCHING_SHEET, payload: { sheetId, userId } });
};

export const fetchedSheet = sheet => {
   managedStore.store.dispatch({ type: FETCHED_SHEET, payload: sheet });
};

export const fetchSheetError = err => {
   managedStore.store.dispatch({ type: FETCH_SHEET_ERROR, payload: err });
};
