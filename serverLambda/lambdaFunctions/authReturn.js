// note that authReturn is needed for the Facebook auth process only. Google auth doesn't need it

const keys = require('../config/keys');
const dbConnector = require('./dbConnector');
const { findOrCreateUser, applyAuthSession, standardAuthError, makeCookie } = require('./helpers/userHelpers');
const { getFacebookToken, getFbUserId } = require('./helpers/facebookAuthHelpers');
const { AUTH_PROVIDER_FACEBOOK } = require('../constants');

export async function handler(event, context, callback) {
   console.log('started authReturn handler, got event', event);

   // for some reason we need to have this line here, in order for the findUser() call to work
   // even though we are not directly using the db connection it returns
   await dbConnector();

   const { code, state, error, error_reason, error_description } = event.queryStringParameters;

   if (error) {
      console.log('authReturn.js got this error:', error, error_reason, error_description);
      return standardAuthError;
   }

   if (state !== keys.facebookStateCheck) {
      console.log('authReturn.js did not pass the facebookStateCheck since it got state', state);
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
         console.log('in authReturn.js AUTH_PROVIDER_FACEBOOK is', AUTH_PROVIDER_FACEBOOK);
         const user = await findOrCreateUser({
            userIdFromProvider,
            provider: AUTH_PROVIDER_FACEBOOK,
            token: access_token,
         });
         const session = await applyAuthSession(user);
         const cookie = makeCookie(user._id, session._id);
         return {
            statusCode: 302,
            headers: {
               Location: 'http://localhost:3000',
               'Set-Cookie': cookie,
               // 'Access-Control-Allow-Headers': '*',
               // 'Access-Control-Allow-Origin': 'https://www.facebook.com', //'http://localhost:3000', '*'
               // 'Access-Control-Allow-Methods': '*', // 'OPTIONS, POST, GET',
            },
         };
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
