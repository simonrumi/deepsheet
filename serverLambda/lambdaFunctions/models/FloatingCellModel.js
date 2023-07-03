import mongoose from 'mongoose';
mongoose.Promise = global.Promise; // Per Stephen Grider: Mongoose's built in promise library is deprecated, replace it with ES2015 Promise
const { Schema, model } = mongoose;
import CellContentModel from './CellContentModel';
import FloatingCellPositionModel from './FloatingCellPositionModel';

const floatingCellSchema = new Schema({
   number: { type: Number, required: true },
   content: { type: CellContentModel, required: true },
	position: { type: FloatingCellPositionModel, required: true }
});

export default model('floatingCell', floatingCellSchema);