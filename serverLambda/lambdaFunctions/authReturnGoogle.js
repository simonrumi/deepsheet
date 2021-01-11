const { google } = require('googleapis');
const dbConnector = require('./dbConnector');
const { standardAuthError } = require('./helpers/userHelpers');
const { confirmStateCheck, prepareAuthResponse } = require('./helpers/authHelpers');
const { getTokenFromGoogle, getGoogleUserId } = require('./helpers/googleAuthHelpers');
const { AUTH_PROVIDER_GOOGLE } = require('../constants');
const keys = require('../config/keys');

export async function handler(event, context, callback) {
   // for some reason we need to have this line here, in order for the findUser() call (within prepareAuthResponse) to work
   // even though we are not directly using the db connection it returns
   await dbConnector();

   const { code, error, state } = event.queryStringParameters;

   if (error) {
      console.log('authReturnGoogle got error', error);
      return standardAuthError;
   }

   const stateCheckOk = await confirmStateCheck(state);
   if (!stateCheckOk) {
      return standardAuthError;
   }

   try {
      const { googleClientID, googleClientSecret, googleAuthReturnURI } = keys;
      const oauth2Client = new google.auth.OAuth2(googleClientID, googleClientSecret, googleAuthReturnURI);
      const token = await getTokenFromGoogle(oauth2Client, code);
      const userIdFromProvider = await getGoogleUserId(token);
      const authResponse = prepareAuthResponse(userIdFromProvider, AUTH_PROVIDER_GOOGLE, token);
      return authResponse;
   } catch (err) {
      console.log('error authenticating via google', err);
   }
   // if we get here then we didn't get an access token nor did we get an error.
   // This shouldn't happen....but leaving it here just in case
   console.log('authorization failed, but for no known reason');
   return standardAuthError;
}