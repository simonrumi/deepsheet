import { STARTED_DRAG, ENDED_DRAG } from '../actions/dragTypes';
import managedStore from '../store';

export const startedDrag = data => {
   managedStore.store.dispatch({ type: STARTED_DRAG, payload: data });
};

export const endedDrag = data => {
   managedStore.store.dispatch({ type: ENDED_DRAG });
};