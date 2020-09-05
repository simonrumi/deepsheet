const proxy = require('http-proxy-middleware');

module.exports = function (app) {
   app.use(
      proxy('/.netlify/functions/', {
         target: 'http://localhost:9000',
         pathRewrite: { '^/\\.netlify/functions': '' }, // this removes .netlify/functions from the path
         // but both http://localhost:9000/.netlify/functions/hello and http://localhost:9000/hello work
      })
   );
   // may want to do something like this for auth stuff
   /* app.use(
      proxy(['/auth/google', '/auth/facebook'], {
         target: 'http://localhost:9000/.netlify/functions',
         pathRewrite: { '^/\\.netlify/functions': '' },
      })
   ); */
};
