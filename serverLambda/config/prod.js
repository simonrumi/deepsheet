module.exports = {
   mongoURI: process.env.MONGO_URI,
   options: { dbName: process.env.DB_NAME, useNewUrlParser: true, useUnifiedTopology: true },
   whitelist: process.env.WHITELIST.split(','),
   facebookClientID: process.env.FACEBOOK_CLIENT_ID,
   facebookClientSecret: process.env.FACEBOOK_CLIENT_SECRET,
   authReturnURI: process.env.AUTH_RETURN_URI,
   googleAuthReturnURI: process.env.GOOGLE_AUTH_RETURN_URI,
   googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
   googleClientID: process.env.GOOGLE_CLIENT_ID,
   mainUri: process.env.MAIN_URI,
   netlifyUri: process.env.NETLIFY_URI,
   loggingLevel: process.env.LOGGING_LEVEL,
};