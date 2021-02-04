const mongoose = require('mongoose');
mongoose.Promise = global.Promise; // Per Stephen Grider: Mongoose's built in promise library is deprecated, replace it with ES2015 Promise
const { Schema } = mongoose;

const sizingSchema = new Schema({
   index: { type: Number, required: true },
   size: { type: String, required: true },
});

mongoose.model('sizing', sizingSchema);