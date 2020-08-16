const express = require('express');
const cors = require('cors');
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

// Set up a whitelist and check against it:
var corsOptions = {
   origin: function (origin, callback) {
      if (keys.whitelist.indexOf(origin) !== -1 || !origin) {
         callback(null, true);
      } else {
         callback(new Error('Not allowed by CORS'));
      }
   },
};
// Then pass them to cors:
app.use(cors(corsOptions));

app.use(
   '/graphql',
   expressGraphQL({
      schema: schema,
      // rootValue: root, // QQQ what's this again? SG doesn't use it
      graphiql: true,
   })
);

app.get('/hw', (req, res) => {
   res.send('Hello World!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT);
console.log('listening on port ' + PORT);
