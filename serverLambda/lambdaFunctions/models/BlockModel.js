import mongoose from 'mongoose';
mongoose.Promise = global.Promise; // Per Stephen Grider: Mongoose's built in promise library is deprecated, replace it with ES2015 Promise
const { Schema, model } = mongoose;
import InlineStyleRangeModel from './InlineStyleRangeModel';

const blockSchema = new Schema({
	inlineStyleRanges: [InlineStyleRangeModel],
	key: { type: String },
	text: { type: String },
});

export default ('block', blockSchema);