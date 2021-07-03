import managedStore from '../store';
import {
   UPDATED_FOCUS,
   UPDATED_FOCUS_REF,
   UPDATED_FOCUS_ABORT_CONTROL,
   CLEARED_FOCUS,
   HIGHLIGHTED_CELL_RANGE,
   CLEARED_CELL_RANGE,
   UPDATED_FROM_CELL,
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

export const clearedCellRange = cellData => {
   managedStore.store.dispatch({
      type: CLEARED_CELL_RANGE,
      payload: { cell: cellData }
   });
}

export const updatedFromCell = cell => {
   managedStore.store.dispatch({
      type: UPDATED_FROM_CELL,
      payload: cell
   });
}