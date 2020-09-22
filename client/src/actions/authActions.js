import managedStore from '../store';
import { PROMPT_LOGIN, LOGGED_IN, LOGGED_OUT } from './authTypes';

export const promptLogin = () => {
   managedStore.store.dispatch({
      type: PROMPT_LOGIN,
   });
};

export const loggedIn = () => {
   managedStore.store.dispatch({
      type: LOGGED_IN,
   });
};

export const loggedOut = error => {
   managedStore.store.dispatch({
      type: LOGGED_OUT,
      payload: error,
   });
};
