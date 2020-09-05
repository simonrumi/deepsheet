const keys = require('../config/keys');

export async function handler(event, context, callback) {
   if (event.queryStringParameters.state !== keys.facebookStateCheck) {
      return {
         statusCode: 401,
         body: JSON.stringify({
            error: 'state check did not pass',
         }),
      };
   }
   return {
      statusCode: 200,
      body: JSON.stringify({
         code: event.queryStringParameters.code,
      }),
   };
}
