import mongoose, { Schema, Document } from 'mongoose';
import '@/models/Category';

export interface IDevice extends Document {
  category: mongoose.Types.ObjectId;
  brand: string;
  deviceModel?: string;
}

const DeviceSchema: Schema<IDevice> = new Schema(
  {
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    brand: { type: String, required: true },
    deviceModel: { type: String },
  },
  {
    timestamps: true,
  }
);

const Device = mongoose.models.Device || mongoose.model<IDevice>('Device', DeviceSchema);

export { Device };
export default Device;
