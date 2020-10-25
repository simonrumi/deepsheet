import { isSomething } from '../helpers';

export default store => next => async action => {
   if (!action) {
      return;
   }
   if (action instanceof Promise) {
      const resolvedAction = await Promise.resolve(action);
      if (isSomething(resolvedAction)) {
         return next(resolvedAction);
      }
      return;
   }
   return next(action);
};