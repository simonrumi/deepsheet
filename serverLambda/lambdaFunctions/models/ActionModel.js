const mongoose = require('mongoose');
const { Schema } = mongoose;

const actionSchema = new Schema({
	undoableType: { type: String, required: true },
	message: { type: String, required: true },
	timestamp: { type: Date, required: true },
});

mongoose.model('action', actionSchema);