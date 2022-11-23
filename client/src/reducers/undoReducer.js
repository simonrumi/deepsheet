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
	EDIT_TITLE,
	SHOWED_UNDO_HISTORY, 
	HID_UNDO_HISTORY,
	STARTING_STATE,
} from '../actions/undoTypes';
import { UPDATED_FOCUS, CLEARED_FOCUS } from '../actions/focusTypes';
import { TITLE_EDIT_CANCELLED, STARTED_EDITING_TITLE, FINISHED_EDITING_TITLE } from '../actions/titleTypes';
import {
   STARTED_HIGHLIGHTING_RANGE,
   COMPLETED_HIGHLIGHTING_RANGE,
   HIGHLIGHTED_CELL_RANGE,
} from '../actions/cellRangeTypes';
import { arrayContainsSomething, isSomething, isNothing, reduceWithIndex } from '../helpers';
import { stateOriginalValue, stateOriginalFormattedText, cellText, cellRow, cellColumn, cellFormattedText } from '../helpers/dataStructureHelpers';
import { startMessage, editedTitleMessage, unhighlightedRangeMessage } from '../components/displayText';
import { LOG } from '../constants';
import { log } from '../clientLogger';

// we're pasting a cell range, or no change has been made to the cell, or the edit was cancelled,
// or there is some other startedAction yet to complete
const cellNotReallyEdited = ({
   isPastingCellRange,
   formattedText,
   actionCancelled,
   startedActions,
   hasHighlightedRange = false,
   state,
}) => !hasHighlightedRange && (
	isPastingCellRange ||
	formattedText === null ||
	R.equals(stateOriginalFormattedText(state), formattedText) ||
	actionCancelled ||
	startedActions.length > 1
);

