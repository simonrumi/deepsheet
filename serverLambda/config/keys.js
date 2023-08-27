export default {
	mongoURI: process.env.MONGO_URI,
	options: { dbName: process.env.DB_NAME, maxPoolSize: 10 },
	whitelist: process.env.WHITELIST.split(','), // TODO think this is not used, so get rid of it
	facebookClientID: process.env.FACEBOOK_CLIENT_ID,
	facebookClientSecret: process.env.FACEBOOK_CLIENT_SECRET,
	authReturnURI: process.env.AUTH_RETURN_URI,
	googleAuthReturnURI: process.env.GOOGLE_AUTH_RETURN_URI,
	googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
	googleClientID: process.env.GOOGLE_CLIENT_ID,
	mainUri: process.env.MAIN_URI,
	netlifyUri: process.env.NETLIFY_URI,
	loggingLevel: process.env.LOGGING_LEVEL,
}

// TODO!! when pushing changes to prod, the MONGO_URI is slightly different now and needs to be changed for prod - get the new one from MongoDb itself