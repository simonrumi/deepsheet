// work out what set of credentials to return (dev or prod)
if (process.env.NODE_ENV === 'production') {
	module.exports = require('./prod');
} else {
	module.exports = require('./dev');
}
