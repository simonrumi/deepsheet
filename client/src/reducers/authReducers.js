import { PROMPT_LOGIN, LOGGED_IN, LOGGED_OUT, RECEIVED_NETWORK_ERROR } from '../actions/authTypes';
import { networkErrorText } from '../components/displayText';

const authReducer = (state = {}, action) => {
   switch (action.type) {
      case PROMPT_LOGIN:
         return { ...state, isLoggedIn: false, showLoginModal: true };

      case LOGGED_IN:
         return { isLoggedIn: true, showLoginModal: false };

      case LOGGED_OUT:
         return { ...state, isLoggedIn: false, showLoginModal: true, error: action.payload };

      case RECEIVED_NETWORK_ERROR:
         // note the payload gives us the actual error, but don't want to publicize it for security reasons
         return { ...state, error: networkErrorText() };

      default:
         return state;
   }
};

export default authReducer;
