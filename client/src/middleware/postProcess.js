import * as R from 'ramda';
import { saveAllUpdates, fetchSheets } from '../services/sheetServices';
import { isSomething, arrayContainsSomething } from '../helpers';
import { saveToLocalStorage } from '../helpers/authHelpers';
import { createSheetsTreeFromArray, validateParentSheetId } from '../helpers/sheetsHelpers';
import {
   stateMetadata,
   stateLastUpdated,
   stateSheetId,
   stateSheets,
} from '../helpers/dataStructureHelpers';
import { SAVE_STATE } from '../actions/authTypes';
import { TRIGGERED_FETCH_SHEET, FETCHED_SHEET } from '../actions/sheetTypes';
import { updatedSheetsTree, sheetsTreeCurrent } from '../actions/sheetsActions';
import { replacedAllMetadata } from '../actions/metadataActions';
import { updateSheetLastAccessed } from '../queries/sheetMutations';
import { 
	UNDO,
	REDO,
	COMPLETED_UNDOABLE_ACTION,
	CANCELLED_UNDOABLE_ACTION,
	FINISHED_EDITING,
} from '../actions/undoTypes';
import { COMPLETED_HIGHLIGHTING_RANGE } from '../actions/cellRangeTypes';
import { FINISHED_EDITING_TITLE, TITLE_EDIT_CANCELLED } from '../actions/titleTypes';
import { CLEARED_FOCUS } from '../actions/focusTypes';
import { LOCAL_STORAGE_STATE_KEY, LOCAL_STORAGE_TIME_KEY, LOCAL_STORAGE_ACTION_KEY } from '../constants';

const runCreateSheetsTree = store => {
   const newSheetsTree = createSheetsTreeFromArray(stateSheets(store.getState()));
   updatedSheetsTree(newSheetsTree);
   sheetsTreeCurrent();
}

/**
 * The purpose of maybeUpdateFromLocalStorage, inconjunction with SAVE_STATE 
 * is to catch the case where the user's login timed out, but there were updates they wanted to make.
 * In that situation the login process refetches the sheet from the db, but the version of the state with the changes 
 * is saved in localStorage. 
 * So we get those saved changes and re-save the updates to the db.
 * This all happens before we run the filterSheet middleware, so that filterSheet will have the correct state to operate on
 */
const maybeUpdateFromLocalStorage = async state => {
   const storedAction = JSON.parse(localStorage.getItem(LOCAL_STORAGE_ACTION_KEY));
   const storedActionTime = JSON.parse(localStorage.getItem(LOCAL_STORAGE_TIME_KEY));
   const storedState = JSON.parse(localStorage.getItem(LOCAL_STORAGE_STATE_KEY));
   const getTimeMs = R.pipe(
      JSON.parse,
      timestamp => new Date(timestamp).getTime()
   );
   if (
      isSomething(storedAction) && 
      (getTimeMs(stateLastUpdated(state)) < getTimeMs(storedActionTime))
   ) {
      if (R.equals(stateSheetId(storedState), stateSheetId(state))) {
         replacedAllMetadata(stateMetadata(storedState));
      }
      await saveAllUpdates(storedState);
		console.log('postProcess--maybeUpdateFromLocalStorage just ran saveAllUpdates using what was in localStorage and will now clear localStorage');
      localStorage.clear();
   }
}

const postProcess = store => next => async action => {
   switch (action.type) {
      case SAVE_STATE:
         saveToLocalStorage(store.getState(), action);
         break;
      
      case TRIGGERED_FETCH_SHEET:
         const state = store.getState();
         try {
            await maybeUpdateFromLocalStorage(state);
         } catch (err) {
            console.error('Attempted to re-do the save after login, but failed');
         }

         if (isSomething(stateSheetId(state))) {
            // also, now that the sheet has been grabbed from the db, update the last accessed time.
            try {
               await updateSheetLastAccessed(stateSheetId(state));
            } catch (err) {
               console.warn('failed to update the last accessed time...not the end of the world');
            }
         }
         break;

      case FETCHED_SHEET:
         // work to do after everything else has completed
         setTimeout(async () => {
            try {
               // build the sheets list for the menu
               const state = store.getState();
               if (isSomething(state)) {
                  if(!arrayContainsSomething(stateSheets(state))) {
                     await fetchSheets();
                  }
                  runCreateSheetsTree(store);
                  // verify the parent sheet
                  validateParentSheetId();
               }
            } catch (err) {
               console.warn('failed to build the sheets list on load of the sheet');
            }
         }, 0); // wait 1 tick to do this
         break;

		case UNDO:
		case REDO:
		case COMPLETED_UNDOABLE_ACTION:
		case CANCELLED_UNDOABLE_ACTION:
		case FINISHED_EDITING:
		case COMPLETED_HIGHLIGHTING_RANGE:
		case CLEARED_FOCUS:
		case FINISHED_EDITING_TITLE:
		case TITLE_EDIT_CANCELLED:
			console.log('postProcess will save managedStore.state to localStorage in 1 tick');
			setTimeout(() => saveToLocalStorage(store.getState()), 0);
			break;

      default:
   }
   return next(action);
}

export default postProcess;