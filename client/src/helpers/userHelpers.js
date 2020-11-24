import * as R from 'ramda';
import { isSomething, arrayContainsSomething } from '.';
import { promptLogin } from '../actions/authActions';

// note that this is pretty much the same as helpers/userHelpers.js/getUserInfoFromReq in server code
export const getUserInfoFromCookie = () => {
   // the cookies look something like this
   // 'someOtherCo=somecookie; deepdeepsheet=id%3D5f5d304159645625d49b2f0c%3Bsession%3D5f5d304159645625d49b2f0c; another=session%239etc'

   const maybeGetFirstCapturedGroup = captureArr =>
      arrayContainsSomething(captureArr) && isSomething(captureArr[1]) ? captureArr[1] : '';

   const allCookiesRegex = new RegExp(/deepdeepsheet=([^ ;]*)/);
   const ddsCookie = R.pipe(
      allCookiesRegex.exec.bind(allCookiesRegex), // from https://stackoverflow.com/questions/20579033/why-do-i-need-to-write-functionvalue-return-my-functionvalue-as-a-callb
      maybeGetFirstCapturedGroup,
      decodeURIComponent
   )(window.document.cookie);

   const getValueFromCookie = regex => R.pipe(regex.exec.bind(regex), maybeGetFirstCapturedGroup);

   // user id is preceeded by I_ and ends with _
   const userIdRegex = new RegExp(/I_([^_]*)/);
   const userId = getValueFromCookie(userIdRegex)(ddsCookie);

   // session id is preceeded by S_
   const sessionIdRegex = new RegExp(/S_(.*)/);
   const sessionId = getValueFromCookie(sessionIdRegex)(ddsCookie);

   return { userId, sessionId };
};

export const maybeDealWith401Error = err => {
   if (/status code 401/.test(err)) {
      promptLogin();
   } else {
      console.error('maybeDealWith401Error got non-401 error:', err);
   }
};
