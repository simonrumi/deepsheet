// work out what set of credentials to return (dev or prod)
console.log('config/keys.js got process.env', process.env);
if (process.env.NODE_ENV === 'production') {
	module.exports = require('./prod');
} else {
	module.exports = require('./dev');
}
