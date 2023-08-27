import * as R from 'ramda';
import dbConnector from './dbConnector';
import { getSymbolValue } from './helpers';
import { createStateCheck } from './helpers/authHelpers';
import { standardAuthError } from './helpers/userHelpers';
import { makeGoogleAuthCall } from './helpers/googleAuthHelpers';
import { makeFacebookAuthCall } from './helpers/facebookAuthHelpers';
import { log } from './helpers/logger';
import { LOG } from '../constants';

const handler = async (event, context) => {
	console.log('\nauth--handler started and about to call dbConnector');
   await dbConnector();
	console.log('auth--handler after dbConnector()');

   let stateCheck;
   try {
      stateCheck = await createStateCheck();
		console.log('auth--handler got stateCheck', stateCheck); 
   } catch (err) {
      log({ level: LOG.ERROR }, 'error making stateCheck:', err.message);
      return standardAuthError;
   } 
	
	console.log('auth--handler about to do R.pipe to get the provider');

	const provider = R.pipe(
		getSymbolValue,
		R.path(['urlList', 0, 'searchParams']),
		searchParams => getSymbolValue({ description: 'query', obj: searchParams}),
		searchParamsQuery => searchParamsQuery[0] === 'provider' ? searchParamsQuery[1] : null,
	)({ description: 'state', obj: event});	
	console.log('\n auth--handler got provider', provider);

   switch (provider) {
      case 'facebook':
         try {
            const fbResponse = await makeFacebookAuthCall(stateCheck.stateCheckValue);
            log({ level: LOG.DEBUG }, 'completed Facebook auth call and got response:', fbResponse);
            return Response.redirect(fbResponse.redirectUrl, fbResponse.statusCode);
         } catch (err) {
            log({ level: LOG.ERROR }, 'error making fb auth call:', err.message);
            return standardAuthError;
         }

      case 'google':
         try {
            const googleResponse = await makeGoogleAuthCall(stateCheck.stateCheckValue);
            log({ level: LOG.DEBUG }, 'auth--handler called makeGoogleAuthCall and got statusCode:', googleResponse.statusCode, 'redirectUrl', googleResponse.redirectUrl);
            return Response.redirect(googleResponse.redirectUrl, googleResponse.statusCode);
         } catch (err) {
            log({ level: LOG.ERROR }, 'error making google auth call:', err.message);
         }
         break;

      default:
         // shouldn't get to here but leaving this just in case
         log({ level: LOG.ERROR }, 'auth failed for provider:', provider);
         return standardAuthError;
   }

   // NOTE: don't use async and callback together - both doing same job when redirecting - so this doesn't work
   //return callback(null, response);
}

export default handler;