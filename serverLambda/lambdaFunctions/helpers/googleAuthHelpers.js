const { OAuth2Client } = require('google-auth-library');
const keys = require('../../config/keys');
const { AUTH_PROVIDER_GOOGLE } = require('../../constants');
const { findOrCreateUser, applyAuthSession, makeCookie } = require('./userHelpers');
const dbConnector = require('../dbConnector');

const makeGoogleAuthCall = async (event, context) => {
   await dbConnector();
   const client = new OAuth2Client(keys.googleClientID);
   const googleIdToken = JSON.parse(event.body)?.googleIdToken;

   try {
      const ticket = await client.verifyIdToken({
         idToken: googleIdToken,
         audience: keys.googleClientID,
      });

      const payload = ticket.getPayload();
      const user = await findOrCreateUser({
         userIdFromProvider: payload['sub'],
         provider: AUTH_PROVIDER_GOOGLE,
         token: googleIdToken,
      });
      const session = await applyAuthSession(user);
      const cookie = makeCookie(user._id, session._id);
      return {
         statusCode: 200,
         headers: {
            // 'Set-Cookie': cookie, // actually not setting cookie here because this is called using axios from the page, so there is no page reload when the cookie could get set
            'Content-Type': 'application/json',
         },
         body: `{ "cookie": "${cookie}" }`,
      };
   } catch (err) {
      console.log('failed to verify google id_token:', err);
      return standardAuthError;
   }
};

module.exports = {
   makeGoogleAuthCall,
};
