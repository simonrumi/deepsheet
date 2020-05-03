const mongoose = require('mongoose');
const { Schema } = mongoose;
const CellModel = require('./CellModel');

const rowSchema = new Schema({
   row: { type: Number, required: true },
   columns: [CellModel],
});

mongoose.model('row', rowSchema);
