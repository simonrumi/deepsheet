import managedStore from '../store';
import { isSomething } from '../helpers';
import {
   TOGGLED_SHOW_FILTER_MODAL,
   HIDE_FILTERED,
   CLEAR_ALL_FILTERS,
   CHANGED_FILTER_VALUE,
   CHANGED_REGEX_VALUE,
   CHANGED_CASE_SENSITIVE_VALUE,
   FILTER_EDIT_CANCELLED
} from './filterTypes';
import { STARTED_UNDOABLE_ACTION, COMPLETED_UNDOABLE_ACTION } from './undoTypes';

export const toggledShowFilterModal = (rowIndex, columnIndex, initialValues) => {
   const showModal = isSomething(rowIndex) || isSomething(columnIndex);
   if (showModal) {
      managedStore.store.dispatch({ type: STARTED_UNDOABLE_ACTION });
   } else {
      managedStore.store.dispatch({ type: COMPLETED_UNDOABLE_ACTION, payload: 'updated the filter' });
   }
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
};

export const changedFilterValue = newFilter => {
   managedStore.store.dispatch({
      type: CHANGED_FILTER_VALUE,
      payload: newFilter,
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
};
