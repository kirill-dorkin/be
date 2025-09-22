import mongoose, { Schema, Document } from 'mongoose';

export interface IRole extends Document {
  email: string;
  role: 'admin' | 'worker' | 'user';
}

const RoleSchema: Schema<IRole> = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ['admin', 'worker', 'user'],
    required: true,
  },
});

const Role = mongoose.models.Role || mongoose.model<IRole>('Role', RoleSchema);

export default Role;
