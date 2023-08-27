import * as R from 'ramda';
import { createStateCheck } from './helpers/authHelpers';
import { makeGoogleAuthCall } from './helpers/googleAuthHelpers';
import { standardAuthError } from './helpers/userHelpers';
import { getSymbolValue } from './helpers';
import dbConnector from './dbConnector';
import keys from '../config/keys';
import { log } from './helpers/logger';
import { LOG } from '../constants';


// test with the URL
// http://localhost:8888/.netlify/functions/helloworld?provider=google


console.log('helloworld got keys.mongoURI', keys.mongoURI);

const handler = async (event, context) => {
	console.log('\nhelloworld handler started');
	await dbConnector();

	let stateCheck;
	try {
      stateCheck = await createStateCheck();
		console.log('helloworld got stateCheck', stateCheck); 
   } catch (err) {
      log({ level: LOG.ERROR }, 'error making stateCheck:', err.message);
      return standardAuthError;
   } 

	console.log('\nhelloworld handler got stateCheck', stateCheck);

	const provider = R.pipe(
		getSymbolValue,
		R.path(['urlList', 0, 'searchParams']),
		searchParams => getSymbolValue({ description: 'query', obj: searchParams}),
		searchParamsQuery => searchParamsQuery[0] === 'provider' ? searchParamsQuery[1] : null,
	)({ description: 'state', obj: event});	
	console.log('\n helloworld got provider', provider);

	switch (provider) {
		case 'google':
			console.log('helloworld thinks provider is google');
         try {
				console.log('helloworld about to makeGoogleAuthCall with stateCheck.stateCheckValue', stateCheck.stateCheckValue);
            const { statusCode, redirectUrl } = await makeGoogleAuthCall(stateCheck.stateCheckValue);
				console.log('helloworld completed makeGoogleAuthCall and got statusCode', statusCode, 'redirectUrl', redirectUrl);
            return Response.redirect(redirectUrl, statusCode);
         } catch (err) {
            log({ level: LOG.ERROR }, 'error making google auth call:', err.message);
         }
         break;

		default:
			console.log('helloworld thinks provider is neither google nor facebook');
			// shouldn't get to here but leaving this just in case
			log({ level: LOG.ERROR }, 'auth failed for provider:', provider);
			return standardAuthError;
	}
}

export default handler;
