export const UNDO = 'undo';
export const REDO = 'redo';
export const STARTED_UNDOABLE_ACTION = 'started_undoable_action';
export const COMPLETED_UNDOABLE_ACTION = 'completed_undoable_action';
export const CANCELLED_UNDOABLE_ACTION = 'cancelled_undoable_action';
export const STARTED_EDITING = 'started_editing';
export const FINISHED_EDITING = 'finished_editing';
export const SHOWED_UNDO_HISTORY = 'showed_undo_history';
export const HID_UNDO_HISTORY = 'hid_undo_history';

// these are not for an action, but the name of the action type within the action history
export const EDIT_CELL = 'edit_cell'; 
export const STARTING_STATE = 'starting_state';