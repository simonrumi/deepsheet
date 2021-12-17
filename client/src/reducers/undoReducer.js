import * as R from 'ramda';
import { COMPLETED_SAVE_UPDATES } from '../actions/types';
import {
   UNDO,
   REDO,
   STARTED_UNDOABLE_ACTION,
   COMPLETED_UNDOABLE_ACTION,
   CANCELLED_UNDOABLE_ACTION,
   STARTED_EDITING,
   FINISHED_EDITING,
	EDIT_CELL,
	SHOWED_UNDO_HISTORY, 
	HID_UNDO_HISTORY,
	STARTING_STATE,
} from '../actions/undoTypes';
import { TITLE_EDIT_CANCELLED, STARTED_EDITING_TITLE, FINISHED_EDITING_TITLE } from '../actions/titleTypes';
import { arrayContainsSomething, isSomething, isNothing, reduceWithIndex } from '../helpers';
import { stateOriginalValue, cellText, cellRow, cellColumn } from '../helpers/dataStructureHelpers';
import { startMessage } from '../components/displayText';
import { LOG } from '../constants';
import { log } from '../clientLogger';

// TODO update the title edit stuff to use the new system

const updateHistory = ({ startedActions, pastActions, presentAction, completedAction, actionCancelled = false }) => {
	// completedAction & presentAction should look like this { undoableType, message, timestamp }
	const reversedStartedActions = R.pipe(
		R.sortBy(R.prop('timestamp')), 
		R.reverse
	)(startedActions);
	console.log(
      'undoReducer--updateHistory got actionCancelled',
      actionCancelled,
      'reversedStartedActions',
      reversedStartedActions,
      'completedAction',
      completedAction,
      'pastActions',
      pastActions,
		'presentAction',
		presentAction,
   );
	const { newStartedActions, newPastActions, newPresentAction } = reduceWithIndex(
      (accumulator, currentStartedAction, startedActionIndex) => {
			console.log('undoReducer--updateHistory--reduceWithIndex got accumulator', accumulator, 'currentStartedAction', currentStartedAction);
         if (R.prop('undoableType', completedAction) === R.prop('undoableType', currentStartedAction)) {
				const newPastActions = actionCancelled || isNothing(presentAction)
               ? R.prop('newPastActions', accumulator) // the action has been cancelled, or there's no presentAction, so don't record a new undoableAction
               : R.append(presentAction, R.prop('newPastActions', accumulator));
				const newStartedActions = R.remove(startedActionIndex, 1, reversedStartedActions);
				console.log(
               'undoReducer--updateHistory got newPastActions',
               newPastActions,
               'newStartedActions',
               newStartedActions,
               'newPresentAction will be calculated from actionCancelled ? newPresentAction : completedAction ...where actionCancelled',
               actionCancelled,
					'accumulator.newPresentAction',
					accumulator.newPresentAction,
					'completedAction',
					completedAction
            );
            return R.reduced({
               newPastActions,
               newStartedActions,
               newPresentAction: actionCancelled ? accumulator.newPresentAction : completedAction,
            });
         }
         return accumulator;
      },
      {
         newStartedActions: reversedStartedActions,
         newPastActions: pastActions,
         newPresentAction: presentAction,
      }, //initial values of the "new" actions are the current actions
      reversedStartedActions
   );
	console.log(
      'undoReducer--updateHistory will return newPastActions',
      newPastActions,
      'newStartedActions',
      newStartedActions,
      'newPresentAction',
      newPresentAction
   );
	return {
		newStartedActions: R.sortBy(R.prop('timestamp'), newStartedActions),
		newPastActions: R.sortBy(R.prop('timestamp'), newPastActions),
		newPresentAction,
	}
}

const alreadyStartedEditingCell = ({ cell, startedActions }) => R.pipe(
	R.find(
		currentAction =>
			isSomething(currentAction.cell) &&
			cellRow(currentAction.cell) === cellRow(cell) &&
			cellColumn(currentAction.cell) === cellColumn(cell),
	),
	isSomething
)(startedActions);

const getIndexOfAction = ({ action, actionArray }) => R.findIndex(
	currentAction => 
		currentAction.timestamp === action.timestamp && 
		currentAction.message === action.message && 
		currentAction.undoableType === action.undoableType,
	actionArray
);

// put the the current present, then the past items, after the newPresentIndex, at the start of the future
const makeNewFuture = ({ past, present, future, newPresentIndex }) => R.pipe(
	R.slice(newPresentIndex + 1, Infinity),
	R.concat(R.__, R.prepend(present, future)),
)(past);

