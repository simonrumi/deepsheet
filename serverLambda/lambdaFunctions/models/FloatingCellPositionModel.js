const mongoose = require('mongoose');
mongoose.Promise = global.Promise; // Per Stephen Grider: Mongoose's built in promise library is deprecated, replace it with ES2015 Promise
const { Schema } = mongoose;

const floatingCellPositionSchema = new Schema({
   left: { type: Number, required: true },
   top: { type: Number, required: true },
	width: { type: Number, required: false },
	height: { type: Number, required: false },
	right: { type: Number, required: false },
	bottom: { type: Number, required: false },
});

mongoose.model('floatingCellPosition', floatingCellPositionSchema);