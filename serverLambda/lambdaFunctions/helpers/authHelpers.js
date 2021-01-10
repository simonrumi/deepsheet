const R = require('ramda');
const mongoose = require('mongoose');
const { arrayContainsSomething } = require('./index');
const { findOrCreateUser, applyAuthSession, makeCookie } = require('./userHelpers');
require('../models/StateCheckModel');
const StateCheckModel = mongoose.model('stateCheck');

const prepareAuthResponse = async (userIdFromProvider, provider, token) => {
   const user = await findOrCreateUser({ userIdFromProvider, provider, token });
   const session = await applyAuthSession(user);
   const cookie = makeCookie(user._id, session._id);
   return {
      statusCode: 302,
      headers: {
         Location: 'http://localhost:3000',
         'Set-Cookie': cookie,
         // 'Access-Control-Allow-Headers': '*',
         // 'Access-Control-Allow-Origin': 'https://www.facebook.com', //'http://localhost:3000', '*'
         // 'Access-Control-Allow-Methods': '*', // 'OPTIONS, POST, GET',
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
      const result = await newStateCheck.save();
      return newStateCheck;
   } catch (err) {
      console.log('Error creating state check:', err);
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
      console.log('Warning: error deleting used stateCheck (however it will be auto-deleted)', err);
   }
   return true;
}

module.exports = { prepareAuthResponse, confirmStateCheck, createStateCheck };