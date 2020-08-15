import { isSomething } from '../helpers';

export default store => next => async action => {
   if (!action) {
      return;
   }
   if (action instanceof Promise) {
      // console.warn(
      //    'Preprocess got an action that was a Promise, so will resolve before proceeding. This should probably be ok'
      // );
      const resolvedAction = await Promise.resolve(action);
      if (isSomething(resolvedAction)) {
         return next(resolvedAction);
      }
      return;
   }
   return next(action);
};
