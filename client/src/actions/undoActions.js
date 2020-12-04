import managedStore from '../store';
import { UNDO, REDO, STARTED_UNDOABLE_ACTION, COMPLETED_UNDOABLE_ACTION, STARTED_EDITING, FINISHED_EDITING } from './undoTypes';

export const undid = () => {
   managedStore.store.dispatch({ type: UNDO });
};

export const redid = () => {
   managedStore.store.dispatch({ type: REDO });
};

export const startedUndoableAction = message => {
   console.log('undoActions dispatching STARTED_UNDOABLE_ACTION:', message);
   managedStore.store.dispatch({ type: STARTED_UNDOABLE_ACTION, payload: message });
};

export const completedUndoableAction = message => {
   console.log('undoActions dispatching COMPLETED_UNDOABLE_ACTION:', message);
   managedStore.store.dispatch({ type: COMPLETED_UNDOABLE_ACTION, payload: message });
};

export const startedEditing = initialValue => {
   console.log('undoActions dispatching STARTED_EDITING:', initialValue);
   managedStore.store.dispatch({ type: STARTED_EDITING, payload: initialValue });
};

export const finishedEditing = finalValue => {
   console.log('undoActions dispatching FINISHED_EDITING with finalValue:', finalValue);
   managedStore.store.dispatch({ type: FINISHED_EDITING, payload: finalValue });
};