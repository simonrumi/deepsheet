import R from 'ramda';
import { log } from './logger';
import { LOG } from '../../constants';
import mongoose from 'mongoose';
mongoose.Promise = global.Promise; // Per Stephen Grider: Mongoose's built in promise library is deprecated, replace it with ES2015 Promise
import { arrayContainsSomething } from './index';
import { findOrCreateUser, applyAuthSession, makeCookie } from './userHelpers';
import keys from '../../config/keys';
require('../models/StateCheckModel');
const StateCheckModel = mongoose.model('stateCheck');

const prepareAuthResponse = async (userIdFromProvider, provider, token) => {
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

const createStateCheck = async () => {
   try {
      const newStateCheck = new StateCheckModel({ stateCheckValue: makeStateCheckValue() });
      await newStateCheck.save();
      return newStateCheck;
   } catch (err) {
      log({ level: LOG.ERROR }, 'error making stateCheck:', err.message);
      return err;
   }
};

const confirmStateCheck = async stateCheckValue => {
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

module.exports = { prepareAuthResponse, confirmStateCheck, createStateCheck };