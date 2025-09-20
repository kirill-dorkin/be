import Task from '../models/Task';
import { Socket } from 'socket.io';

export const handleTaskEvents = (socket: Socket) => {
  socket.on('getAllTasks', async () => {
    try {
      const tasks = await Task.find();
      socket.emit('tasksList', tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      socket.emit('error', 'Failed to fetch tasks');
    }
  });
};


