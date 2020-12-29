import { TOGGLED_SHOW_SORT_MODAL, SORT_CANCELLED } from '../actions/sortTypes';
import { isNothing } from '../helpers';

// TODO - return to grid creation stuff and deal with adding rows/columns
// TODO - after a redo, try clear all popups, so we just see the results, not the popup

const sortModalReducer = (state = { showSortModal: false }, action) => {
   const modalHiddenState = {
      showSortModal: false,
      rowIndex: null,
      columnIndex: null,
   }
   switch (action.type) {
      case TOGGLED_SHOW_SORT_MODAL:
         if (isNothing(action.payload)) {
            return modalHiddenState;
         }
         const { showModal, rowIndex, columnIndex } = action.payload;
         if (!showModal) {
            return modalHiddenState;
         }
         return {
            ...state,
            showSortModal: true,
            rowIndex,
            columnIndex,
         }

      case SORT_CANCELLED:
         console.log('sortModalReducer got SORT_CANCELLED');
         return modalHiddenState;

      default:
         return state;
   }

}

export default sortModalReducer;