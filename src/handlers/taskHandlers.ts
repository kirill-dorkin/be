import User from '../models/User';

export const handleTaskEvents = (socket: any) => {
  socket.on('getAllTasks', async () => {
    try {
      const users = await User.find();
      socket.emit('tasksList', users);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      socket.emit('error', 'Failed to fetch tasks');
    }
  });
};


