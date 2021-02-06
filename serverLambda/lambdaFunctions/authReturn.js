// this is just for Facbeook... probably should be called authReturnFacebook.js, but leaving as-is

const dbConnector = require('./dbConnector');
const { standardAuthError } = require('./helpers/userHelpers');
const { getFacebookToken, getFbUserId } = require('./helpers/facebookAuthHelpers');
const { confirmStateCheck, prepareAuthResponse } = require('./helpers/authHelpers');
const { log } = require('./helpers/logger');
const { AUTH_PROVIDER_FACEBOOK, LOG } = require('../constants');

export async function handler(event, context, callback) {
   const startTime = log({ level: LOG.DEBUG, printTime: true }, 'autReturn starting by getting db');
   await dbConnector(); // for some reason we need to have this line here, in order for the findUser() call (within prepareAuthResponse) to work
   log({ level: LOG.DEBUG, startTime }, 'autReturn got db.');

   const { code, state, error, error_reason, error_description } = event.queryStringParameters;

   if (error) {
      log({ level: LOG.ERROR }, 'authReturn', error, error_reason, error_description);
      return standardAuthError;
   }

   const stateCheckOk = await confirmStateCheck(state);
   if (!stateCheckOk) {
      log({ level: LOG.ERROR }, 'authRetur state check did not pass');
      return standardAuthError;
   }

   const { token_error, access_token, token_type, expires_in } = await getFacebookToken(code);
   if (token_error) {
      log({ level: LOG.ERROR }, 'authReturn error getting token', token_error);
      return standardAuthError;
   }

   if (access_token) {
      try {
         const startTime1 = log({ level: LOG.DEBUG, printTime: true }, 'autReturn getting userId from FB');
         const userIdFromProvider = await getFbUserId(access_token);
         log({ level: LOG.DEBUG, startTime1 }, 'autReturn got userIdFromProvider', userIdFromProvider);

         const startTime2 = log({ level: LOG.DEBUG, printTime: true }, 'autReturn preparing Auth Response');
         const authResponse = await prepareAuthResponse(userIdFromProvider, AUTH_PROVIDER_FACEBOOK, access_token);
         log({ level: LOG.DEBUG, startTime: startTime2 }, 'autReturn got authResponse', authResponse);

         return authResponse;
      } catch (err) {
         log({ level: LOG.ERROR }, 'authReturn', err);
         return standardAuthError;
      }
   }
}
