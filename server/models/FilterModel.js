const mongoose = require('mongoose');
const { Schema } = mongoose;

const filterSchema = new Schema({
   index: { type: Number, required: true },
   filterExpression: { type: String, required: true, default: '' },
   caseSensitive: { type: Boolean, default: false },
   regex: { type: Boolean, default: false },
});

mongoose.model('filter', filterSchema);
