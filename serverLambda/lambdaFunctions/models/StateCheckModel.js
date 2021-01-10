const mongoose = require('mongoose');
const { Schema } = mongoose;

const stateCheckSchema = new Schema(
   {
      createdAt: { type: Date, expires: '60s', default: Date.now },
      stateCheckValue: { type: String, required: true },
   },
   { collection: 'stateChecks' }
);

mongoose.model('stateCheck', stateCheckSchema);
