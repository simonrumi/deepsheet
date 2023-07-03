import mongoose from 'mongoose';
mongoose.Promise = global.Promise; // Per Stephen Grider: Mongoose's built in promise library is deprecated, replace it with ES2015 Promise
const { Schema, model } = mongoose;
import CellContentModel from './CellContentModel';

const cellSchema = new Schema({
   row: { type: Number, required: true },
   column: { type: Number, required: true },
   content: { type: CellContentModel, required: true },
   visible: { type: Boolean, required: true, default: true },
});

export default model('cell', cellSchema);
