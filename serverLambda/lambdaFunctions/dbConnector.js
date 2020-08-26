const keys = require('../config/keys');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise; // Per Stephen Grider: Mongoose's built in promise library is deprecated, replace it with ES2015 Promise

let cachedDbConnection = null;
const connectedTypes = [1, 2]; // 1 == connected, 2 == connecting
module.exports = async () => {
   if (cachedDbConnection && connectedTypes.includes(cachedDbConnection.readyState)) {
      return cachedDbConnection;
   }
   try {
      await mongoose.connect(keys.mongoURI, keys.options);
      console.log('connected to mongodb!');
      cachedDbConnection = mongoose.connection;
      return cachedDbConnection;
   } catch (err) {
      console.log('Error connecting to mongodb:', err);
   }
};
