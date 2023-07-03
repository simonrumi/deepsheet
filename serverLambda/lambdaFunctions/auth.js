import dbConnector from './dbConnector';
import { standardAuthError } from './helpers/userHelpers';
import { createStateCheck } from './helpers/authHelpers';
import { makeGoogleAuthCall } from './helpers/googleAuthHelpers';
import { makeFacebookAuthCall } from './helpers/facebookAuthHelpers';
import { log } from './helpers/logger';
import { LOG } from '../constants';

console.log('auth.js got process.env', process.env);

const handler = async (event, context) => {
	console.log('auth--handler got process.env', process.env);
   await dbConnector();

   let stateCheck;
   try {
      stateCheck = await createStateCheck();
   } catch(err) {
      log({ level: LOG.ERROR }, 'error making stateCheck:', err.message);
      return standardAuthError;
   }

   const provider = event.queryStringParameters?.provider || null;
   switch (provider) {
      case 'facebook':
         try {
            const fbResponse = await makeFacebookAuthCall(stateCheck.stateCheckValue);
				log({ level: LOG.DEBUG }, 'completed Facebook auth call and got response:', fbResponse);
            return fbResponse;
         } catch (err) {
            log({ level: LOG.ERROR }, 'error making fb auth call:', err.message);
            return standardAuthError;
         }

      case 'google':
         try {
            const googleResponse = await makeGoogleAuthCall(stateCheck.stateCheckValue);
				log({ level: LOG.DEBUG }, 'completed google auth call and got response:', googleResponse);
            return googleResponse;
         } catch (err) {
            log({ level: LOG.ERROR }, 'error making google auth call:', err.message);
         }
         break;

      default:
         // shouldn't get to here but leaving this just in case
         log({ level: LOG.ERROR }, 'auth failed for provider:', provider);
         return standardAuthError;
   }
  
   // NOTE: don't use async and callback together - both doing same job when redirecting - so this doesn't work
   //return callback(null, response);
}

export default handler;