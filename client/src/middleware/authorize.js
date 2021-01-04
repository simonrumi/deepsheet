import { POSTING_UPDATED_CELLS } from '../actions/cellTypes';
import { TRIGGERED_FETCH_SHEET } from '../actions/sheetTypes';
import { POSTING_UPDATED_METADATA } from '../actions/metadataTypes';
import { promptLogin } from '../actions/authActions';
import { FETCHING_SHEETS } from '../actions/sheetsTypes';
import { POSTING_CREATE_SHEET } from '../actions/sheetTypes';
import { POSTING_UPDATED_TITLE } from '../actions/titleTypes';
import { getUserInfoFromCookie } from '../helpers/userHelpers';
import { stateIsLoggedIn } from '../helpers/dataStructureHelpers';
import { LOCAL_STORAGE_STATE_KEY, LOCAL_STORAGE_ACTION_KEY, LOCAL_STORAGE_TIME_KEY } from '../constants';

const saveToLocalStorage = (state, action) => {
   window.localStorage.clear();
   window.localStorage.setItem(LOCAL_STORAGE_STATE_KEY, JSON.stringify(state));
   window.localStorage.setItem(LOCAL_STORAGE_ACTION_KEY, JSON.stringify(action));
   window.localStorage.setItem(LOCAL_STORAGE_TIME_KEY, Date.now());
}

export default store => next => async action => {
   switch (action.type) {
      case POSTING_UPDATED_CELLS:
      case TRIGGERED_FETCH_SHEET:
      case POSTING_UPDATED_METADATA:
      case FETCHING_SHEETS:
      case POSTING_CREATE_SHEET:
      case POSTING_UPDATED_TITLE:
         const state = store.getState();
         const isLoggedIn = stateIsLoggedIn(state);
         if (isLoggedIn === false) {
            // note that we don't use !isLoggedIn because we want to ignore the case where it is undefined, 
            // which means we haven't yet figured out whether we're logged in or not
            saveToLocalStorage(state, action);
            promptLogin();
            return next(action);
         }
         const { userId, sessionId } = getUserInfoFromCookie();
         if (!userId || !sessionId) {
            saveToLocalStorage(state, action);
            promptLogin();
         }
         break;

      default:
   }
   return next(action);
};
