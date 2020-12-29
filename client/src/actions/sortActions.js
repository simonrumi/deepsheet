import managedStore from '../store';
import { isSomething } from '../helpers';
import {
   TOGGLED_SHOW_SORT_MODAL,
   SORT_CANCELLED,
   UPDATED_SORT_OPTIONS,
   SORTED_AXIS,
   CLEARED_SORT_OPTIONS,
} from './sortTypes';

export const toggledShowSortModal = (rowIndex, columnIndex) => {
   const showModal = isSomething(rowIndex) || isSomething(columnIndex);
   managedStore.store.dispatch({
      type: TOGGLED_SHOW_SORT_MODAL,
      payload: { showModal, rowIndex, columnIndex },
   });
};

export const sortCancelled = () => {
   managedStore.store.dispatch({ type: SORT_CANCELLED });
};

export const sortedAxis = () => {
   managedStore.store.dispatch({
      type: SORTED_AXIS,
      payload: null,
   });
};

export const updatedSortOptions = sortOptions => {
   managedStore.store.dispatch({
      type: UPDATED_SORT_OPTIONS,
      payload: sortOptions,
   });
};

export const clearedSortOptions = () => {
   managedStore.store.dispatch({
      type: CLEARED_SORT_OPTIONS,
      payload: null,
   });
};