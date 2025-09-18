import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

import { connectToDatabase } from './dbConnect';
import User from '../models/User';

export type SeedDefaultAdminResult = {
  email: string;
  created: boolean;
  password?: string;
};

const DEFAULT_PASSWORD_LENGTH = 16;

function generateTemporaryPassword(length = DEFAULT_PASSWORD_LENGTH) {
  let password = '';
  while (password.length < length) {
    const buffer = randomBytes(length).toString('base64');
    password += buffer.replace(/[^a-zA-Z0-9]/g, '');
  }

  return password.slice(0, length);
}

export async function seedDefaultAdmin(): Promise<SeedDefaultAdminResult> {
  const email = process.env.DEFAULT_ADMIN_EMAIL;

  if (!email) {
    throw new Error('DEFAULT_ADMIN_EMAIL environment variable must be set before seeding the default admin');
  }

  const name = process.env.DEFAULT_ADMIN_NAME ?? 'Administrator';
  const avatar = process.env.DEFAULT_ADMIN_AVATAR ?? '/admin.png';
  const suppliedPassword = process.env.DEFAULT_ADMIN_TEMP_PASSWORD;

  await connectToDatabase();

  const existing = await User.findOne({ email });
  if (existing) {
    return { email, created: false };
  }

  const password = suppliedPassword && suppliedPassword.length >= 12
    ? suppliedPassword
    : generateTemporaryPassword();

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = new User({
    name,
    email,
    role: 'admin',
    image: avatar,
    passwordHash,
  });

  await admin.save();

  return {
    email,
    created: true,
    password,
  };
}
