import managedStore from '../store';
import { UPDATED_FOCUS, CLEARED_FOCUS } from './focusTypes';

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
