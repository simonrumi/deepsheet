const proxy = require('http-proxy-middleware');

console.log('TODO: setupProxy is currently hardcorded to localhost:5000');

module.exports = function (app) {
   app.use(proxy(['/api', '/auth/google'], { target: 'http://localhost:5000' }));
};
