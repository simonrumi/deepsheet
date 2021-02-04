const mongoose = require('mongoose');
mongoose.Promise = global.Promise; // Per Stephen Grider: Mongoose's built in promise library is deprecated, replace it with ES2015 Promise
const { Schema } = mongoose;
const CellContentModel = require('./CellContentModel');

const cellSchema = new Schema({
   row: { type: Number, required: true },
   column: { type: Number, required: true },
   content: { type: CellContentModel, required: true },
   visible: { type: Boolean, required: true, default: true },
});

mongoose.model('cell', cellSchema);
