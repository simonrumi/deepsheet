const express = require('express');
const mongoose = require('mongoose');
const expressGraphQL = require('express-graphql');
const keys = require('./config/keys');

require('./models/SheetModel');

const schema = require('./schema/schema');

// Per Stephen Grider: Mongoose's built in promise library is deprecated, replace it with ES2015 Promise
mongoose.Promise = global.Promise;

mongoose.connect(keys.mongoURI, keys.options);
mongoose.connection
   .once('open', () => console.log('Connected to MongoLab instance.'))
   .on('error', error => console.log('Error connecting to MongoDB:', error));

const app = express();

app.use(
   '/graphql',
   expressGraphQL({
      schema: schema,
      // rootValue: root, // QQQ what's this again? SG doesn't use it
      graphiql: true,
   })
);

// require('./routes/sheetRoutes')(app); // dont think we need this as /graphql is middleware supplying routes now

const PORT = process.env.PORT || 5000;
app.listen(PORT);
console.log('listening on port ' + PORT);
