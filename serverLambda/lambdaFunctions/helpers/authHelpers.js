import * as R from 'ramda';
import { log } from './logger';
import { LOG } from '../../constants';
import { arrayContainsSomething } from './index';
import { findOrCreateUser, applyAuthSession, makeCookie } from './userHelpers';
import keys from '../../config/keys';
import StateCheckModel from '../models/StateCheckModel';

export const prepareAuthResponse = async (userIdFromProvider, provider, token) => {
   const user = await findOrCreateUser({ userIdFromProvider, provider, token });
   const session = await applyAuthSession(user);
   const cookie = makeCookie(user._id, session._id);
   return {
      statusCode: 302,
      headers: {
         'Location': `${keys.mainUri}?auth`, // adding the query parameter is just to replace the long string with the code coming from the auth provider (google or FB)
         'Access-Control-Expose-Headers': 'Set-Cookie',
         'Set-Cookie': cookie,
      },
   };
}

// see explanation here
// https://dev.to/oyetoket/fastest-way-to-generate-random-strings-in-javascript-2k5a
const partRandomString = () => Math.random().toString(20).substring(2); // this seems to be about 14 - 16 chars long
const makeStateCheckValue = () => R.concat(partRandomString(), partRandomString()); // this should be close to 30 chars

export const createStateCheck = async () => {
   try {
		const startTime = log({ printTime: true, level: LOG.INFO }, 'authHelpers--createStateCheck started'); // TIDY remove this
      const newStateCheck = new StateCheckModel({ stateCheckValue: makeStateCheckValue() });
		console.log('authHelpers--createStateCheck created newStateCheck', newStateCheck);
      await newStateCheck.save();
		log({ startTime, level: LOG.INFO }, 'authHelpers--createStateCheck finished saving newStateCheck', newStateCheck); // TIDY remove this
      return newStateCheck;
   } catch (err) {
      log({ level: LOG.ERROR }, 'error making stateCheck:', err.message);
      return err;
   }
};

export const confirmStateCheck = async stateCheckValue => {
   const stateCheck = await StateCheckModel.find({ stateCheckValue });
   if (!arrayContainsSomething(stateCheck)) {
      return false;
   }
   try {
      await StateCheckModel.deleteOne({ stateCheckValue });
   } catch(err) {
      log({ level: LOG.WARNING }, 'Warning: error deleting used stateCheck (however it will be auto-deleted):', err.message);
   }
   return true;
}