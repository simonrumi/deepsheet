import managedStore from '../store';
import {
   FETCHING_SHEETS,
   FETCHED_SHEETS,
   FETCH_SHEETS_ERROR,
   DELETING_SHEET,
   DELETED_SHEET,
   DELETE_SHEET_ERROR,
   DELETING_SHEETS,
   DELETED_SHEETS,
   DELETE_SHEETS_ERROR,
   UPDATED_SHEETS_TREE,
   UPDATED_SHEETS_TREE_NODE,
   SHEETS_TREE_STALE,
   SHEETS_TREE_CURRENT,
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

/* singular sheet deletion */
export const deletingSheet = () => {
   managedStore.store.dispatch({ type: DELETING_SHEET });
};

export const deletedSheet = newSheets => {
   managedStore.store.dispatch({ type: DELETED_SHEET, payload: newSheets });
};

export const deleteSheetError = err => {
   managedStore.store.dispatch({ type: DELETE_SHEET_ERROR, payload: err });
};

/* multiple sheets deletion */
export const deletingSheets = () => {
   managedStore.store.dispatch({ type: DELETING_SHEETS });
};

export const deletedSheets = newSheets => {
   managedStore.store.dispatch({ type: DELETED_SHEETS, payload: newSheets });
};

export const deleteSheetsError = err => {
   managedStore.store.dispatch({ type: DELETE_SHEETS_ERROR, payload: err });
};

export const updatedSheetsTree = tree => {
   managedStore.store.dispatch({ type: UPDATED_SHEETS_TREE, payload: tree });
};

export const updatedSheetsTreeNode = updatedNode => {
   managedStore.store.dispatch({ type: UPDATED_SHEETS_TREE_NODE, payload: updatedNode });
}

export const sheetsTreeStale = () => {
   managedStore.store.dispatch({ type: SHEETS_TREE_STALE });
}

export const sheetsTreeCurrent = () => {
   managedStore.store.dispatch({ type: SHEETS_TREE_CURRENT });
}
