import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const stateCheckSchema = new Schema(
   {
      createdAt: { type: Date, expires: '60s', default: Date.now },
      stateCheckValue: { type: String, required: true },
   },
   { collection: 'stateChecks' }
);

export default model('stateCheck', stateCheckSchema);
