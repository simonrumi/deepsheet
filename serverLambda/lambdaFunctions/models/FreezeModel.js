const mongoose = require('mongoose');
mongoose.Promise = global.Promise; // Per Stephen Grider: Mongoose's built in promise library is deprecated, replace it with ES2015 Promise
const { Schema } = mongoose;

const freezeSchema = new Schema({
   index: { type: Number, required: true },
   isFrozen: { type: Boolean, default: false },
});

mongoose.model('freeze', freezeSchema);