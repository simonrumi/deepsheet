const mongoose = require('mongoose');
const { Schema } = mongoose;
const SheetModel = require('./SheetModel');
const ActionHistoryModel = require('./ActionHistoryModel');

const historySchema = new Schema({
   past: [SheetModel],
	present: SheetModel,
   future: [SheetModel],
   actionHistory: [ActionHistoryModel],
});

mongoose.model('history', historySchema);