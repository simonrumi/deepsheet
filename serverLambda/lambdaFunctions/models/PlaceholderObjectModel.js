const mongoose = require('mongoose');
mongoose.Promise = global.Promise; // Per Stephen Grider: Mongoose's built in promise library is deprecated, replace it with ES2015 Promise
const { Schema } = mongoose;

/**
 * This is for us by some of the sub-objects of the FormattedTextModel - these are part of the object structure
 * used by Draft.js (which is the rich text editing libraray)
 * In the places where this Model is used, those parts of the Draft.js object have been empty, 
 * so we just need an empty {} in that location
 */
const placeholderObjectSchema = new Schema({
	// placeholderString: { type: String }
});

mongoose.model('placeholderObject', placeholderObjectSchema);

// TODO this whole file is almost certainly not needed