import mongoose, { Schema, Document } from 'mongoose';
import '@/models/Category';

export interface IDevice extends Document {
  category: mongoose.Types.ObjectId;
  brand: string;
  model?: string;
}

const DeviceSchema: Schema<IDevice> = new Schema(
  {
    category: { type: mongoose.Types.ObjectId, ref: 'Category', required: true },
    brand: { type: String, required: true },
    model: { type: String },
  },
  {
    timestamps: true,
  }
);

const Device = mongoose.models.Device || mongoose.model<IDevice>('Device', DeviceSchema);

export default Device;
