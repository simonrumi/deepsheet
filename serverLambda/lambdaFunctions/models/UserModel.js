import mongoose from 'mongoose';
mongoose.Promise = global.Promise; // Per Stephen Grider: Mongoose's built in promise library is deprecated, replace it with ES2015 Promise
const { Schema, model } = mongoose;

const userSchema = new Schema(
   {
      token: { type: String },
      userIdFromProvider: { type: String, required: true },
      provider: { type: Number, required: true },
      sheets: [{ type: Schema.Types.ObjectId, ref: 'Sheet' }],
      session: { type: Schema.Types.ObjectId, ref: 'Session' },
   },
   { collection: 'users' }
);

export default model('user', userSchema);
