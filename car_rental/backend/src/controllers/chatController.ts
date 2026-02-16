import { Server } from 'socket.io';
import { pool } from '../config/db.js';

export const initializeChat = (io: Server) => {
  io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('joinRoom', async (room) => {
      socket.join(room);
      console.log(`User joined room: ${room}`);
      
      // Fetch message history
      const history = await pool.query(
        'SELECT * FROM messages WHERE room = $1 ORDER BY timestamp ASC',
        [room]
      );
      socket.emit('history', history.rows);
    });

    socket.on('sendMessage', async (data) => {
      const { room, sender_id, content } = data;
      
      // Save message to DB and get the full message back
      const result = await pool.query(
        'INSERT INTO messages (room, sender_id, content) VALUES ($1, $2, $3) RETURNING *',
        [room, sender_id, content]
      );
      const newMessage = result.rows[0];

      // Broadcast the complete message from the DB
      io.to(room).emit('receiveMessage', newMessage);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
};