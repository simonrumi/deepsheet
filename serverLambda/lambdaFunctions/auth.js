const dbConnector = require('./dbConnector');
const { standardAuthError } = require('./helpers/userHelpers');
const { createStateCheck } = require('./helpers/authHelpers');
const { makeGoogleAuthCall } = require('./helpers/googleAuthHelpers');
const { makeFacebookAuthCall } = require('./helpers/facebookAuthHelpers');
const { log } = require('./helpers/logger');
const { LOG } = require('../constants');

export async function handler(event, context, callback) {
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
            return fbResponse;
         } catch (err) {
            log({ level: LOG.ERROR }, 'error making fb auth call:', err.message);
            return standardAuthError;
         }

      case 'google':
         try {
            const googleResponse = await makeGoogleAuthCall(stateCheck.stateCheckValue);
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
