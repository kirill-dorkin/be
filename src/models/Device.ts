import mongoose, { Schema, Document } from 'mongoose';

export interface IDevice extends Document {
  name: string;
}

const DeviceSchema: Schema<IDevice> = new Schema(
  {
    name: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  }
);

const Device = mongoose.models.Device || mongoose.model<IDevice>('Device', DeviceSchema);

export default Device;
