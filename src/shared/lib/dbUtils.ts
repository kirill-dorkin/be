import { connectToDatabase } from './dbConnect';
import User from '@/entities/user/User';

export const getUserByEmail = async (email: string) => {
  try {
    await connectToDatabase();
    const user = await User.findOne({ email });
    return user;
  } catch (error) {
    console.error("Error getting user by email:", error);
    throw new Error("Unable to fetch user.");
  }
};

export const saveUser = async (userData: {
  email: string;
  role: string;
  name?: string;
  image?: string;
}) => {
  try {
    await connectToDatabase();

    const updateData: { role: string; name?: string; image?: string } = {
      role: userData.role,
    };

    if (userData.name) {
      updateData.name = userData.name;
    }
    if (userData.image) {
      updateData.image = userData.image;
    }

    const updatedUser = await User.findOneAndUpdate(
      { email: userData.email },
      updateData,
      { upsert: true, new: true }
    );

    return updatedUser;
  } catch (error) {
    console.error("Error creating/updating user:", error);
    throw new Error("Unable to create or update user.");
  }
};
