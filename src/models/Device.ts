import mongoose, { Schema, Document } from 'mongoose';
import '@/models/Category';

export interface IDevice extends Document {
  category: mongoose.Types.ObjectId;
  brand: string;
  modelName?: string;
}

const DeviceSchema = new Schema<IDevice>(
  {
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    brand: { type: String, required: true },
    modelName: { type: String },
  },
  {
    timestamps: true,
  }
);

const Device = mongoose.models.Device || mongoose.model<IDevice>('Device', DeviceSchema);

export default Device;
