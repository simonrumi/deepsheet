import managedStore from '../store';
import { isSomething } from '../helpers';
import { TOGGLED_SHOW_SORT_MODAL, SORT_CANCELLED } from './sortTypes';

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