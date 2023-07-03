import keys from '../config/keys';
import { log } from './helpers/logger';
import { LOG } from '../constants';
import mongoose from 'mongoose';
mongoose.Promise = global.Promise; // Per Stephen Grider: Mongoose's built in promise library is deprecated, replace it with ES2015 Promise

let cachedDbConnection = null;
const connectedTypes = [1, 2]; // 1 == connected, 2 == connecting
const dbConnector = async () => {
   if (cachedDbConnection && connectedTypes.includes(cachedDbConnection.readyState)) {
      log({ level: LOG.VERBOSE }, 'dbConnector returning cachedDbConnection');
      return cachedDbConnection;
   }
   try {
      const startTime = log({ level: LOG.VERBOSE, printTime: true }, 'dbConnector connecting to db');
		console.log('dbConnector about to connect to db with mongoose.connect(keys.mongoURI, keys.options), where keys.mongoURI is', keys.mongoURI);
      await mongoose.connect(keys.mongoURI, keys.options);
      log({ level: LOG.VERBOSE, startTime, printTime: true }, 'connected to mongodb!');
      cachedDbConnection = mongoose.connection;
      return cachedDbConnection;
   } catch (err) {
      log({ level: LOG.VERBOSE }, 'Error connecting to mongodb:', err.message);
   }
};

export default dbConnector;