const mongoose = require('mongoose');
mongoose.Promise = global.Promise; // Per Stephen Grider: Mongoose's built in promise library is deprecated, replace it with ES2015 Promise
const { Schema } = mongoose;

const inlineStyleRangeSchema = new Schema({
	offset: { type: Number },
	length: { type: Number },
	style: { type: String },
});

mongoose.model('inlineStyleRange', inlineStyleRangeSchema);