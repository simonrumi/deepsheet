import managedStore from '../store';
import { PROMPT_LOGIN, LOGGED_IN } from './authTypes';

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
