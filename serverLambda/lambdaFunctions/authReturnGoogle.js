const { google } = require('googleapis');
const dbConnector = require('./dbConnector');
const { standardAuthError } = require('./helpers/userHelpers');
const { confirmStateCheck, prepareAuthResponse } = require('./helpers/authHelpers');
const { getTokenFromGoogle, getGoogleUserId } = require('./helpers/googleAuthHelpers');
const { log } = require('./helpers/logger');
const { AUTH_PROVIDER_GOOGLE, LOG } = require('../constants');
const keys = require('../config/keys');

const handler = async (event, context) => {
   // for some reason we need to call dbConnector() here, in order for the findUser() call (within prepareAuthResponse) to work
   // even though we are not directly using the db connection it returns
   const startTime = log({ level: LOG.DEBUG, printTime: true }, 'autReturnGoogle starting by getting db');
   await dbConnector();
   log({ level: LOG.DEBUG, startTime }, 'autReturnGoogle got db.');

   const { code, error, state } = event.queryStringParameters;

   if (error) {
      log({ level: LOG.ERROR }, 'authReturnGoogle got error', error);
      return standardAuthError;
   }

   const stateCheckOk = await confirmStateCheck(state);
   if (!stateCheckOk) {
      log({ level: LOG.ERROR }, 'authReturnGoogle state check did not pass');
      return standardAuthError;
   }

   try {
      const { googleClientID, googleClientSecret, googleAuthReturnURI } = keys;
      
      const startTime0 = log({ level: LOG.DEBUG, printTime: true }, 'autReturnGoogle getting OAuth2 client');
      const oauth2Client = new google.auth.OAuth2(googleClientID, googleClientSecret, googleAuthReturnURI);
      log({ level: LOG.DEBUG, startTime: startTime0 }, 'autReturnGoogle got oauth2Client');

      const startTime1 = log({ level: LOG.DEBUG, printTime: true }, 'autReturnGoogle getting token google');
      const token = await getTokenFromGoogle(oauth2Client, code);
      log({ level: LOG.DEBUG, startTime: startTime1 }, 'autReturnGoogle got token', token);

      const startTime2 = log({ level: LOG.DEBUG, printTime: true }, 'autReturnGoogle getting userId from google');
      const userIdFromProvider = await getGoogleUserId(token);
      log({ level: LOG.DEBUG, startTime: startTime2 }, 'autReturnGoogle got userIdFromProvider', userIdFromProvider);

      const startTime3 = log({ level: LOG.DEBUG, printTime: true }, 'autReturnGoogle preparing Auth Response');
      const authResponse = await prepareAuthResponse(userIdFromProvider, AUTH_PROVIDER_GOOGLE, token);
      log({ level: LOG.DEBUG, startTime: startTime3 }, 'autReturnGoogle got authResponse', authResponse);

      return authResponse;
   } catch (err) {
      log({ level: LOG.ERROR }, 'authReturnGoogle', err);
      return standardAuthError;
   }
}

module.exports = { handler };