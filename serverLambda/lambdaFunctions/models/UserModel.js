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

mongoose.model('user', userSchema);
