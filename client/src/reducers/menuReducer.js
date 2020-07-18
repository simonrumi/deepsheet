import { MENU_SHOWN, MENU_HIDDEN, SET_MENU_REF } from '../actions/menuTypes';
import { COMPLETED_CREATE_SHEET, SHEET_CREATION_FAILED } from '../actions/sheetTypes';

const menuReducer = (state = {}, action) => {
   switch (action.type) {
      case MENU_SHOWN:
         return { ...state, showMenu: true };

      case MENU_HIDDEN:
         return { ...state, showMenu: false };

      case SET_MENU_REF:
         return { ...state, menuRef: action.payload };

      case COMPLETED_CREATE_SHEET:
      case SHEET_CREATION_FAILED:
         return { ...state, showMenu: false };

      default:
         return state;
   }
};

export default menuReducer;
