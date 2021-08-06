import { isSomething } from '../helpers';
import { log } from '../clientLogger';
import { LOG } from '../constants';

export default store => next => async action => {
   if (!action) {
      return;
   }
   log({ level: LOG.DEBUG }, 'preprocessing action', action.type);
   if (action instanceof Promise) {
      const resolvedAction = await Promise.resolve(action);
      if (isSomething(resolvedAction)) {
         return next(resolvedAction);
      }
      return;
   }
   return next(action);
};