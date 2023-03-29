const mongoose = require('mongoose');
mongoose.Promise = global.Promise; // Per Stephen Grider: Mongoose's built in promise library is deprecated, replace it with ES2015 Promise
const { Schema } = mongoose;
const CellContentModel = require('./CellContentModel');
const FloatingCellPositionModel = require('./FloatingCellPositionModel');

const floatingCellSchema = new Schema({
   number: { type: Number, required: true },
   content: { type: CellContentModel, required: true },
	position: { type: FloatingCellPositionModel, required: true }
});

mongoose.model('floatingCell', floatingCellSchema);