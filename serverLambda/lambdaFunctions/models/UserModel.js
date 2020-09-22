const mongoose = require('mongoose');
const { Schema } = mongoose;

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

// original version with too much stuff in it
/* const userSchema = new Schema(
   {
      access: {
         token: { type: String },
         tokenProvider: { type: String },
         userIdFromProvider: { type: String },
         tokenType: { type: String },
         tokenExpires: { type: Number },
      },
      firstName: { type: String },
      lastName: { type: String },
      email: { type: String },
      sheets: [{ type: Schema.Types.ObjectId, ref: 'Sheet' }],
      session: { type: Schema.Types.ObjectId, ref: 'Session' },
   },
   { collection: 'users' }
); */

mongoose.model('user', userSchema);
