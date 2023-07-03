import mongoose from 'mongoose';
mongoose.Promise = global.Promise; // Per Stephen Grider: Mongoose's built in promise library is deprecated, replace it with ES2015 Promise
const { Schema, model } = mongoose;

const freezeSchema = new Schema({
   index: { type: Number, required: true },
   isFrozen: { type: Boolean, default: false },
});

export default model('freeze', freezeSchema);