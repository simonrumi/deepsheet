const express = require('express');
const mongoose = require('mongoose');
const keys = require('./config/keys');
// const bodyParser = require('body-parser'); // TODO might want this, which makes req.body stuff easier to deal with and less error prone

require('./models/Sheet');
require('./models/Filter');

mongoose
	.connect(
		keys.mongoURI,
		keys.options
	)
	.catch(err => {
		console.log('Error connecting to mongodb: ' + err);
	});

const app = express();

require('./routes/sheetRoutes')(app);

const PORT = process.env.PORT || 5000;
app.listen(PORT);
console.log('listening on port ' + PORT);
