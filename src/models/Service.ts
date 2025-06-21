import mongoose, { Schema, Document } from 'mongoose';

export interface IService extends Document {
  device: mongoose.Types.ObjectId;
  name: string;
  cost: number;
}

const ServiceSchema: Schema = new Schema(
  {
    device: { type: mongoose.Types.ObjectId, ref: 'Device', required: true },
    name: { type: String, required: true },
    cost: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

const Service = mongoose.models.Service || mongoose.model<IService>('Service', ServiceSchema);

export default Service;
