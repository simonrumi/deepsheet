import { UPDATED_ROW_ORDER } from '../actions/types';

export default store => next => action => {
   if (!action) {
      return;
   }
   switch (action.type) {
      case UPDATED_ROW_ORDER:
         //get QQQQQQ do we have store.sheet.etc here?
         moveRow();
         break;
      default:
   }
   return next(action);
};
