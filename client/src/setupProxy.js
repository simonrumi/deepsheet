const proxy = require('http-proxy-middleware');

module.exports = function (app) {
   app.use(proxy(['/api', '/auth/google'], { target: 'http://localhost:5000' }));
   app.use(
      proxy('/.netlify/functions/', {
         target: 'http://localhost:9000',
         pathRewrite: { '^/\\.netlify/functions': '' }, // this removes .netlify/functions from the path
         // but both http://localhost:9000/.netlify/functions/hello and http://localhost:9000/hello work
      })
   );
   // app.use(proxy('/graphql', { target: 'http://localhost:5000' })); // experiment to see if graphql still works
};
