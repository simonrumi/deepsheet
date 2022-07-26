const mongoose = require('mongoose');
mongoose.Promise = global.Promise; // Per Stephen Grider: Mongoose's built in promise library is deprecated, replace it with ES2015 Promise
const { Schema } = mongoose;
const InlineStyleRangeModel = require('./InlineStyleRangeModel');

const blockSchema = new Schema({
	data: {},
	depth: { type: Number },
	entityRanges: [{}],
	inlineStyleRanges: [InlineStyleRangeModel],
	key: { type: String },
	text: { type: String },
	type: { type: String },
});

mongoose.model('block', blockSchema);