import { POSTING_UPDATED_CELLS } from '../actions/cellTypes';
import { TRIGGERED_FETCH_SHEET } from '../actions/sheetTypes';
import { POSTING_UPDATED_METADATA } from '../actions/metadataTypes';
import { FETCHING_SHEETS } from '../actions/sheetsTypes';
import { POSTING_CREATE_SHEET } from '../actions/sheetTypes';
import { POSTING_UPDATED_TITLE } from '../actions/titleTypes';
import { getUserInfoFromCookie } from '../helpers/userHelpers';
import { promptLogin } from '../actions/authActions';
import { stateIsLoggedIn } from '../helpers/dataStructureHelpers';

export default store => next => async action => {
   switch (action.type) {
      case POSTING_UPDATED_CELLS:
      case TRIGGERED_FETCH_SHEET:
      case POSTING_UPDATED_METADATA:
      case FETCHING_SHEETS:
      case POSTING_CREATE_SHEET:
      case POSTING_UPDATED_TITLE:
         const isLoggedIn = stateIsLoggedIn(store.getState());
         if (isLoggedIn === false) {
            // note that we don't use !isLoggedIn because we want to ignore the case where it is undefined, 
            // which probably means we haven't yet figured out whether we're logged in or not
            promptLogin();
            return next(action);
         }
         const { userId, sessionId } = getUserInfoFromCookie();
         if (!userId || !sessionId) {
            promptLogin();
         }
         break;

      default:
   }
   return next(action);
};
