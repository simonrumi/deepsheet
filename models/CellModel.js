const mongoose = require('mongoose');
const { Schema } = mongoose;
const ContentModel = require('./ContentModel');

const cellSchema = new Schema({
   row: { type: Number, required: true },
   column: { type: Number, required: true },
   content: { type: ContentModel, required: true },
   visible: { type: Boolean, required: true, default: true },
});

mongoose.model('cell', cellSchema);
