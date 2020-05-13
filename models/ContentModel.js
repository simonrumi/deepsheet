const mongoose = require('mongoose');
const { Schema } = mongoose;

const contentSchema = new Schema({
   subsheetId: { type: Schema.Types.ObjectId, ref: 'Sheet' },
   text: { type: String },
});

mongoose.model('content', contentSchema);
