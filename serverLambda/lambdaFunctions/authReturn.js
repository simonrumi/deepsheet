const axios = require('axios').default;
const keys = require('../config/keys');

export async function handler(event, context, callback) {
   const { code, state, error, error_reason, error_description } = event.queryStringParameters;
   console.log('authReturn.js got event.queryStringParameters', event.queryStringParameters);
   if (error) {
      console.log('authReturn.js will send 401 error', error);
      return {
         statusCode: 401,
         body: JSON.stringify({
            error,
            error_reason,
            error_description,
         }),
      };
   }

   if (state !== keys.facebookStateCheck) {
      console.log('authReturn.js did not pass the facebookStateCheck since it got state', state);
      return {
         statusCode: 401,
         body: JSON.stringify({
            error: 'state check did not pass',
         }),
      };
   }

   const fbAccessTokenEndpoint =
      'https://graph.facebook.com/v8.0/oauth/access_token?' +
      `client_id=${keys.facebookClientID}` +
      `&redirect_uri=${keys.authReturnURI}` +
      `&client_secret=${keys.facebookClientSecret}` +
      `&code=${code}`;

   try {
      console.log('authReturn.js looks good so GETting fbAccessTokenEndpoint', fbAccessTokenEndpoint);
      const response = await axios.get(fbAccessTokenEndpoint);
      console.log('authReturn.js tried to get FB accesstoken and got response.data', response.data);
      const { access_token, token_type, expires_in } = response.data;
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
   } catch (error) {
      console.log('Error getting fb access token:', error);
      return {
         statusCode: 401,
         body: JSON.stringify({
            error,
         }),
      };
   }

   console.log('authReturn.js got to the end and will return json string with code', code);
   return {
      statusCode: 401,
      body: JSON.stringify({
         error: 'authorization failed, but for no known reason',
      }),
   };
}
