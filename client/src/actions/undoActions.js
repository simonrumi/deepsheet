import managedStore from '../store';
import {
   UNDO,
   REDO,
   STARTED_UNDOABLE_ACTION,
   COMPLETED_UNDOABLE_ACTION,
   STARTED_EDITING,
   FINISHED_EDITING,
} from './undoTypes';
import { hideAllPopups } from './index';

export const undid = () => {
   managedStore.store.dispatch({ type: UNDO });
   hideAllPopups();
};

export const redid = () => {
   managedStore.store.dispatch({ type: REDO });
   hideAllPopups();
};

export const startedUndoableAction = message => {
   managedStore.store.dispatch({ type: STARTED_UNDOABLE_ACTION, payload: message });
};

export const completedUndoableAction = message => {
   managedStore.store.dispatch({ type: COMPLETED_UNDOABLE_ACTION, payload: message });
};

export const startedEditing = initialValue => {
   managedStore.store.dispatch({ type: STARTED_EDITING, payload: initialValue });
};

export const finishedEditing = editData => {
   managedStore.store.dispatch({ type: FINISHED_EDITING, payload: editData });
};