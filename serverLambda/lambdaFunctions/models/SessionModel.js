const mongoose = require('mongoose');
const { Schema } = mongoose;

const sessionSchema = new Schema(
   {
      lastAccessed: { type: Date, expires: '60m', default: Date.now },
   },
   { collection: 'sessions' }
);

mongoose.model('session', sessionSchema);
