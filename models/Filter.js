const mongoose = require('mongoose');
const { Schema } = mongoose;

const filterSchema = new Schema({
	metadata: {
		filterExpression: { type: String, required: true, default: '' },
		caseSensitive: { type: Boolean, default: false },
		regex: { type: Boolean, default: false },
	},
});

mongoose.model('filters', filterSchema);
