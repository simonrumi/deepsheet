console.log('TODO: seems like cient/src/setupProxy.js is not being used - investigate and remove');

const proxy = require('http-proxy-middleware');

console.log('TODO: setupProxy is currently hardcorded to localhost:5000');

module.exports = function (app) {
   app.use(proxy(['/api', '/auth/google'], { target: 'http://localhost:5000' }));
};
