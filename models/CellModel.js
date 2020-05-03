const mongoose = require('mongoose');
const { Schema } = mongoose;
const CellModel = require('./CellModel');

const cellSchema = new Schema({
   row: { type: Number, required: true },
   column: { type: Number, required: true },
   content: { type: Schema.Types.Mixed, required: true },
   visible: { type: Boolean, required: true, default: true },
});

mongoose.model('cell', cellSchema);
