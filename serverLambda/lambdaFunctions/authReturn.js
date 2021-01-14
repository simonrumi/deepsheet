// this is just for Facbeook... probably should be called authReturnFacebook.js, but leaving as-is

const dbConnector = require('./dbConnector');
const { standardAuthError } = require('./helpers/userHelpers');
const { getFacebookToken, getFbUserId } = require('./helpers/facebookAuthHelpers');
const { confirmStateCheck, prepareAuthResponse } = require('./helpers/authHelpers');
const { AUTH_PROVIDER_FACEBOOK } = require('../constants');

export async function handler(event, context, callback) {
   // for some reason we need to have this line here, in order for the findUser() call (within prepareAuthResponse) to work
   // even though we are not directly using the db connection it returns
   await dbConnector();

   const { code, state, error, error_reason, error_description } = event.queryStringParameters;

   if (error) {
      console.log('authReturn.js got this error:', error, error_reason, error_description);
      return standardAuthError;
   }

   const stateCheckOk = await confirmStateCheck(state);
   if (!stateCheckOk) {
      console.log('authReturn.js did not pass the state check since it got state', state);
      return standardAuthError;
   }

   const { token_error, access_token, token_type, expires_in } = await getFacebookToken(code);
   if (token_error) {
      console.log('authReturn.js got error getting token', token_error);
      return standardAuthError;
   }

   if (access_token) {
      try {
         const userIdFromProvider = await getFbUserId(access_token);
         const authResponse = await prepareAuthResponse(userIdFromProvider, AUTH_PROVIDER_FACEBOOK, access_token);
         return authResponse;
      } catch (err) {
         console.log('AuthReturn has error either getting basicUserInfo, or finding user, or creating user:', err);
         return standardAuthError;
      }
   }

   // if we get here then we didn't get an access token nor did we get an error.
   // This shouldn't happen....but leaving it here just in case
   console.log('authorization failed, but for no known reason');
   return standardAuthError;
}
