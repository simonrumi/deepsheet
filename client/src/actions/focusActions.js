import managedStore from '../store';
import { UPDATED_FOCUS, CLEARED_FOCUS, HIGHLIGHTED_CELL_RANGE } from './focusTypes';

export const focusedCell = cellData => {
   managedStore.store.dispatch({
      type: UPDATED_FOCUS,
      payload: { cell: cellData },
   });
};

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

