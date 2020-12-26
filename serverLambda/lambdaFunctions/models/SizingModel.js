const mongoose = require('mongoose');
const { Schema } = mongoose;

const sizingSchema = new Schema({
   index: { type: Number, required: true },
   size: { type: String, required: true },
});

mongoose.model('sizing', sizingSchema);