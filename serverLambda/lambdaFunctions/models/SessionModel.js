import mongoose from 'mongoose';
mongoose.Promise = global.Promise; // Per Stephen Grider: Mongoose's built in promise library is deprecated, replace it with ES2015 Promise
const { Schema, model } = mongoose;

const sessionSchema = new Schema(
   {
      lastAccessed: { type: Date, expires: '60m', default: Date.now },
   },
   { collection: 'sessions' }
);

export default model('session', sessionSchema);
