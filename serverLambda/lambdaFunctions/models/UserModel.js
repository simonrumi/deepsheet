const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema(
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
);

mongoose.model('user', userSchema);
