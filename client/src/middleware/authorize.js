import { POSTING_UPDATED_CELLS } from '../actions/cellTypes';
import { UPDATED_SHEET_ID } from '../actions/fetchSheetTypes';
import { POSTING_UPDATED_METADATA } from '../actions/metadataTypes';
import { FETCHING_SHEETS } from '../actions/sheetsTypes';
import { POSTING_CREATE_SHEET } from '../actions/sheetTypes';
import { POSTING_UPDATED_TITLE } from '../actions/titleTypes';
import { getUserInfoFromCookie } from '../helpers/userHelpers';
import { promptLogin, loggedIn } from '../actions/authActions';

export default store => next => async action => {
   switch (action.type) {
      case POSTING_UPDATED_CELLS:
      case UPDATED_SHEET_ID:
      case POSTING_UPDATED_METADATA:
      case FETCHING_SHEETS:
      case POSTING_CREATE_SHEET:
      case POSTING_UPDATED_TITLE:
         const { userId, sessionId } = getUserInfoFromCookie();
         if (!userId || !sessionId) {
            promptLogin();
         } else {
            loggedIn();
         }
         console.log('authorize.js got userId', userId, 'sessionId', sessionId);
         break;

      default:
   }
   return next(action);
};
