const mongoose = require('mongoose');
const { Schema } = mongoose;

const freezeSchema = new Schema({
   index: { type: Number, required: true },
   isFrozen: { type: Boolean, default: false },
});

mongoose.model('freeze', freezeSchema);