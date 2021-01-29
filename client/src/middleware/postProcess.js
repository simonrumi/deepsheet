import * as R from 'ramda';
import { saveAllUpdates } from '../services/sheetServices';
import { isSomething } from '../helpers';
import { saveToLocalStorage } from '../helpers/authHelpers';
import { stateMetadata, stateLastUpdated, stateSheetId } from '../helpers/dataStructureHelpers';
import { SAVE_STATE } from '../actions/authTypes';
import { TRIGGERED_FETCH_SHEET } from '../actions/sheetTypes';
import { replacedAllMetadata } from '../actions/metadataActions';
import { updateSheetLastAccessed } from '../queries/sheetMutations';
import { LOCAL_STORAGE_STATE_KEY, LOCAL_STORAGE_TIME_KEY, LOCAL_STORAGE_ACTION_KEY } from '../constants';

/**
 * The purpose of this post-processing is to catch the case where the user's login timed out, but there were updates they wanted to make.
 * In that situation the login process refetches the sheet from the db, but the version of the state with the changes 
 * is saved in localStorage. 
 * So we get those saved changes and re-save the updates to the db.
 * This all happens before we run the filterSheet middleware, so that filterSheet will have the correct state to operate on
 */
export default store => next => async action => {
   switch (action.type) {
      case SAVE_STATE:
         saveToLocalStorage(store.getState(), action);
         break;

      case TRIGGERED_FETCH_SHEET:
         const state = store.getState();
         try {
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
               localStorage.clear();
            }
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

      default:
   }
   return next(action);
}