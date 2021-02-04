const mongoose = require('mongoose');
mongoose.Promise = global.Promise; // Per Stephen Grider: Mongoose's built in promise library is deprecated, replace it with ES2015 Promise
const { Schema } = mongoose;

const filterSchema = new Schema({
   index: { type: Number, required: true },
   filterExpression: { type: String, required: true, default: '' },
   caseSensitive: { type: Boolean, default: false },
   regex: { type: Boolean, default: false },
});

mongoose.model('filter', filterSchema);
