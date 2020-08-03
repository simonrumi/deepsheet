import managedStore from '../store';
import {
   FETCHING_SHEETS,
   FETCHED_SHEETS,
   FETCH_SHEETS_ERROR,
   DELETING_SHEETS,
   DELETED_SHEETS,
   DELETE_SHEETS_ERROR,
} from './sheetsTypes';

export const fetchingSheets = () => {
   managedStore.store.dispatch({ type: FETCHING_SHEETS });
};

export const fetchedSheets = sheets => {
   managedStore.store.dispatch({ type: FETCHED_SHEETS, payload: sheets });
};

export const fetchSheetsError = err => {
   managedStore.store.dispatch({ type: FETCH_SHEETS_ERROR, payload: err });
};

export const deletingSheets = () => {
   managedStore.store.dispatch({ type: DELETING_SHEETS });
};

export const deletedSheets = newSheets => {
   managedStore.store.dispatch({ type: DELETED_SHEETS, payload: newSheets });
};

export const deleteSheetsError = err => {
   managedStore.store.dispatch({ type: DELETE_SHEETS_ERROR, payload: err });
};
