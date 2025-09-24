import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  role: 'admin' | 'worker' | 'user';
  image: string;
  passwordHash?: string;
  tasks?: mongoose.Types.ObjectId[];
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['admin', 'user', 'worker'], required: true },
    image: { type: String, required: true },
    passwordHash: { type: String, required: false },
    tasks: [{ type: mongoose.Types.ObjectId, ref: 'Task', default: undefined }],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
