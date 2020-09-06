const keys = require('../config/keys');

export async function handler(event, context, callback) {
   const { access_token, token_type, expires_in } = event.body;
   console.log('auth.js got event.body', event.body);
   if (access_token) {
      return {
         statusCode: 200,
         body: JSON.stringify({
            access_token,
            token_type,
            expires_in,
         }),
      };
   }

   const facebookEndpoint =
      'https://www.facebook.com/v8.0/dialog/oauth?' +
      `client_id=${keys.facebookClientID}` +
      `&redirect_uri=${keys.authReturnURI}` +
      `&state=${keys.facebookStateCheck}` +
      `&response_type=code` +
      `&scope=email`;

   console.log('auth.js did not get access_token, so redirecting to facebookEndpoint', facebookEndpoint);

   // redirect to facebook login page
   // Wikipedia says: "307 Temporary Redirect (since HTTP/1.1)
   // In this case, the request should be repeated with another URI; however, future requests should still use the original URI.""
   const response = {
      statusCode: 307,
      headers: {
         Location: facebookEndpoint,
      },
      body: {},
   };
   return callback(null, response);
}
