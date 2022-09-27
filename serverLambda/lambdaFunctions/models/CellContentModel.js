const mongoose = require('mongoose');
mongoose.Promise = global.Promise; // Per Stephen Grider: Mongoose's built in promise library is deprecated, replace it with ES2015 Promise
const { Schema } = mongoose;
const FormattedTextModel = require('./FormattedTextModel');

const cellContentSchema = new Schema({
   subsheetId: { type: Schema.Types.ObjectId, ref: 'Sheet' },
	formattedText: { type: FormattedTextModel },
});

mongoose.model('content', cellContentSchema);


   // text: { type: String }, // TIDY/TODO do we need to keep this in cellContentSchema to be backwardly compatible?