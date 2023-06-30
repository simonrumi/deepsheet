//dev
const { LOG } = require('../constants');
console.log('config/dev.js got process.env', process.env);
// TODO NEXT - there is some issue with getting MONGO_URI_DEV
// so.... look into "contexts" in netlify, as we don't need to have a separate _DEV version for each environment variable anymore
// ...make use of that feature and could even drop the separate dev.js vs prod.js files perhaps
// see the console log - there is no MONGO
module.exports = {
   mongoURI: process.env.MONGO_URI,
   options: { dbName: process.env.DB_NAME_DEV, useNewUrlParser: true, useUnifiedTopology: true },
   // whitelist: process.env.WHITELIST.split(','), // TODO think this is not used, so get rid of it
   facebookClientID: process.env.FACEBOOK_CLIENT_ID_DEV,
   facebookClientSecret: process.env.FACEBOOK_CLIENT_SECRET_DEV,
   authReturnURI: process.env.AUTH_RETURN_URI_DEV,
   googleAuthReturnURI: process.env.GOOGLE_AUTH_RETURN_URI_DEV,
   googleClientSecret: process.env.GOOGLE_CLIENT_SECRET_DEV,
   googleClientID: process.env.GOOGLE_CLIENT_ID_DEV,
   mainUri: process.env.MAIN_URI_DEV,
   // netlifyUri: process.env.NETLIFY_URI,
   loggingLevel: LOG.VERBOSE,
};