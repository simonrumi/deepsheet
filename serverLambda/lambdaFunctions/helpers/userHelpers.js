const R = require('ramda');
const { isSomething, isNothing, arrayContainsSomething } = require('.');

const mongoose = require('mongoose');
require('../models/UserModel');
const UserModel = mongoose.model('user');
require('../models/SessionModel');
const SessionModel = mongoose.model('session');

const makeCookie = (userId, sessionId) => {
   if (isNothing(userId) || isNothing(sessionId)) {
      throw new Error('must have a userId and sessionId to make a cookie');
   }
   const cookieStr = encodeURIComponent('I_' + userId + '_S_' + sessionId);
   const maxAge = 60 * 60 * 24 * 30; // i.e. set cookie to expire after 30 days
   return 'deepdeepsheet=' + cookieStr + '; Max-Age=' + maxAge;
};

const standardAuthError = {
   statusCode: 401,
   body: JSON.stringify({
      error: 'authentication failed...bummer',
   }),
};

const findUser = async ({ userIdFromProvider, provider }) => {
   if (isSomething(userIdFromProvider)) {
      try {
         const existingUser = await UserModel.findOne({
            userIdFromProvider: userIdFromProvider.toString(),
            provider,
         });
         if (isSomething(existingUser)) {
            return existingUser;
         }
      } catch (err) {
         console.log('error finding user with userIdFromProvider', userIdFromProvider, 'error:', err);
         return null;
      }
   }
   console.log('findUser found nothing so returning null');
   return null;
};

const findOrCreateUser = async ({ userIdFromProvider, provider, token }) => {
   console.log('findOrCreateUser got userIdFromProvider', userIdFromProvider, 'provider', provider, 'token', token);
   const existingUser = await findUser({ userIdFromProvider, provider });
   console.log('findOrCreateUser got existingUser', existingUser);
   if (isSomething(existingUser)) {
      return existingUser;
   }
   const newUser = await createUser({ userIdFromProvider, provider, token });
   return newUser;
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
   console.log('refreshSession got sessionId', sessionId);
   try {
      const currentSession = await SessionModel.findById(sessionId);
      console.log('refreshSession got currentSession', currentSession);
      if (currentSession) {
         currentSession.lastAccessed = Date.now();
         const refreshsedSession = await currentSession.save();
         console.log('refreshSession returning refreshsedSession', refreshsedSession);
         return refreshsedSession;
      }
      console.log('refreshSession got no currentSession so returning null');
      return null;
   } catch (err) {
      console.log('Error refreshing session', err);
      throw new Error('Error refreshing session: ' + err);
   }
};

const getSession = async user => {
   if (isSomething(user.session)) {
      try {
         const session = await refreshSession(user.session);
         if (session) {
            console.log('getSession refreshed session and got session', session);
            return session;
         }
      } catch (err) {
         console.log('waring could not refresh session:', err);
         // however will continue and try to create a new session
      }
   }
   try {
      const session = await createSession();
      console.log('getSession created new session', session);
      return session;
   } catch (err) {
      throw new Error('could not create new session' + err);
   }
};

const applyAuthSession = async user => {
   // note: should be guaranteed to have a user and an accessToken at this point
   console.log('applyAuthSession got user', user);
   const session = await getSession(user);
   console.log('applyAuthSession, got session', session);
   user.session = session._id;
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

   // user id is preceeded by I_ and ends with _
   const userIdRegex = new RegExp(/I_([^_]*)/);
   const userId = getValueFromCookie(userIdRegex)(ddsCookie);

   // session id is preceeded by S_
   const sessionIdRegex = new RegExp(/S_(.*)/);
   const sessionId = getValueFromCookie(sessionIdRegex)(ddsCookie);

   return { userId, sessionId };
};

// graphql uses this to make sure it is ok to run queries
const validateUserSession = async reqHeaders => {
   const { userId, sessionId } = getUserInfoFromReq(reqHeaders);
   console.log('validateUserSession got userId', userId, 'sessionId', sessionId);
   if (isNothing(userId) || isNothing(sessionId)) {
      console.log('no user or session, so need to do login process');
      return false;
   }
   try {
      const user = await UserModel.findById(userId);
      // see if the session in the user obj matches the session from the context
      // note that we can't test with double equals like this
      // user.session !== sessionId
      // because one is a string and the other is something else (I think)
      if (isNothing(user.session) || user.session != sessionId) {
         console.log('session is not current, user is not authorized');
         return false;
      }
      const refreshedSession = await refreshSession(user.session);
      return isSomething(refreshedSession); // ***** REVERT THIS!!!
   } catch (err) {
      console.log('error validating user session', err);
      return false;
   }
};

const createUser = async userDetails => {
   console.log('createUser got userDetails', userDetails);
   try {
      const userArr = await UserModel.create([userDetails]);
      console.log('createUser created', userArr[0]);
      if (!arrayContainsSomething(userArr)) {
         throw new Error('error creating user - db returned nothing');
      }
      return userArr[0];
   } catch (err) {
      console.log('error creating user:', err);
      throw new Error('error creating user: ' + err);
   }
};

const addSheetToUser = async ({ user, userId, sheetId }) => {
   console.log('started addSheetToUser, got user', user, 'userId', userId, 'sheetId', sheetId);
   if (isNothing(user) && isNothing(userId)) {
      throw new Error('must supply either a user or a userId when adding a sheet');
   }
   if (isNothing(user)) {
      user = await UserModel.findById(userId);
      console.log('userHelpers addSheetToUser found user from userId', user);
      if (isNothing(user)) {
         throw new Error('Error adding sheet to user: no user found');
      }
   }
   const newSheets =
      isSomething(user.sheets) && arrayContainsSomething(user.sheets) ? R.append(sheetId, user.sheets) : [sheetId];
   try {
      const updatedUser = await UserModel.findOneAndUpdate(
         { _id: user._id },
         { sheets: newSheets },
         { returnOriginal: false, useFindAndModify: false }
      );
      return updatedUser;
   } catch (err) {
      throw new Error('error adding sheet to user', err);
   }
};

module.exports = {
   makeCookie,
   standardAuthError,
   applyAuthSession,
   validateUserSession,
   findOrCreateUser,
   findUser,
   addSheetToUser,
};
