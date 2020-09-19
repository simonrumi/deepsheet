import * as R from 'ramda';
import { isSomething, arrayContainsSomething } from '.';

// note that this is pretty much the same as helpers/userHelpers.js/getUserInfoFromReq in server code
export const getUserInfoFromCookie = () => {
   // the cookies look something like this
   // 'someOtherCo=somecookie; deepdeepsheet=id%3D5f5d304159645625d49b2f0c%3Bsession%3D5f5d304159645625d49b2f0c; another=session%239etc'

   const maybeGetFirstCapturedGroup = captureArr =>
      isSomething(captureArr) && arrayContainsSomething(captureArr) && isSomething(captureArr[1]) ? captureArr[1] : '';

   const allCookiesRegex = new RegExp(/deepdeepsheet=([^ ;]*)/);
   const ddsCookie = R.pipe(
      allCookiesRegex.exec.bind(allCookiesRegex), // from https://stackoverflow.com/questions/20579033/why-do-i-need-to-write-functionvalue-return-my-functionvalue-as-a-callb
      maybeGetFirstCapturedGroup,
      decodeURIComponent
   )(window.document.cookie);

   const getValueFromCookie = regex => R.pipe(regex.exec.bind(regex), maybeGetFirstCapturedGroup);

   const userIdRegex = new RegExp(/id=([^;]*)/);
   const userId = getValueFromCookie(userIdRegex)(ddsCookie);

   const sessionIdRegex = new RegExp(/session=(.*)/);
   const sessionId = getValueFromCookie(sessionIdRegex)(ddsCookie);

   return { userId, sessionId };
};
