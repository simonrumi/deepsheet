import { POSTING_UPDATED_CELLS } from '../actions/cellTypes';
import { TRIGGERED_FETCH_SHEET } from '../actions/sheetTypes';
import { POSTING_UPDATED_METADATA } from '../actions/metadataTypes';
import { promptLogin } from '../actions/authActions';
import { FETCHING_SHEETS } from '../actions/sheetsTypes';
import { POSTING_CREATE_SHEET } from '../actions/sheetTypes';
import { POSTING_UPDATED_TITLE } from '../actions/titleTypes';
import { getUserInfoFromCookie } from '../helpers/userHelpers';
import { stateIsLoggedIn } from '../helpers/dataStructureHelpers';
import { saveToLocalStorage } from '../helpers/authHelpers';

const authorize = store => next => async action => {
   switch (action.type) {
      case POSTING_UPDATED_CELLS:
      case TRIGGERED_FETCH_SHEET:
      case POSTING_UPDATED_METADATA:
      case FETCHING_SHEETS:
      case POSTING_CREATE_SHEET:
      case POSTING_UPDATED_TITLE:
         const state = store.getState();
         const isLoggedIn = stateIsLoggedIn(state);
			console.log('authorize, from state, got isLoggedIn', isLoggedIn, 'if false we will promptLogin(), otherwise will next(action) for action.type', action.type);
         if (isLoggedIn === false) {
            // note that we don't use !isLoggedIn because we want to ignore the case where it is undefined, 
            // which means we haven't yet figured out whether we're logged in or not
            saveToLocalStorage(state, action);
            promptLogin();
            return next(action);
         }
         const { userId, sessionId } = getUserInfoFromCookie();
			console.log('authorize, from cookie, got userId', userId, 'sessionId', sessionId);
         if (!userId || !sessionId) {
            saveToLocalStorage(state, action);
            promptLogin();
         }
         break;

      default:
   }
   return next(action);
};

export default authorize;
