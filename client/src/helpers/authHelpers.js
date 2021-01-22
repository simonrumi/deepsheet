import { LOCAL_STORAGE_STATE_KEY, LOCAL_STORAGE_ACTION_KEY, LOCAL_STORAGE_TIME_KEY } from '../constants';

export const saveToLocalStorage = (state, action) => {
   window.localStorage.clear();
   window.localStorage.setItem(LOCAL_STORAGE_STATE_KEY, JSON.stringify(state));
   window.localStorage.setItem(LOCAL_STORAGE_ACTION_KEY, JSON.stringify(action));
   window.localStorage.setItem(LOCAL_STORAGE_TIME_KEY, Date.now());
}