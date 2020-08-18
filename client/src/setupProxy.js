const proxy = require('http-proxy-middleware');

console.log('TODO: setupProxy is currently hardcorded to localhost:5000');

module.exports = function (app) {
   app.use(proxy(['/api', '/auth/google'], { target: 'http://localhost:5000' }));
   app.use(
      proxy('/.netlify/functions/', {
         target: 'http://localhost:9000',
         pathRewrite: { '^/\\.netlify/functions': '' }, // this removes .netlify/functions from the path
         // but both http://localhost:9000/.netlify/functions/hello and http://localhost:9000/hello work
      })
   );
};
