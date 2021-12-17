import managedStore from '../store';
import { isSomething } from '../helpers';
import {
	FILTER_EDIT,
   TOGGLED_SHOW_FILTER_MODAL,
   HIDE_FILTERED,
   CLEAR_ALL_FILTERS,
   CHANGED_FILTER_VALUE,
   CHANGED_HIDE_BLANKS_VALUE,
   CHANGED_REGEX_VALUE,
   CHANGED_CASE_SENSITIVE_VALUE,
   FILTER_EDIT_CANCELLED
} from './filterTypes';
import { STARTED_UNDOABLE_ACTION, CANCELLED_UNDOABLE_ACTION } from './undoTypes';
import { CELLS_UPDATED } from './cellTypes';
import { REPLACED_COLUMN_FILTERS, REPLACED_ROW_FILTERS } from './metadataTypes';

export const toggledShowFilterModal = (rowIndex, columnIndex, initialValues) => {
   const showModal = isSomething(rowIndex) || isSomething(columnIndex);
   if (showModal) {
		console.log('filterAction--toggledShowFilterModal about to dispatch STARTED_UNDOABLE_ACTION');
      managedStore.store.dispatch({ type: STARTED_UNDOABLE_ACTION, payload: { undoableType: FILTER_EDIT, timestamp: Date.now() } });
   } // note that COMPLETED_UNDOABLE_ACTION is fired by metadataActions--hasChangedMetadata 
   // and filterEditCancelled below fires CANCELLED_UNDOABLE_ACTION

   managedStore.store.dispatch({
      type: TOGGLED_SHOW_FILTER_MODAL,
      payload: { showModal, rowIndex, columnIndex, initialValues },
   });
};

export const updatedFilter = (filterOptions, isInitializingSheet) => {
   if (!isInitializingSheet) {
      managedStore.store.dispatch({ type: TOGGLED_SHOW_FILTER_MODAL });
   }
   managedStore.store.dispatch({
      type: HIDE_FILTERED,
      payload: { filterOptions, isInitializingSheet },
   });
};

export const clearedAllFilters = () => {
   managedStore.store.dispatch({
      type: CLEAR_ALL_FILTERS,
   });
   managedStore.store.dispatch({
      type: CELLS_UPDATED,
      payload: { changeType: REPLACED_COLUMN_FILTERS, data: [] }
   });
   managedStore.store.dispatch({
      type: CELLS_UPDATED,
      payload: { changeType: REPLACED_ROW_FILTERS, data: [] }
   });
};

export const changedFilterValue = newFilter => {
   managedStore.store.dispatch({
      type: CHANGED_FILTER_VALUE,
      payload: newFilter,
   });
}

export const changedHideBlanksValue = newHideBlanks => {
   managedStore.store.dispatch({
      type: CHANGED_HIDE_BLANKS_VALUE,
      payload: newHideBlanks,
   });
}

export const changedRegexValue = newRegex => {
   managedStore.store.dispatch({
      type: CHANGED_REGEX_VALUE,
      payload: newRegex,
   });
}

export const changedCaseSensitiveValue = newCaseSensitive => {
   managedStore.store.dispatch({
      type: CHANGED_CASE_SENSITIVE_VALUE,
      payload: newCaseSensitive,
   });
}


export const filterEditCancelled = wasStale => {
   managedStore.store.dispatch({ type: FILTER_EDIT_CANCELLED, payload: wasStale });
   managedStore.store.dispatch({ type: CANCELLED_UNDOABLE_ACTION, payload: { undoableType: FILTER_EDIT, message: FILTER_EDIT_CANCELLED, timestamp: Date.now() } });
};
