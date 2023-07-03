import mongoose from 'mongoose';
mongoose.Promise = global.Promise; // Per Stephen Grider: Mongoose's built in promise library is deprecated, replace it with ES2015 Promise
const { Schema, model } = mongoose;

const stateCheckSchema = new Schema(
   {
      createdAt: { type: Date, expires: '60s', default: Date.now },
      stateCheckValue: { type: String, required: true },
   },
   { collection: 'stateChecks' }
);

export default model('stateCheck', stateCheckSchema);
