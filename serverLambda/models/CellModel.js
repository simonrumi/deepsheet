const mongoose = require('mongoose');
const { Schema } = mongoose;
const CellContentModel = require('./CellContentModel');

const cellSchema = new Schema({
   row: { type: Number, required: true },
   column: { type: Number, required: true },
   content: { type: CellContentModel, required: true },
   visible: { type: Boolean, required: true, default: true },
});

mongoose.model('cell', cellSchema);
