const R = require('ramda');
const mongoose = require('mongoose');
const { arrayContainsSomething } = require('./index');
const { findOrCreateUser, applyAuthSession, makeCookie } = require('./userHelpers');
const keys = require('../../config/keys');
require('../models/StateCheckModel');
const StateCheckModel = mongoose.model('stateCheck');

const prepareAuthResponse = async (userIdFromProvider, provider, token) => {
   const user = await findOrCreateUser({ userIdFromProvider, provider, token });
   const session = await applyAuthSession(user);
   const cookie = makeCookie(user._id, session._id);
   return {
      statusCode: 302,
      headers: {
         'Location': keys.mainUri,
         'Access-Control-Expose-Headers': 'Set-Cookie',
         'Set-Cookie': cookie,
         // TODO all 3 of these Access-Control-Allow- options didn't help. so figure out which ones can be removed
         'Access-Control-Allow-Headers': '*',
         'Access-Control-Allow-Origin': '*', // keys.mainUri, //'https://www.facebook.com', //'http://localhost:3000', '*'
         'Access-Control-Allow-Methods': '*', // 'OPTIONS, POST, GET',
      },
   };
}

// see explanation here
// https://dev.to/oyetoket/fastest-way-to-generate-random-strings-in-javascript-2k5a
const partRandomString = () => Math.random().toString(20).substr(2); // this seems to be about 14 - 16 chars long
const makeStateCheckValue = () => R.concat(partRandomString(), partRandomString()); // this should be close to 30 chars

const createStateCheck = async () => {
   try {
      const newStateCheck = new StateCheckModel({ stateCheckValue: makeStateCheckValue() });
      await newStateCheck.save();
      return newStateCheck;
   } catch (err) {
      console.log('Error creating state check:', err);
      return err;
   }
};

const confirmStateCheck = async stateCheckValue => {
   const stateCheck = await StateCheckModel.find({ stateCheckValue });
   console.log('authHelpers.confirmStateCheck got stateCheckValue', stateCheckValue, 'and when looking for that value in the db, got the response', stateCheck);
   if (!arrayContainsSomething(stateCheck)) {
      return false;
   }
   try {
      await StateCheckModel.deleteOne({ stateCheckValue });
   } catch(err) {
      console.log('Warning: error deleting used stateCheck (however it will be auto-deleted)', err);
   }
   return true;
}

module.exports = { prepareAuthResponse, confirmStateCheck, createStateCheck };