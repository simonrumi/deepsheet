const dbConnector = require('./dbConnector');
const { standardAuthError } = require('./helpers/userHelpers');
const { createStateCheck } = require('./helpers/authHelpers');
const { makeGoogleAuthCall } = require('./helpers/googleAuthHelpers');
const { makeFacebookAuthCall } = require('./helpers/facebookAuthHelpers');

export async function handler(event, context, callback) {
   await dbConnector();

   let stateCheck;
   try {
      stateCheck = await createStateCheck();
   } catch(err) {
      console.log('error making stateCheck', err);
      return standardAuthError;
   }

   const provider = event.queryStringParameters?.provider || null;
   switch (provider) {
      case 'facebook':
         try {
            const fbResponse = await makeFacebookAuthCall(stateCheck.stateCheckValue);
            return fbResponse;
         } catch (err) {
            console.log('error making fb auth call', err);
            return standardAuthError;
         }

      case 'google':
         try {
            console.log('auth.js before makeGoogleAuthCall got stateCheckValue', stateCheck.stateCheckValue);
            const googleResponse = await makeGoogleAuthCall(stateCheck.stateCheckValue);
            console.log('auth.js after makeGoogleAuthCall got googleResponse', googleResponse);
            return googleResponse;
         } catch (err) {
            console.log('error making google auth call', err);
         }
         break;

      default:
         // shouldn't get to here but leaving this just in case
         console.log('auth failed for provider', provider);
         return standardAuthError;
   }
  
   // NOTE: don't use async and callback together - both doing same job when redirecting - so this doesn't work
   //return callback(null, response);
}
