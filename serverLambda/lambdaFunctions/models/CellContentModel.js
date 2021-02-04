const mongoose = require('mongoose');
mongoose.Promise = global.Promise; // Per Stephen Grider: Mongoose's built in promise library is deprecated, replace it with ES2015 Promise
const { Schema } = mongoose;

const cellContentSchema = new Schema({
   subsheetId: { type: Schema.Types.ObjectId, ref: 'Sheet' },
   text: { type: String },
});

mongoose.model('content', cellContentSchema);
