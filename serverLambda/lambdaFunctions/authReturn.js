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
         const basicUserInfo = await axios.get(
            `https://graph.facebook.com/me?fields=id,name,email&access_token=${access_token}`
         );
         console.log('got basicUserInfo.data', basicUserInfo.data);
         const { id, name, email } = basicUserInfo.data;

         return {
            statusCode: 200,
            body: JSON.stringify({
               access_token,
               token_type,
               expires_in,
               id,
               name,
               email,
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

   // if we get here then we didn't get an access token nor did we get an error.
   // This shouldn't happen....but leaving it here just in case
   return {
      statusCode: 401,
      body: JSON.stringify({
         error: 'authorization failed, but for no known reason',
      }),
   };
}
