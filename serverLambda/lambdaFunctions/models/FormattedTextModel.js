const mongoose = require('mongoose');
mongoose.Promise = global.Promise; // Per Stephen Grider: Mongoose's built in promise library is deprecated, replace it with ES2015 Promise
const { Schema } = mongoose;
const BlockModel = require('./BlockModel');
const PlaceholderObjectModel = require('./PlaceholderObjectModel');

const formattedTextSchema = new Schema({
	blocks: [BlockModel],
	entityMap: {},
});

mongoose.model('formattedText', formattedTextSchema);