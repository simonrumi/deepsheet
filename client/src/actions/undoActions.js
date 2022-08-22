import managedStore from '../store';
import {
   UNDO,
   REDO,
   STARTED_UNDOABLE_ACTION,
   COMPLETED_UNDOABLE_ACTION,
   STARTED_EDITING,
   FINISHED_EDITING,
	SHOWED_UNDO_HISTORY,
	HID_UNDO_HISTORY,
} from './undoTypes';
import { hideAllPopups } from './index';

export const undid = (action = null) => {
   managedStore.store.dispatch({ type: UNDO, payload: action });
   hideAllPopups();
};

export const redid = (action = null) => {
   managedStore.store.dispatch({ type: REDO, payload: action });
   hideAllPopups();
};

export const startedUndoableAction = info => {
   managedStore.store.dispatch({ type: STARTED_UNDOABLE_ACTION, payload: info });
};

export const completedUndoableAction = info => {
   managedStore.store.dispatch({ type: COMPLETED_UNDOABLE_ACTION, payload: info });
};

export const startedEditing = initialValue => {
   managedStore.store.dispatch({ type: STARTED_EDITING, payload: initialValue });
};

export const finishedEditing = editData => {
	console.log('undoActions--finishedEditing got', editData);
   managedStore.store.dispatch({ type: FINISHED_EDITING, payload: editData });
};

export const showedUndoHistory = () => {
   managedStore.store.dispatch({ type: SHOWED_UNDO_HISTORY });
};

export const hidUndoHistory = () => {
   managedStore.store.dispatch({ type: HID_UNDO_HISTORY });
};