const keys = require('../config/keys');

export async function handler(event, context, callback) {
   console.log('redirectTest got event', event);
   const cookieStr = encodeURIComponent('foo');
   const maxAge = 60 * 60 * 24 * 30; // i.e. set cookie to expire after 30 days
   const cookie = 'deepdeepsheetest=' + cookieStr + '; Max-Age=' + maxAge;
   const location = keys.mainUri + '/.netlify/functions/returnTest';
   console.log('redirectTest about to redirect to location', location);
   return {
      statusCode: 302,
      headers: {
         'Location': location,
         'Access-Control-Expose-Headers': 'Set-Cookie',
         'Set-Cookie': cookie,
         'Access-Control-Allow-Origin': '*',
      },
   };
}