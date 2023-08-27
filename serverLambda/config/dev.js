//dev // TIDY - remove this file
import { LOG } from '../constants'

export const mongoURI = process.env.MONGO_URI;
export const options = { dbName: process.env.DB_NAME_DEV, useNewUrlParser: true, useUnifiedTopology: true };
export const facebookClientID = process.env.FACEBOOK_CLIENT_ID_DEV;
export const facebookClientSecret = process.env.FACEBOOK_CLIENT_SECRET_DEV;
export const authReturnURI = process.env.AUTH_RETURN_URI_DEV;
export const googleAuthReturnURI = process.env.GOOGLE_AUTH_RETURN_URI_DEV;
export const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET_DEV;
export const googleClientID = process.env.GOOGLE_CLIENT_ID_DEV;
export const mainUri = process.env.MAIN_URI_DEV;
export const loggingLevel = LOG.DEBUG;

// old stuff probably not needed	
// whitelist: process.env.WHITELIST.split(','), // TODO think this is not used, so get rid of it	
// netlifyUri: process.env.NETLIFY_URI,


///
// mongoose.connect("mongodb+srv://<username>:<password>@cluster0.eyhty.mongodb.net/myFirstDatabase?retryWrites=true&w=majority")

// mongodb+srv://mongoadmin:EAZjP1d2SlosjyJl@cluster0.smwup.mongodb.net/?retryWrites=true&w=majority
// mongodb+srv://mongoadmin:EAZjP1d2SlosjyJl@cluster0-smwup.mongodb.net/test?retryWrites=true&w=majority