import { PROMPT_LOGIN, LOGGED_IN } from '../actions/authTypes';

const authReducer = (state = {}, action) => {
   switch (action.type) {
      case PROMPT_LOGIN:
         return { ...state, isLoggedIn: false, showLoginModal: true };

      case LOGGED_IN:
         return { ...state, isLoggedIn: true, showLoginModal: false };

      default:
         return state;
   }
};

export default authReducer;
