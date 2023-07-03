import mongoose from 'mongoose';
mongoose.Promise = global.Promise; // Per Stephen Grider: Mongoose's built in promise library is deprecated, replace it with ES2015 Promise
const { Schema, model } = mongoose;
import ActionModel from './ActionModel';

const actionHistorySchema = new Schema({
   pastActions: [ActionModel],
	presentAction: ActionModel,
   futureActions: [ActionModel],
});

export default model('actionHistory', actionHistorySchema);