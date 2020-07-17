import { MENU_SHOWN, MENU_HIDDEN, SET_MENU_REF } from '../actions/menuTypes';

const menuReducer = (state = {}, action) => {
   switch (action.type) {
      case MENU_SHOWN:
         return { ...state, showMenu: true };

      case MENU_HIDDEN:
         return { ...state, showMenu: false };

      case SET_MENU_REF:
         return { ...state, menuRef: action.payload };

      default:
         return state;
   }
};

export default menuReducer;
