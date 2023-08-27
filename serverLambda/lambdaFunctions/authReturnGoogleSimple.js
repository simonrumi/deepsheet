import { google } from 'googleapis';
import { getTokenFromGoogle, getGoogleUserId } from './helpers/googleAuthHelpers';
import { prepareAuthResponse } from './helpers/authHelpers';
import { standardAuthError } from './helpers/userHelpers';
import keys from '../config/keys';
import { log } from './helpers/logger';
import { AUTH_PROVIDER_GOOGLE, LOG } from '../constants';

// TODO we need to get the google id for the user, ...looks like to do that we'd need to use the google node.js library and follow the info here
// https://github.com/googleapis/google-api-nodejs-client 
// this might be what we already have in authReturnGoogle ...so maybe just need to check that against the above doc and make sure it'll work

const handler = async (event, context) => {
	try {
		const { googleClientID, googleClientSecret, googleAuthReturnURI } = keys;

		const startTime0 = log({ level: LOG.VERBOSE, printTime: true }, 'authReturnGoogleSimple getting OAuth2 client');
      const oauth2Client = new google.auth.OAuth2(googleClientID, googleClientSecret, googleAuthReturnURI);
      log({ level: LOG.VERBOSE, startTime: startTime0 }, 'authReturnGoogleSimple got oauth2Client');

      const startTime1 = log({ level: LOG.VERBOSE, printTime: true }, 'authReturnGoogleSimple getting token google');
      const token = await getTokenFromGoogle(oauth2Client, code); // TODO NEXT - we need this code, but it is returned when using the nodejs library, not the front-end javascript button...so is there a way to get the code from a user already logged in?
      log({ level: LOG.DEBUG, startTime: startTime1 }, 'authReturnGoogleSimple got token', token);

      const startTime2 = log({ level: LOG.VERBOSE, printTime: true }, 'authReturnGoogleSimple getting userId from google');
      const userIdFromProvider = await getGoogleUserId(token);
      log({ level: LOG.DEBUG, startTime: startTime2 }, 'authReturnGoogleSimple got userIdFromProvider', userIdFromProvider);

		const startTime3 = log({ level: LOG.VERBOSE, printTime: true }, 'authReturnGoogleSimple preparing Auth Response');
      const authResponse = await prepareAuthResponse(userIdFromProvider, AUTH_PROVIDER_GOOGLE, token);
      log({ level: LOG.DEBUG, startTime: startTime3 }, 'authReturnGoogleSimple will return authResponse', authResponse);
      return authResponse;
	} catch(err) {
		log({ level: LOG.ERROR }, 'authReturnGoogleSimple', err);
      return standardAuthError;
	}
}

export default handler;