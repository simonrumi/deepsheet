import { UPDATED_FOCUS } from '../actions/focusTypes';

export const focusReducer = (state = {}, action) => {
   switch (action.type) {
      case UPDATED_FOCUS:
         return action.payload;
      default:
         return state;
   }
};
