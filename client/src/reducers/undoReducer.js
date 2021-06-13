import * as R from 'ramda';
import { COMPLETED_SAVE_UPDATES } from '../actions/types';
import {
   UNDO,
   REDO,
   STARTED_UNDOABLE_ACTION,
   COMPLETED_UNDOABLE_ACTION,
   STARTED_EDITING,
   FINISHED_EDITING,
} from '../actions/undoTypes';
import { arrayContainsSomething } from '../helpers';
import { stateOriginalValue, cellText, cellRow, cellColumn } from '../helpers/dataStructureHelpers';

const undoReducer = reducer => {
   const initialState = {
      past: [],
      present: reducer(undefined, {}),
      future: []
   }
   return (state = initialState, action) => {
      const { past, present, future }  = state;
      switch (action.type) {
         case UNDO:
            if (!arrayContainsSomething(past)) {
               return state;
            }
            return {
               past: R.slice(0, past.length - 1, past), // take the last element from the past 
               present: R.last(past), // ...and make it the present
               future: R.prepend(present, future) // ...and put the current present at the start of the future
            };

         case REDO:
            if (!arrayContainsSomething(future)) {
               return state;
            }
            return {
               past: R.append(present, past), // make the present the last element of the past
               present: R.head(future), // set the present to be the first element of the future
               future: R.slice(1, Infinity, future) // ...and remove that first element from the future
            }

         case STARTED_UNDOABLE_ACTION:
            return {
               ...state, // keep the future as is
               past: R.append(present, past), // put the current "present" at the end of the past
               present: reducer(present, action), // update the present
            }

         case COMPLETED_UNDOABLE_ACTION:
            return {
               ...state, // keep the past as-is (see STARTED_UNDOABLE_ACTION above)
               present: reducer(present, action), // update the present
               future: [], // blow away the future, since we're now taking a new course of action
            }

         case STARTED_EDITING:
            // this is used by CellInPlaceEditor, when the user starts editing a cell
            // action.payload contains the cell
            return {
               ...state, // keep the past & future as is
               present: reducer(present, action), // update the present
               maybePast: R.assoc('focus', {}, present), // this might become the official past...note that the focus is reset to nothing: we don't want focus remembered when undoing
               original: {
                  value: cellText(action.payload),
                  row: cellRow(action.payload),
                  column: cellColumn(action.payload),
               } // save the value we started editing for comparison when FINISHED_EDITING
            }
         
         case FINISHED_EDITING:
            /**
            * 1. Note that action.payload contains { value, message }, which is different from what it is for STARTED_EDITING
            * 2. Note that in CellInPLaceEditor.js, the manageBlur() function may call finishedEditing() with the payload.value of null
            * This is to handle the situation where the user hits the esc key without ever having typed in the cell editor 
            * (hence the value doesn't get populated)
            * So here we need to check for the value being exactly null and treat it the same as when the original value and the payload.value are the same
             */
            return action.payload.value === null || R.equals(stateOriginalValue(state), action.payload.value)
               ? {
                  ...state, // keep the past & future as is
                  present: reducer(present, action), // update the present
                  maybePast: null, // reset this
                  original: null // reset this
               }
               : {
                  ...state, // keep the future as is
                  past: R.append(state.maybePast, past), // the maybePast now becomes part of the real past
                  present: reducer(present, action), // update the present
                  original: null, //reset this
                  maybePast: null, // reset this
               }

         case COMPLETED_SAVE_UPDATES:
            return {
               ...state,
               past: [], // blow away past
               future: [], // ...and the future, to reset the undo history after a save
               undoableActionInProgress: false,
            }
         
         default:
            return {
               ...state, // keep the past and future as-is
               present: reducer(present, action), // update the present
            };
      }
   }
};

export default undoReducer;