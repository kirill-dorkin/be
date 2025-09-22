import bcrypt from 'bcryptjs';
import { connectToDatabase } from './dbConnect';
import User from '@/entities/user/User';

export async function ensureDefaultAdmin() {
  try {
    await connectToDatabase();
    const existing = await User.findOne({ email: 'admin' });
    if (!existing) {
      const passwordHash = await bcrypt.hash('admin123#', 10);
      const admin = new User({
        name: 'Administrator',
        email: 'admin',
        role: 'admin',
        image: '/admin.png',
        passwordHash,
      });
      await admin.save();
      console.log('Default admin created');
    }
  } catch (err) {
    console.error('Error ensuring default admin:', err);
  }
}
