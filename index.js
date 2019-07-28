const express = require('express');
const mongoose = require('mongoose');
const keys = require('./config/keys');

mongoose
	.connect(
		keys.mongoURI,
		{ useNewUrlParser: true }
	)
	.catch(err => {
		console.log('Error connecting to mongodb: ' + err);
	});

const app = express();

const PORT = process.env.PORT || 5000;
app.listen(PORT);
console.log('listening on port ' + PORT);
