import mongoose from 'mongoose';
mongoose.Promise = global.Promise; // Per Stephen Grider: Mongoose's built in promise library is deprecated, replace it with ES2015 Promise
const { Schema, model } = mongoose;
import BlockModel from './BlockModel';

const formattedTextSchema = new Schema({
	blocks: [BlockModel],
});

export default model('formattedText', formattedTextSchema);