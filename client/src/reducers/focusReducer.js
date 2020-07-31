import { UPDATED_FOCUS, CLEARED_FOCUS } from '../actions/focusTypes';

export const focusReducer = (state = {}, action) => {
   switch (action.type) {
      case UPDATED_FOCUS:
         return action.payload;

      case CLEARED_FOCUS:
         return {};

      default:
         return state;
   }
};
