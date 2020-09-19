import { isNothing } from './helpers';

const axios = require('axios').default;
const keys = require('../config/keys');
const dbConnector = require('./dbConnector');
const { findUser, getFacebookToken, applyAuthSession } = require('./helpers/userHelpers');

const standardAuthError = {
   statusCode: 401,
   body: JSON.stringify({
      error: 'authentication failed...bummer',
   }),
};

export async function handler(event, context, callback) {
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
         const basicUserInfo = await axios.get(
            `https://graph.facebook.com/me?fields=id,name,email&access_token=${access_token}`
         );
         const { id, name, email } = basicUserInfo.data;

         // is this user in db already?
         const user = await findUser({ email, userIdFromProvider: id });

         if (isNothing(user)) {
            // TODO create a new user here
         }
         const access = {
            token: access_token,
            tokenProvider: 'facebook',
            userIdFromProvider: id,
            tokenType: token_type,
            tokenExpires: expires_in,
         };
         const session = await applyAuthSession(user, access);

         const cookieStr = encodeURIComponent('id=' + user._id + ';session=' + session._id);
         const maxAge = 60 * 60 * 24 * 30; // i.e. set cookie to expire after 30 days
         const cookie = 'deepdeepsheet=' + cookieStr + '; Max-Age=' + maxAge;

         return {
            statusCode: 302,
            headers: {
               Location: 'http://localhost:3000',
               'Set-Cookie': cookie,
               // 'Access-Control-Allow-Headers': '*',
               // 'Access-Control-Allow-Origin': 'https://www.facebook.com', //'http://localhost:3000', '*'
               // 'Access-Control-Allow-Methods': '*', // 'OPTIONS, POST, GET',
            },
            body: JSON.stringify({
               access_token,
               token_type,
               expires_in,
               id,
               name,
               email,
            }),
         };
      } catch (err) {
         console.log('Error getting basicUserInfo:', err);
         return standardAuthError;
      }
   }

   // if we get here then we didn't get an access token nor did we get an error.
   // This shouldn't happen....but leaving it here just in case
   console.log('authorization failed, but for no known reason');
   return standardAuthError;
}
