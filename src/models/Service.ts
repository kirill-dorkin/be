import mongoose, { Schema, Document } from 'mongoose';

export interface IService extends Document {
  category: mongoose.Types.ObjectId;
  name: string;
  cost: number;
  duration?: string;
}

const ServiceSchema: Schema = new Schema(
  {
    category: { type: mongoose.Types.ObjectId, ref: 'Category', required: true },
    name: { type: String, required: true },
    cost: { type: Number, required: true },
    duration: { type: String },
  },
  {
    timestamps: true,
  }
);

const Service = mongoose.models.Service || mongoose.model<IService>('Service', ServiceSchema);

export default Service;
