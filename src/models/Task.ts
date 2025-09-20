import mongoose, { Schema } from 'mongoose';
import { Status } from "@/types";

export interface ITask {
  _id?: mongoose.Types.ObjectId;
  description: string;
  workerId: mongoose.Types.ObjectId | null;
  customerName: string;
  customerPhone: string;
  status: Status;
  laptopBrand: string;
  laptopModel: string;
  totalCost: number;
  createdAt: Date;
}

const TaskSchema: Schema<ITask> = new Schema({
  description: { type: String, required: true },
  workerId: { type: mongoose.Types.ObjectId, ref: 'User', default: null },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
  laptopBrand: { type: String, required: true },
  laptopModel: { type: String, required: true },
  totalCost: { type: Number, required: true, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const Task = mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);
export default Task;
