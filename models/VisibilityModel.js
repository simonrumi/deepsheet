const mongoose = require('mongoose');
const { Schema } = mongoose;

const visibilitySchema = new Schema({
   index: { type: Number },
   isVisible: { type: Boolean },
});

mongoose.model('visibility', visibilitySchema);
