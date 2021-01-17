const axios = require('axios');
const keys = require('../../config/keys');

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

const makeFacebookAuthCall = async state => {
   const endpoint =
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
   return {
      statusCode: 302,
      headers: {
         Location: endpoint,
         // 'Access-Control-Allow-Headers': '*',
         // 'Access-Control-Allow-Origin': '*', //'https://www.facebook.com', //'http://localhost:3000', '*'
         // 'Access-Control-Allow-Methods': '*', // 'OPTIONS, POST, GET',
      },
      // not having a body causes a warning to be thrown, saying we should have a body,
      // but we're redirecting, so we have no use for a body...and in fact the redirect breaks if we do
   };
};

const getFbUserId = async accessToken => {
   const fbUserData = await axios.get(`https://graph.facebook.com/me?fields=id&access_token=${accessToken}`);
   return fbUserData?.data?.id;
};

module.exports = {
   getFacebookToken,
   makeFacebookAuthCall,
   getFbUserId,
};