const updateHistory = ({ actionHistory, completedAction, actionCancelled = false }) => {
   const { startedActions, pastActions, presentAction } = actionHistory;
   // completedAction & presentAction should look like this { undoableType, message, timestamp }
   const reversedStartedActions = R.pipe(R.sortBy(R.prop('timestamp')), R.reverse)(startedActions);
   if (
      R.prop('undoableType', completedAction) === UPDATED_FOCUS &&
      R.prop('undoableType', presentAction) === HIGHLIGHTED_CELL_RANGE
   ) {
      // there will be no started action, because this happened immediately after highlighting a range
      return {
         newStartedActions: startedActions,
         newPastActions: R.append(presentAction, pastActions),
         newPresentAction: completedAction,
         newFutureActions: [], // blow away the future, since we're now taking a new course of action
      };
   }

   return reduceWithIndex(
      (accumulator, currentStartedAction, startedActionIndex) => {
         if (R.prop('undoableType', completedAction) === R.prop('undoableType', currentStartedAction)) {
            const newPastActions =
               actionCancelled || isNothing(presentAction)
                  ? R.prop('newPastActions', accumulator) // the action has been cancelled, or there's no presentAction, so don't record a new undoableAction
                  : R.append(presentAction, R.prop('newPastActions', accumulator));
            const newStartedActions = R.remove(startedActionIndex, 1, reversedStartedActions);
            return R.reduced({
               newPastActions: newPastActions,
               newStartedActions: newStartedActions,
               newPresentAction: actionCancelled ? presentAction : completedAction,
            });
         }
         return accumulator;
      },
      {
         newStartedActions: reversedStartedActions,
         newPastActions: pastActions,
         newPresentAction: presentAction,
      }, //initial values of the "new" actions are the current actions (more or less)
      reversedStartedActions
   );
};

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
			case STARTED_HIGHLIGHTING_RANGE:
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
				const historyAfterCompletion = updateHistory({
               actionHistory: state.actionHistory,
               completedAction: action.payload,
               actionCancelled: action.payload.actionCancelled || false,
            });

				return historyAfterCompletion.newStartedActions.length === 0
					? {
						...state,
						past: R.append(state.maybePast, past), // the maybePast now becomes part of the real past
						present: reducer(present, action), // update the present
						future: [], // blow away the future, since we're now taking a new course of action
						maybePast: null, // reset this
						actionHistory: {
							...actionHistory,
							startedActions: historyAfterCompletion.newStartedActions,
							pastActions: historyAfterCompletion.newPastActions,
							presentAction: historyAfterCompletion.newPresentAction,
							futureActions: [], // blow away the future, since we're now taking a new course of action
						}
					}
					: {
						...state, // leave maybePast, future & everything else as is
						present: reducer(present, action), // update the present
						actionHistory: {
							...actionHistory, // while there are still outstanding startedActions, pastActions stays the same...
							startedActions: historyAfterCompletion.newStartedActions, 
							presentAction: historyAfterCompletion.newPresentAction,
							unregisteredActions: R.append(action.payload, unregisteredActions), //...and the completed action is unregistered
						}
					}

         case CANCELLED_UNDOABLE_ACTION:
            if (isNothing(maybePast)) {
               return state;
            }
				const updatedActions = updateHistory({
					actionHistory: state.actionHistory,
               completedAction: action.payload,
               actionCancelled: true,
            });
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
				// this is used by CellInPlaceEditor, when the user starts editing a cell
				const { cell } = action.payload;
				return alreadyStartedEditingCell({ cell, startedActions })
					? state // don't change anything as we have already recorded that the cell is being edited
					: {
						...state, // keep the past & future as is
						maybePast: R.assoc('focus', {}, present), // the mabyePast might become the official past...note that the focus is reset to nothing: we don't want focus remembered when undoing
							original: {
							value: cellText(cell),
							row: cellRow(cell),
							column: cellColumn(cell),
							formattedText: cellFormattedText(cell),
						}, // save the value we started editing for comparison when FINISHED_EDITING
						present: reducer(present, action), // update the present
						actionHistory: {
							...actionHistory,
							startedActions : R.append(
								{
									timestamp: Date.now(), 
									undoableType: EDIT_CELL,
									cell,
								}, 
								startedActions
							),
						}
					}

         case FINISHED_EDITING:
            /**
            * 1. Note that action.payload contains { formattedText, message, isPastingCellRange, actionCancelled }, which is different from what it is for STARTED_EDITING
            * 2. Note that in CellInPLaceEditor.js, the manageBlur() function may call finishedEditing() with the payload.formattedText == null
            * This is to handle the situation where the user hits the esc key without ever having typed in the cell editor 
            * So then we need to check for the formattedText being exactly null and treat it the same as when the original formattedText 
				* and the payload.formattedText are the same - i.e. don't change the undo history
				* 3. if isPastingCellRange is true, then we should ignore the payload.value and update the past
             */
				const { newStartedActions, newPastActions, newPresentAction } = updateHistory({
					actionHistory: state.actionHistory,
					completedAction: { 
						timestamp: Date.now(), 
						undoableType: EDIT_CELL,
						message: action.payload.message,
					}, 
					actionCancelled: action.payload.actionCancelled || false,
				});

				// cellNotReallyEdited({ isPastingCellRange, formattedText, actionCancelled, startedActions, hasHighlightedRange, state })

				const isNotRealEdit = cellNotReallyEdited({ 
					isPastingCellRange: action.payload.isPastingCellRange, 
					formattedText: action.payload.formattedText, 
					actionCancelled: action.payload.actionCancelled, 
					startedActions, 
					state
				});

				const historyAfterCellEdit = isNotRealEdit
					? {
						...actionHistory, // keep the pastActions, presentAction & futureActions as they are
						startedActions: R.sortBy(R.prop('timestamp'), newStartedActions),
					}
					: {
						startedActions: R.sortBy(R.prop('timestamp'), newStartedActions),
						pastActions: R.sortBy(R.prop('timestamp'), newPastActions),
						presentAction: newPresentAction,
						futureActions: [], // blow away the future, since we're now taking a new course of action
					};

				if (isNotRealEdit) {
					return {
						...state, // keep the past & future as is
						present: reducer(present, action), // update the present
						original: null, // reset this
						maybePast: action.payload.isPastingCellRange ? state.maybePast : null, // need to keep the maybePast if we're in the middle of pasting the cell range
						actionHistory: historyAfterCellEdit,
					}
				}
				return {
					...state,
					future: [], // blow away the future, since we're now taking a new course of action
					past: R.append(state.maybePast, past), // the maybePast now becomes part of the real past
					present: reducer(present, action), // update the present
					original: null, //reset this
					maybePast: null, // reset this
					actionHistory: historyAfterCellEdit,
				}

			case COMPLETED_HIGHLIGHTING_RANGE:
				const historyAfterRangeHighlight = updateHistory({
					actionHistory: state.actionHistory,
					completedAction: action.payload, 
					actionCancelled: false, // you can't cancel highlighting of a range
				});
				return {
					...state,
					future: [], // blow away the future, since we're now taking a new course of action
					present: reducer(present, action), // update the present, with the range highlight in it
					// the last item in the past should be an edit of the fromCell, but it wasn't really edited, so remove it
					// then then maybePast, before the range highlight, becomes part of the real past
					past: R.pipe(
						R.last,
						R.prop('undoableType'),
						type => type === EDIT_CELL // note that we're not checking which cell was edited. Unlikely that is necessary, but beware
							? R.slice(0, -1, past)
							: past,
						R.append(state.maybePast)
					)(past),
					maybePast: null, // reset this
					actionHistory: {
						pastActions: historyAfterRangeHighlight.newPastActions || [],
						presentAction: historyAfterRangeHighlight.newPresentAction,
						startedActions: historyAfterRangeHighlight.newStartedActions || [],
						futureActions: historyAfterRangeHighlight.newFutureActions || [],
					}, 
				}

			case CLEARED_FOCUS:
			case UPDATED_FOCUS:
				// a special case: after highlighting a cell range, if you click on another cell UPDATED_FOCUS is fired				
				if (state.actionHistory.presentAction.undoableType === HIGHLIGHTED_CELL_RANGE) {
					const historyAfterFoucsUpdate = updateHistory({
						actionHistory: state.actionHistory,
						completedAction: {
							undoableType: UPDATED_FOCUS,
							message: unhighlightedRangeMessage(), 
							timestamp: Date.now()	
						},
						actionCancelled: false,
						value: null,
						state,
					});
					return {
						...state,
						past: R.append(state.present, past), //append the present, with the highlighted range, to the past (no maybePast involved here)
						present: reducer(present, action), // update the present
						future: [], // blow away the future, since we're now taking a new course of action
						actionHistory: {
							pastActions: historyAfterFoucsUpdate.newPastActions || [],
							presentAction: historyAfterFoucsUpdate.newPresentAction,
							startedActions: historyAfterFoucsUpdate.newStartedActions || [],
							futureActions: historyAfterFoucsUpdate.newFutureActions || [],
						},
					}
				}
				return {
					...state,
					present: reducer(present, action), // update the present
				};

         case STARTED_EDITING_TITLE:
            return {
               ...state, // keep the past & future as is
               present: reducer(present, action), // update the present
               maybePast: present, // this might become the official past, provided the user doesn't cancel
               original: { value: action.payload }, // save the value we started editing for comparison when FINISHED_EDITING_TITLE
					actionHistory: {
						...actionHistory,
						startedActions : R.append(
							{
								timestamp: Date.now(), 
								undoableType: EDIT_TITLE,
								title: action.payload,
							}, 
							startedActions
						),
					}
            }

            case FINISHED_EDITING_TITLE:
					// Note that in here we are not testing for startedActions === 0 as we do with COMPLETED_UNDOABLE_ACTION
					// seems unlikely that there would be a situation where something else could start but not complete while editing the title
					const historyAfterEdit = updateHistory({
						actionHistory: state.actionHistory,
						completedAction: { 
							timestamp: Date.now(), 
							undoableType: EDIT_TITLE,
							message: action.payload.message,
						}, 
						actionCancelled: action.payload.actionCancelled || false,
						value: action.payload?.value, // TODO NEXT BUG updateHistory is not taking this .value into account and this causes an error when updating the title
						// state,
					});
               return R.equals(stateOriginalValue(state), action.payload?.value) || 
						action.payload?.actionCancelled ||
						startedActions.length > 1
                  ? { // no change has been made, or the edit was cancelled, or there is some other startedAction yet to complete
                     ...state, // keep the past & future as is
                     present: reducer(present, action), // update the present
                     maybePast: null, // reset this
                     original: null, // reset this,
							actionHistory: {
								...actionHistory,
								startedActions: historyAfterEdit.newStartedActions,
								presentAction: historyAfterEdit.newPresentAction,
								unregisteredActions: R.append(R.last(historyAfterEdit.newPastActions), unregisteredActions),
							}
                  } 
                  : { // the title has been edited
                     ...state,
							future: [], // blow away the future, since we're now taking a new course of action
                     past: R.append(state.maybePast, past), // the maybePast now becomes part of the real past
                     present: reducer(present, action), // update the present
                     original: null, //reset this
                     maybePast: null, // reset this
							actionHistory: {
								...actionHistory,
								startedActions:  historyAfterEdit.newStartedActions, 
								pastActions: historyAfterEdit.newPastActions,
								presentAction: historyAfterEdit.newPresentAction,
								futureActions: [], // blow away the future, since we're now taking a new course of action
							},
                  }

            case TITLE_EDIT_CANCELLED:
					const historyAfterCancel = updateHistory({
						actionHistory: state.actionHistory,
						completedAction: { 
							timestamp: Date.now(), 
							undoableType: EDIT_TITLE,
							message: editedTitleMessage(),
						}, 
						actionCancelled: true,
						value: action.payload?.value, // TODO updateHistory does not take value param ...so BUG updating the title
						state,
					});
               return {
                  ...state, // keep the past & future as is
                  present: reducer(present, action), // update the present
                  maybePast: null, // reset this
                  original: null, // reset this
						actionHistory: {
							...actionHistory, // keep the pastActions & futureActions as they are
							startedActions: historyAfterCancel?.newStartedActions,
							presentAction: historyAfterCancel?.newPresentAction,
						}
               }

         case COMPLETED_SAVE_UPDATES:
            return {
               ...state,
					// reset the undo history after a save
               past: [], 
               future: [],
					actionHistory: initialState.actionHistory,
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