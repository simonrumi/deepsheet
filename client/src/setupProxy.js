const proxy = require('http-proxy-middleware');

// somehow this thing is getting used by the lambda functions.
// e.g. removing it causes the route http://localhost:9000/graphql not to work
module.exports = function (app) {
   app.use(
      proxy(['/.netlify/functions/', '/.netlify/functions/auth', '/.netlify/functions/authReturn'], {
         target: 'http://localhost:9000',
         pathRewrite: { '^/\\.netlify/functions': '' }, // this removes .netlify/functions from the path
         // but both http://localhost:9000/.netlify/functions/hello and http://localhost:9000/hello work
      })
   );
   // may want to do something like this for auth stuff
   // app.use(
   //    proxy(['/.netlify/functions/auth'], {
   //       target: 'http://localhost:9000/.netlify/functions',
   //       pathRewrite: { '^/\\.netlify/functions': '' },
   //    })
   // );
};
