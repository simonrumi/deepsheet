const { standardAuthError } = require('./helpers/userHelpers');
const { makeGoogleAuthCall } = require('./helpers/googleAuthHelpers');
const { makeFacebookAuthCall } = require('./helpers/facebookAuthHelpers');

export async function handler(event, context, callback) {
//    console.log('*********** started auth process - auth.js got event', event);
   const provider = event.queryStringParameters?.provider || null;
   console.log('auth got provider', provider);

   switch (provider) {
      case 'facebook':
         try {
            const fbResponse = await makeFacebookAuthCall();
            return fbResponse;
         } catch (err) {
            console.log('error making fb auth call', err);
            return standardAuthError;
         }

      case 'google':
         try {
            const googleResponse = await makeGoogleAuthCall(event, context);
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