// put the current present, then the future items, up to the newPresentIndex, at the end of the past
const makeNewPast = ({ past, present, future, newPresentIndex }) => R.pipe(
	R.slice(0, newPresentIndex),
	R.concat(R.append(present, past))
)(future);

const undoReducer = reducer => {
   const initialState = {
      past: [],
      present: reducer(undefined, {}),
      future: [],
		actionHistory: {
			startedActions: [],
			pastActions: [],
			presentAction: { undoableType: STARTING_STATE, message: startMessage(), timestamp: 0 },
			futureActions: [],
			unregisteredActions: [],
			showHistoryModal: false,
		}
   }

   return (state = initialState, action) => {
      const { past, present, future, actionHistory, maybePast } = state;
		const { startedActions, pastActions, presentAction, unregisteredActions, futureActions } = actionHistory;
      switch (action.type) {
         case UNDO:
				console.log(
               'undoReducer UNDO, startedActions',
               startedActions,
               'pastActions',
               pastActions,
               'presentAction',
               presentAction,
               'unregisteredActions',
               unregisteredActions,
               'futureActions',
               futureActions,
					'action.payload',
					action.payload
            );
            if (!arrayContainsSomething(past)) {
               return state;
            }
				if (arrayContainsSomething(startedActions)) {
					log(
                  { level: LOG.WARN },
                  'Danger! Executing an UNDO, but startedActions contained the following:',
                  startedActions,
                  'So those actions have yet to complete'
               );
				}
				if (isSomething(action.payload)) {
					// payload contains a completedAction like {timestamp: 1639407914057, undoableType: 'edit_cell', message: 'Edited cell G3'}
					const undoIndex = getIndexOfAction({ action: action.payload, actionArray: pastActions });
					console.log('undoReducer UNDO got undoIndex', undoIndex);
					return {
						...state,
						past: R.slice(0, undoIndex, past), // remove all the past after the undoIndex 
						present: R.prop(undoIndex, past), // the present becomes the item from the past that was clicked on
						future: makeNewFuture({ past, present, future, newPresentIndex: undoIndex }),
						actionHistory: {
							...actionHistory,
							pastActions: R.slice(0, undoIndex, pastActions), // remove all the pastActions after the undoIndex 
							presentAction: R.prop(undoIndex, pastActions), // the presentAction becomes the item from the pastActions that was clicked on
							futureActions: makeNewFuture({ past: pastActions, present: presentAction, future: futureActions, newPresentIndex: undoIndex }),
							startedActions: [], // this should always be empty at this point
						}
					}
				}
				console.log('undoReducer UNDO is doing a regular undo (not from the history list)');
            return {
					...state,
               past: R.slice(0, past.length - 1, past), // take the last element from the past 
               present: R.last(past), // ...and make it the present
               future: R.prepend(present, future), // ...and put the current present at the start of the future
					actionHistory: {
						...actionHistory,
						pastActions: R.slice(0, pastActions.length - 1, pastActions), // remove the last element from the pastActions 
						presentAction: R.last(pastActions), // ...and make it the presentAction
						futureActions: R.prepend(presentAction, futureActions), // ...and put the current presentAction start of the futureActions
						startedActions: [], // this should always be empty at this point
					}
            };

         case REDO:
            if (!arrayContainsSomething(future)) {
               return state;
            }
				if (arrayContainsSomething(startedActions)) {
					log(
                  { level: LOG.WARN },
                  'Danger! Executing a REDO, but startedActions contained the following:',
                  startedActions,
                  'So those actions have yet to complete'
               );
				}
				if (isSomething(action.payload)) {
					const redoIndex = getIndexOfAction({ action: action.payload, actionArray: futureActions });
					return {
						...state,
						past: makeNewPast({ past, present, future, newPresentIndex: redoIndex }),
						present: R.prop(redoIndex, future), // the present becomes the item from the future that was clicked on
						future: R.slice(redoIndex + 1, Infinity, future), // remove everything, up to one after the redoIndex, from the future 
						actionHistory: {
							...actionHistory,
							pastActions: makeNewPast({ past: pastActions, present: presentAction, future: futureActions, newPresentIndex: redoIndex }), 
							presentAction: R.prop(redoIndex, futureActions), // the presentAction becomes the item from the future that was clicked on
							futureActions: R.slice(redoIndex + 1, Infinity, futureActions), // remove everything, up to one after the redoIndex, from the future
							startedActions: [], // this should always be empty at this point
						}
					}
				}
            return {
					...state,
               past: R.append(present, past), // make the current present the last element of the past
               present: R.head(future), // set the present to be the first element of the future
               future: R.slice(1, Infinity, future), // ...and remove that first element from the future
					actionHistory: {
						...actionHistory,
						pastActions: R.append(presentAction, pastActions), // make the current presentAction the last element of the pastActions
						presentAction: R.head(futureActions), // set the presentAction to be the first element of the futureActions
						futureActions: R.slice(1, Infinity, futureActions), // ...and remove that first element from the futureActions
						startedActions: [], // this should always be empty at this point
					}
            }

         case STARTED_UNDOABLE_ACTION:
				console.log('undoReducer STARTED_UNDOABLE_ACTION');
            return startedActions.length === 0 
				? {
               ...state, // keep the future as is
					maybePast: R.assoc('focus', {}, present), // this might become the official past...note that the focus is reset to nothing: we don't want focus remembered when undoing
               present: reducer(present, action), // update the present
					actionHistory: {
						...actionHistory,
						startedActions: R.append(action.payload, startedActions),
					}
            }
				: {
					...state, //keep the future as is, also keep the maybePast as is, because we have the past already recorded it the existing startedAction
					present: reducer(present, action), // update the present
					actionHistory: {
						...actionHistory,
						startedActions: R.append(action.payload, startedActions),
					}
				}

         case COMPLETED_UNDOABLE_ACTION:
				console.log('undoReducer COMPLETED_UNDOABLE_ACTION');
				const { newPastActions, newStartedActions, newPresentAction } = updateHistory({
               startedActions,
               pastActions,
               presentAction,
               completedAction: action.payload,
            });
				console.log(
               'undoReducer COMPLETED_UNDOABLE_ACTION got newStartedActions',
               newStartedActions,
               'newPastActions',
               newPastActions,
               'newPresentAction',
					newPresentAction
            );

				return newStartedActions.length === 0
					? {
						...state,
						past: R.append(state.maybePast, past), // the maybePast now becomes part of the real past
						present: reducer(present, action), // update the present
						future: [], // blow away the future, since we're now taking a new course of action
						maybePast: null, // reset this
						actionHistory: {
							...actionHistory,
							startedActions: newStartedActions,
							pastActions: newPastActions,
							presentAction: newPresentAction,
							futureActions: [], // blow away the future, since we're now taking a new course of action
						}
					}
					: {
						...state, // leave maybePast, future & everything else as is
						present: reducer(present, action), // update the present
						actionHistory: {
							...actionHistory,
							startedActions: newStartedActions,
							pastActions, // while there are still outstanding startedActions, pastActions stays the same...
							presentAction: newPresentAction,
							unregisteredActions: R.append(action.payload, unregisteredActions), //...and the completed action is unregistered
						}
					}

         case CANCELLED_UNDOABLE_ACTION:
				console.log('undoReducer CANCELLED_UNDOABLE_ACTION');
            if (isNothing(maybePast)) {
               return state;
            }
				const updatedActions = updateHistory({
               startedActions,
               pastActions,
					presentAction,
               completedAction: action.payload,
               actionCancelled: true,
            });
				console.log('undoReducer CANCELLED_UNDOABLE_ACTION got updatedActions', updatedActions);
            return {
               ...state, // keep everything as-is
					maybePast: null, // reset this
					actionHistory: {
						...actionHistory,
						startedActions: updatedActions.newStartedActions,
						pastActions: updatedActions.newPastActions,
						presentAction: updatedActions.newPresentAction,
					}
            }

         case STARTED_EDITING:
				// action.payload is the cell	
				console.log('undoReducer STARTED_EDITING for cell', action.payload, 'startedActions', startedActions);
            // this is used by CellInPlaceEditor, when the user starts editing a cell
            // action.payload contains the cell

				return alreadyStartedEditingCell({ cell: action.payload, startedActions })
					? state // don't change anything as we have already recorded that the cell is being edited
					: {
						...state, // keep the past & future as is
						present: reducer(present, action), // update the present
						maybePast: R.assoc('focus', {}, present), // this might become the official past...note that the focus is reset to nothing: we don't want focus remembered when undoing
						original: {
							value: cellText(action.payload),
							row: cellRow(action.payload),
							column: cellColumn(action.payload),
						}, // save the value we started editing for comparison when FINISHED_EDITING
						actionHistory: {
							...actionHistory,
							startedActions : R.append(
								{
									timestamp: Date.now(), 
									undoableType: EDIT_CELL,
									cell: action.payload,
								}, 
								startedActions
							),
						}
					}

         case FINISHED_EDITING:
				console.log('undoReducer FINISHED_EDITING got action.payload', action.payload);
            /**
            * 1. Note that action.payload contains { value, message, isPastingCellRange, actionCancelled }, which is different from what it is for STARTED_EDITING
            * 2. Note that in CellInPLaceEditor.js, the manageBlur() function may call finishedEditing() with the payload.value of null
            * This is to handle the situation where the user hits the esc key without ever having typed in the cell editor 
            * (hence the value doesn't get populated)
            * So then we need to check for the value being exactly null and treat it the same as when the original value 
				* and the payload.value are the same - i.e. don't change the undo history
				* 3. if isPastingCellRange is true, then we should ignore the payload.value and update the past
             */
				if (action.payload.isPastingCellRange ||
					action.payload.value === null || 
					R.equals(stateOriginalValue(state), action.payload.value) ||
					action.payload.actionCancelled ||
					startedActions.length > 1
				) {
					// no change has been made to the cell, or we're pasting a cell range, or the edit was cancelled, or there is some other startedAction yet to complete
					const { newPastActions, newStartedActions, newPresentAction } = updateHistory({ 
						startedActions, 
						pastActions, 
						presentAction,
						completedAction: { 
							timestamp: Date.now(), 
							undoableType: EDIT_CELL,
							message: action.payload.message,
						}, 
						actionCancelled: action.payload.actionCancelled || false,
					});
					console.log(
                  'undoReducer--FINISHED_EDITING determined no change made to the cell and newStartedActions',
                  newStartedActions,
                  'newPastActions',
                  newPastActions,
                  'newPresentAction',
                  newPresentAction
               );
					return {
							...state, // keep the past & future as is
							present: reducer(present, action), // update the present
							original: null, // reset this
							maybePast: action.payload.actionCancelled ? null : state.maybePast, // reset this if we're cancelling, leave as-is otherwise
							actionHistory: {
								...actionHistory, // keep the pastActions & futureActions as they are
								startedActions: newStartedActions,
								presentAction: newPresentAction,
								unregisteredActions: R.append(R.last(newPastActions), unregisteredActions),
							}
						}
				} else {
					// the cell has been edited and we're not pasting a cell range
					const { newPastActions, newStartedActions, newPresentAction } = updateHistory({ 
						startedActions, 
						pastActions,
						presentAction,
						completedAction: {
							timestamp: Date.now(), 
							undoableType: EDIT_CELL,
							message: action.payload.message,
						}, 
						actionCancelled: action.payload.actionCancelled || false,
					});
					console.log('undoReducer--FINISHED_EDITING determined the cell has changed and newStartedActions', newStartedActions, 'newPastActions', newPastActions, 'newPresentAction', newPresentAction);
					return {
						...state,
						future: [], // blow away the future, since we're now taking a new course of action
						past: R.append(state.maybePast, past), // the maybePast now becomes part of the real past
						present: reducer(present, action), // update the present
						original: null, //reset this
						maybePast: null, // reset this
						actionHistory: {
							...actionHistory,
							startedActions:  newStartedActions, 
							pastActions: newPastActions,
							presentAction: newPresentAction,
							futureActions: [], // blow away the future, since we're now taking a new course of action
						},
					}
				}

         case STARTED_EDITING_TITLE:
            return {
               ...state, // keep the past & future as is
               present: reducer(present, action), // update the present
               maybePast: present, // this might become the official past, provided the user doesn't cancel
               original: { value: action.payload }, // save the value we started editing for comparison when FINISHED_EDITING_TITLE
            }

            case FINISHED_EDITING_TITLE:
               return R.equals(stateOriginalValue(state), action.payload)
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

            case TITLE_EDIT_CANCELLED:
               return {
                  ...state, // keep the past & future as is
                  present: reducer(present, action), // update the present
                  maybePast: null, // reset this
                  original: null // reset this
               }

         case COMPLETED_SAVE_UPDATES:
            return {
               ...state,
					// reset the undo history after a save
               past: [], 
               future: [],
					actionHistory: initialState.actionHistory, // TODO test this works
            }

			case SHOWED_UNDO_HISTORY:
				return { 
					...state, 
					actionHistory: {
						...actionHistory,
						showHistoryModal: true
					}
				};
	
			case HID_UNDO_HISTORY:
				return { 
					...state, 
					actionHistory: {
						...actionHistory,
						showHistoryModal: false
					}
				};
         
         default:
            return {
               ...state, // keep the past and future as-is
               present: reducer(present, action), // update the present
            };
      }
   }
};

export default undoReducer;