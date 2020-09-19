const R = require('ramda');
const axios = require('axios');
const { isSomething, isNothing, arrayContainsSomething } = require('.');
const keys = require('../../config/keys');
const mongoose = require('mongoose');
require('../models/UserModel');
const UserModel = mongoose.model('user');
require('../models/SessionModel');
const SessionModel = mongoose.model('session');

const makeAuthCall = async pendingAction => {
   console.log('makeAuthCall got pendingAction', pendingAction);
   const facebookEndpoint =
      'https://www.facebook.com/v8.0/dialog/oauth?' +
      `client_id=${keys.facebookClientID}` +
      `&redirect_uri=${keys.authReturnURI}` +
      `&state=${keys.facebookStateCheck}` +
      `&response_type=code,granted_scopes` +
      `&scope=email`;

   // redirect to facebook login page
   // 307:
   // Wikipedia says: "307 Temporary Redirect (since HTTP/1.1)
   // In this case, the request should be repeated with another URI; however, future requests should still use the original URI."
   // 303:
   // MDN says "The HyperText Transfer Protocol (HTTP) 303 See Other redirect status response code indicates that
   // the redirects don't link to the newly uploaded resources, but to another page
   // (such as a confirmation page or an upload progress page).
   // This response code is usually sent back as a result of PUT or POST.
   // The method used to display this redirected page is always GET.""
   // 302: (used by Passport)
   // MDN says: "The HyperText Transfer Protocol (HTTP) 302 Found redirect status response code indicates
   // that the resource requested has been temporarily moved to the URL given by the Location header.
   // ...It is therefore recommended to set the 302 code only as a response for GET or HEAD methods"
   return {
      statusCode: 302,
      headers: {
         Location: facebookEndpoint,
         'Access-Control-Allow-Headers': '*',
         'Access-Control-Allow-Origin': '*', //'https://www.facebook.com', //'http://localhost:3000', '*'
         'Access-Control-Allow-Methods': '*', // 'OPTIONS, POST, GET',
      },
      body: null, // this causes a warning to be thrown, saying we should have a body, but we're redirecting, so we have no use for a body
   };
};

const findUser = async ({ email, userIdFromProvider }) => {
   if (isSomething(email)) {
      const userEmailSearch = await UserModel.findOne({ email });
      if (isSomething(userEmailSearch)) {
         return userEmailSearch;
      }
   }
   if (isSomething(userIdFromProvider)) {
      const userIdFromProviderSearch = await UserModel.findOne({
         'access.userIdFromProvider': userIdFromProvider,
      });
      if (isSomething(userIdFromProviderSearch)) {
         return userIdFromProviderSearch;
      }
   }
   return Promise.resolve(null);
};

const validateNewUser = async user => {
   const { email, access } = user;
   if (isNothing(email) && !R.has('userIdFromProvider', access)) {
      return {
         isValid: false,
         error: new Error('must supply email or id to create a new user'),
      };
   }
   const existingUser = await findUser({ email, userIdFromProvider: access.userIdFromProvider });
   if (isSomething(existingUser)) {
      return {
         isValid: false,
         error: new Error('user already exists'),
      };
   }
   return { isValid: true, error: null };
};

const getFacebookToken = async code => {
   const fbAccessTokenEndpoint =
      'https://graph.facebook.com/v8.0/oauth/access_token?' +
      `client_id=${keys.facebookClientID}` +
      `&redirect_uri=${keys.authReturnURI}` +
      `&client_secret=${keys.facebookClientSecret}` +
      `&code=${code}`;
   try {
      const fbAccessRes = await axios.get(fbAccessTokenEndpoint);
      return { error: null, ...fbAccessRes.data };
   } catch (err) {
      console.log('Error getting fb access token:', err);
      return { token_error: err };
   }
};

const createSession = async () => {
   try {
      const newSession = await new SessionModel().save();
      return newSession;
   } catch (err) {
      console.log('Error creating session:', err);
      return err;
   }
};

const refreshSession = async sessionId => {
   try {
      const currentSession = await SessionModel.findById(sessionId);
      if (currentSession) {
         currentSession.lastAccessed = Date.now();
         const refreshsedSession = await currentSession.save();
         return refreshsedSession;
      }
      return null;
   } catch (err) {
      console.log('Error refreshing session', err);
      throw new Error('Error refreshing session: ' + err);
   }
};

const getSession = async user => {
   if (isSomething(user.session)) {
      try {
         const session = await refreshSession(user.session); //// "could not find session to refresh" here - shouldn't an error be thrown??
         if (session) {
            return session;
         }
      } catch (err) {
         throw new Error('could not refresh session: ' + err);
      }
   }
   try {
      const session = await createSession();
      return session;
   } catch (err) {
      throw new Error('could not create new session' + err);
   }
};

const applyAuthSession = async (user, access) => {
   // note: should be guaranteed to have a user and an accessToken at this point
   console.log('applyAuthSession got user', user, 'access', access);
   const session = await getSession(user);
   console.log('applyAuthSession, got session', session);
   user.session = session._id;
   user.access = access;
   console.log('applyAuthSession, user obj to be saved is', user);
   await user.save();
   return session;
};

const getUserInfoFromReq = reqHeaders => {
   // the cookies look something like this
   // 'someOtherCo=somecookie; deepdeepsheet=id%3D5f5d304159645625d49b2f0c%3Bsession%3D5f5d304159645625d49b2f0c; another=session%239etc'
   const maybeGetFirstCapturedGroup = captureArr =>
      isSomething(captureArr) && arrayContainsSomething(captureArr) && isSomething(captureArr[1]) ? captureArr[1] : '';
   const allCookiesRegex = new RegExp(/deepdeepsheet=([^ ;]*)/);
   const ddsCookie = R.pipe(
      allCookiesRegex.exec.bind(allCookiesRegex), // from https://stackoverflow.com/questions/20579033/why-do-i-need-to-write-functionvalue-return-my-functionvalue-as-a-callb
      maybeGetFirstCapturedGroup,
      decodeURIComponent
   )(reqHeaders.cookie);

   const getValueFromCookie = regex => R.pipe(regex.exec.bind(regex), maybeGetFirstCapturedGroup);

   const userIdRegex = new RegExp(/id=([^;]*)/);
   const userId = getValueFromCookie(userIdRegex)(ddsCookie);

   const sessionIdRegex = new RegExp(/session=(.*)/);
   const sessionId = getValueFromCookie(sessionIdRegex)(ddsCookie);

   return { userId, sessionId };
};

const validateUserSession = async reqHeaders => {
   const { userId, sessionId } = getUserInfoFromReq(reqHeaders);
   console.log('validateUserSession got userId', userId, 'sessionId', sessionId);
   if (isNothing(userId) || isNothing(sessionId)) {
      console.log('no user or session, so need to do login process');
      return false;
   }
   const user = await UserModel.findById(userId);
   console.log('found user', user);
   // see if the session in the user obj matches the session from the context
   // note that we can't test with double equals like this
   // user.session !== sessionId
   // because one is a string and the other is something else I think
   if (isNothing(user.session) || user.session != sessionId) {
      console.log('session is not current, user is not authorized');
      return false;

      // if not, then user needs to be re-authorized - pull that stuff out of auth.js and put into
      // userHelpers so we can call from here as well as auth.js
   }
   return true;
};

module.exports = { makeAuthCall, findUser, validateNewUser, getFacebookToken, applyAuthSession, validateUserSession };
