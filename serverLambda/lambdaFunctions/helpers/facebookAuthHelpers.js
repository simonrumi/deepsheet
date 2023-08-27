import axios from 'axios';
import keys from '../../config/keys';
import { log } from './logger';
import { LOG } from '../../constants';

export const getFacebookToken = async code => {
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
      log({ level: LOG.ERROR }, 'Error getting fb access token:', err.message);
      return { token_error: err };
   }
};

export const makeFacebookAuthCall = async state => {
   const redirectUrl =
      'https://www.facebook.com/v8.0/dialog/oauth?' +
      `client_id=${keys.facebookClientID}` +
      `&redirect_uri=${keys.authReturnURI}` +
      `&state=${state}` +
      `&response_type=code,granted_scopes` +
      `&scope=email`;

   /* 
   redirect to facebook login page
   307:
   Wikipedia says: "307 Temporary Redirect (since HTTP/1.1)
   In this case, the request should be repeated with another URI; however, future requests should still use the original URI."
   303:
   MDN says "The HyperText Transfer Protocol (HTTP) 303 See Other redirect status response code indicates that
   the redirects don't link to the newly uploaded resources, but to another page
   (such as a confirmation page or an upload progress page).
   This response code is usually sent back as a result of PUT or POST.
   The method used to display this redirected page is always GET.""
   302: (used by Passport)
   MDN says: "The HyperText Transfer Protocol (HTTP) 302 Found redirect status response code indicates
   that the resource requested has been temporarily moved to the URL given by the Location header.
   ...It is therefore recommended to set the 302 code only as a response for GET or HEAD methods" 
   */
	return { statusCode: 302, redirectUrl }
};

export const getFbUserId = async accessToken => {
   const fbUserData = await axios.get(`https://graph.facebook.com/me?fields=id&access_token=${accessToken}`);
   return fbUserData?.data?.id;
};