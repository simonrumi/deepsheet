import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const actionSchema = new Schema({
	undoableType: { type: String, required: true },
	message: { type: String, required: true },
	timestamp: { type: Date, required: true },
});

export default model('action', actionSchema);