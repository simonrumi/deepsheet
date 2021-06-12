import managedStore from '../store';
import {
   UPDATED_FOCUS,
   UPDATED_FOCUS_REF,
   UPDATED_FOCUS_ABORT_CONTROL,
   CLEARED_FOCUS,
   HIGHLIGHTED_CELL_RANGE,
} from './focusTypes';

export const focusedCell = cellData => {
   managedStore.store.dispatch({
      type: UPDATED_FOCUS,
      payload: { cell: cellData },
   });
};

export const updatedFocusRef = ref => {
   managedStore.store.dispatch({
      type: UPDATED_FOCUS_REF,
      payload: { ref },
   });
}

export const updatedFocusAbortControl = (abortControl, cell) => {
   managedStore.store.dispatch({
      type: UPDATED_FOCUS_ABORT_CONTROL,
      payload: { abortControl, cell },
   })
}

export const clearedFocus = () => {
   managedStore.store.dispatch({
      type: CLEARED_FOCUS,
   });
};

export const highlightedCellRange = cellData => {
   managedStore.store.dispatch({
      type: HIGHLIGHTED_CELL_RANGE,
      payload: { cell: cellData }
   });
};

