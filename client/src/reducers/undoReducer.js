import * as R from 'ramda';
import { COMPLETED_SAVE_UPDATES } from '../actions/types';
import { UNDO, REDO, STARTED_UNDOABLE_ACTION, COMPLETED_UNDOABLE_ACTION } from '../actions/undoTypes';

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
            return {
               past: R.slice(0, past.length - 1, past), // take the last element from the past 
               present: R.last(past), // ...and make it the present
               future: R.prepend(present, future) // ...and put the current present at the start of the future
            };

         case REDO:
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
            };

         case COMPLETED_UNDOABLE_ACTION:
            return {
               ...state, // keep the past as-is (see STARTED_UNDOABLE_ACTION above)
               present: reducer(present, action), // update the present
               future: [] // blow away the future, since we're now taking a new course of action
            };

         case COMPLETED_SAVE_UPDATES:
            return {
               ...state,
               past: [], // blow away past
               future: [] // ...and the future, to reset the undo history after a save
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