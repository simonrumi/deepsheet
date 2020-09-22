import { PROMPT_LOGIN, LOGGED_IN, LOGGED_OUT } from '../actions/authTypes';

const authReducer = (state = {}, action) => {
   switch (action.type) {
      case PROMPT_LOGIN:
         return { ...state, isLoggedIn: false, showLoginModal: true };

      case LOGGED_IN:
         return { isLoggedIn: true, showLoginModal: false };

      case LOGGED_OUT:
         return { ...state, isLoggedIn: false, showLoginModal: true, error: action.payload };

      default:
         return state;
   }
};

export default authReducer;
