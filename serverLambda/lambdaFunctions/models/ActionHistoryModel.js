const mongoose = require('mongoose');
mongoose.Promise = global.Promise; // Per Stephen Grider: Mongoose's built in promise library is deprecated, replace it with ES2015 Promise
const { Schema } = mongoose;
const ActionModel = require('./ActionModel');

const actionHistorySchema = new Schema({
   pastActions: [ActionModel],
	presentAction: ActionModel,
   futureActions: [ActionModel],
});

mongoose.model('actionHistory', actionHistorySchema);