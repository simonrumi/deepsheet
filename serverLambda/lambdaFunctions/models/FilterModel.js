import mongoose from 'mongoose';
mongoose.Promise = global.Promise; // Per Stephen Grider: Mongoose's built in promise library is deprecated, replace it with ES2015 Promise
const { Schema, model } = mongoose;

const filterSchema = new Schema({
   index: { type: Number, required: true },
   filterExpression: { type: String, default: '' },
   hideBlanks: { type: Boolean, default: false },
   caseSensitive: { type: Boolean, default: false },
   regex: { type: Boolean, default: false },
});

export default model('filter', filterSchema);
