import * as R from 'ramda';
import { google } from 'googleapis';
import dbConnector from './dbConnector';
import { getSymbolValue } from './helpers';
import { standardAuthError } from './helpers/userHelpers';
import { confirmStateCheck, prepareAuthResponse } from './helpers/authHelpers';
import { getTokenFromGoogle, getGoogleUserId } from './helpers/googleAuthHelpers';
import { log } from './helpers/logger';
import { AUTH_PROVIDER_GOOGLE, LOG } from '../constants';
import keys from '../config/keys';

// TODO NEXT - this is broken

const handler = async (event, context) => {
   // dbConnector() is needed so we can confirmStateCheck below
   const startTime = log({ level: LOG.VERBOSE, printTime: true }, 'autReturnGoogle starting by getting db');
   await dbConnector();
   log({ level: LOG.VERBOSE, startTime }, 'autReturnGoogle got db.');

	const { code, error, state } = R.pipe(
		getSymbolValue,
		R.prop('url'), //['urlList', 0, 'searchParams']
		JSON.stringify,
		url => {
			const state = url.match(/\?.*state=([^&]*)/i);
			const code = url.match(/\?.*code=([^&]*)/i);
			const error = url.match(/\?.*error=([^&]*)/i);
			return { state: R.prop(1, state), code: R.prop(1, code), error: R.prop(1, error) }
		}
	)({ description: 'state', obj: event});

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
      
      const startTime0 = log({ level: LOG.VERBOSE, printTime: true }, 'autReturnGoogle getting OAuth2 client');
      const oauth2Client = new google.auth.OAuth2(googleClientID, googleClientSecret, googleAuthReturnURI);
      log({ level: LOG.VERBOSE, startTime: startTime0 }, 'autReturnGoogle got oauth2Client');

			// TODO BUG NEXT seems like we're getting an error getting the token "authReturnGoogle GaxiosError: invalid_grant"
      const startTime1 = log({ level: LOG.VERBOSE, printTime: true }, 'autReturnGoogle getting token google');
      const token = await getTokenFromGoogle(oauth2Client, code);
      log({ level: LOG.DEBUG, startTime: startTime1 }, 'autReturnGoogle got token', token);

      const startTime2 = log({ level: LOG.VERBOSE, printTime: true }, 'autReturnGoogle getting userId from google');
      const userIdFromProvider = await getGoogleUserId(token);
      log({ level: LOG.DEBUG, startTime: startTime2 }, 'autReturnGoogle got userIdFromProvider', userIdFromProvider);

      const startTime3 = log({ level: LOG.VERBOSE, printTime: true }, 'autReturnGoogle preparing Auth Response');
      const authResponse = await prepareAuthResponse(userIdFromProvider, AUTH_PROVIDER_GOOGLE, token);
      log({ level: LOG.DEBUG, startTime: startTime3 }, 'autReturnGoogle got authResponse', authResponse);

      return authResponse;
   } catch (err) {
      log({ level: LOG.ERROR }, 'authReturnGoogle', err);
      return standardAuthError;
   }
}

export default handler;