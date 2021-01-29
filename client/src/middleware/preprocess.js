import { isSomething } from '../helpers';

export default store => next => async action => {
   if (!action) {
      return;
   }
   console.log('preprocessing action', action.type);
   if (action instanceof Promise) {
      const resolvedAction = await Promise.resolve(action);
      if (isSomething(resolvedAction)) {
         return next(resolvedAction);
      }
      return;
   }
   return next(action);
};