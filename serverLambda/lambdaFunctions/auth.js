const keys = require('../config/keys');

// redirect to facebook login page
// 307 status = temporary redirect
// 301 = permanent redirect ...perhaps this is correct since it will always go here?

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
      `&response_type=code`;

   console.log('auth.js did not get access_token, so redirecting to facebookEndpoint', facebookEndpoint);

   const response = {
      statusCode: 301,
      headers: {
         Location: facebookEndpoint,
      },
   };
   return callback(null, response);
}
