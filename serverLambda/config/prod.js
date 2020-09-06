module.exports = {
   mongoURI: process.env.MONGO_URI,
   options: { dbName: process.env.DB_NAME, useNewUrlParser: true, useUnifiedTopology: true },
   whitelist: process.env.WHITELIST.split(','),
   facebookClientID: process.env.FACEBOOK_CLIENT_ID,
   facebookClientSecret: process.env.FACEBOOK_CLIENT_SECRET,
   facebookStateCheck: process.env.FACEBOOK_STATE_CHECK,
   authUri: process.env.AUTH_URI,
   authReturnURI: process.env.AUTH_RETURN_URI,
};
