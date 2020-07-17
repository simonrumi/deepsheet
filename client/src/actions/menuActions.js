import { MENU_SHOWN, MENU_HIDDEN, SET_MENU_REF } from '../actions/menuTypes';
import managedStore from '../store';

export const menuShown = () => {
   managedStore.store.dispatch({ type: MENU_SHOWN });
};
export const menuHidden = () => {
   managedStore.store.dispatch({ type: MENU_HIDDEN });
};

export const setMenuRef = menuRef => {
   managedStore.store.dispatch({ type: SET_MENU_REF, payload: menuRef });
};
