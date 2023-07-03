import mongoose from 'mongoose';
mongoose.Promise = global.Promise; // Per Stephen Grider: Mongoose's built in promise library is deprecated, replace it with ES2015 Promise
const { Schema, model } = mongoose;

const inlineStyleRangeSchema = new Schema({
	offset: { type: Number },
	length: { type: Number },
	style: { type: String },
});

export default model('inlineStyleRange', inlineStyleRangeSchema);