module.exports = {
   mongoURI: process.env.MONGO_URI,
   options: { dbName: process.env.DB_NAME, useNewUrlParser: true, useUnifiedTopology: true },
   // whitelist: process.env.WHITELIST, // do we need this?
};
