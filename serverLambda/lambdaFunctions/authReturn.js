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
      `&redirect_uri=${keys.authUri}` +
      `&client_secret=${keys.facebookClientSecret}` +
      `&code=${code}`;

   try {
      console.log('authReturn.js looks good so GETting fbAccessTokenEndpoint', fbAccessTokenEndpoint);
      await axios.get(fbAccessTokenEndpoint);
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
      statusCode: 200,
      body: JSON.stringify({
         code,
      }),
   };
}
