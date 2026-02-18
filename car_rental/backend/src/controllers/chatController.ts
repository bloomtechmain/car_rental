import { Server, Socket } from 'socket.io';
import { pool } from '../config/db.js';

const getRoomName = (user1: string, user2: string) => {
    return [user1, user2].sort().join('-');
};

export const initializeChat = (io: Server) => {
    io.on('connection', (socket: Socket) => {
        console.log('A user connected:', socket.id);

        socket.on('join_room', async (data: { userId1: string, userId2: string }) => {
            const roomName = getRoomName(data.userId1, data.userId2);
            socket.join(roomName);
            console.log(`User ${socket.id} joined room ${roomName}`);

            try {
                const history = await pool.query(
                    'SELECT * FROM messages WHERE room_name = $1 ORDER BY timestamp ASC',
                    [roomName]
                );
                socket.emit('chat_history', history.rows);
            } catch (error) {
                console.error('Error fetching chat history:', error);
            }
        });

        socket.on('send_message', async (data: { room_name: string, sender_id: string, content: string }) => {
            try {
                const result = await pool.query(
                    'INSERT INTO messages (room_name, sender_id, content) VALUES ($1, $2, $3) RETURNING *',
                    [data.room_name, data.sender_id, data.content]
                );
                const newMessage = result.rows[0];
                io.to(data.room_name).emit('receive_message', newMessage);
            } catch (error) {
                console.error('Error saving message:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
};