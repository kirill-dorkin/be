import User from '../models/User';

export const handleUserEvents = (socket: any) => {
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

