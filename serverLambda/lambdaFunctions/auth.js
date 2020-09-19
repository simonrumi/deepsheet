const { makeAuthCall } = require('./helpers/userHelpers');

export async function handler(event, context, callback) {
   return await makeAuthCall();

   // NOTE: don't use async and callback together - both doing same job when redirecting - so this doesn't work
   //return callback(null, response);
}
