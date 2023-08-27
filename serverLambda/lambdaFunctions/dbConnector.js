import keys from '../config/keys';
import { log } from './helpers/logger';
import { LOG } from '../constants';
import mongoose from 'mongoose';

// no need to manage a connection pool as mongoose does it for us. The size of the pool is set in keys.js
// see https://mongoosejs.com/docs/6.x/docs/connections.html#connection_pools
const dbConnector = async (event, context) => {
	console.log('dbConnector started');

   try {
      const startTime = log({ level: LOG.VERBOSE, printTime: true }, 'dbConnector connecting to db');
      await mongoose.connect(keys.mongoURI, keys.options);
      log({ level: LOG.INFO, startTime, printTime: true }, 'connected to mongodb!');
      return mongoose.connection;
   } catch (err) {
      log({ level: LOG.VERBOSE }, 'Error connecting to mongodb:', err.message);
   }
};

export default dbConnector;