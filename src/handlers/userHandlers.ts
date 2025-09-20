import User from '../models/User';
import { Socket } from 'socket.io';

export const handleUserEvents = (socket: Socket) => {
  socket.on('getAllUsers', async () => {
    try {
      const users = await User.find();
      socket.emit('usersList', users);
    } catch (error) {
      console.error('Error fetching users:', error);
      socket.emit('error', 'Failed to fetch users');
    }
  });
};

