const keys = require('../config/keys');

// redirect to facebook login page
// 307 status = temporary redirect
// 301 = permanent redirect ...perhaps this is correct since it will always go here?

export async function handler(event, context, callback) {
   const facebookEndpoint =
      'https://www.facebook.com/v8.0/dialog/oauth?' +
      `client_id=${keys.facebookClientID}` +
      `&redirect_uri=${keys.authReturnURI}` +
      `&state=${keys.facebookStateCheck}` +
      `&response_type=code`;

   console.log('created facebookEndpoint', facebookEndpoint);

   const response = {
      statusCode: 301,
      headers: {
         Location: facebookEndpoint,
      },
   };

   return callback(null, response);

   // original, hello world kinda thing
   // return {
   //    statusCode: 200,
   //    body: JSON.stringify({ message: `this is the auth lambda function waith variable foo = ${foo}` }),
   // };
}
