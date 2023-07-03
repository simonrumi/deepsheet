import mongoose from 'mongoose';
const { Schema, model } = mongoose;
import SheetModel from './SheetModel';
import ActionHistoryModel from './ActionHistoryModel';

const historySchema = new Schema({
   past: [SheetModel],
	present: SheetModel,
   future: [SheetModel],
   actionHistory: [ActionHistoryModel],
});

export default model('history', historySchema);