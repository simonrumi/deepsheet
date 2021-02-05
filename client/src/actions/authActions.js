import managedStore from '../store';
import { PROMPT_LOGIN, LOGGED_IN, LOGGED_OUT, SAVE_STATE, RECEIVED_NETWORK_ERROR } from './authTypes';

export const promptLogin = () => {
   managedStore.store.dispatch({
      type: PROMPT_LOGIN,
   });
};

export const saveState = () => {
   managedStore.store.dispatch({
      type: SAVE_STATE,
   });
}

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

export const receivedNetworkError = error => {
   managedStore.store.dispatch({
      type: RECEIVED_NETWORK_ERROR,
      payload: error,
   });
};
