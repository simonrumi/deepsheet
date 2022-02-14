const { createProxyMiddleware }  = require('http-proxy-middleware');

// somehow this thing is getting used by the lambda functions.
// e.g. removing it causes the route http://localhost:9000/graphql not to work
module.exports = function (app) {
   app.use(
		createProxyMiddleware(['/.netlify/functions/', '/.netlify/functions/auth', '/.netlify/functions/authReturn'], {
         target: 'http://localhost:9000',
         pathRewrite: { '^/\\.netlify/functions': '' }, // this removes .netlify/functions from the path
         // but both http://localhost:9000/.netlify/functions/hello and http://localhost:9000/hello work
      })
   );
};
