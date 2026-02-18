import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import { pool } from './config/db.js';
import { initDB } from './db/init.js';
import authRoutes from './routes/authRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import { initializeChat } from './controllers/chatController.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { 
        origin: "*", // Be more specific in production
        methods: ["GET", "POST"]
    }
});

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/chat', chatRoutes);

initializeChat(io);

app.get('/', (req, res) => {
    res.send('Car Rental API is running');
});

// Test DB connection
app.get('/db-test', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json(result.rows[0]);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: 'Database connection error', details: err.message });
    }
});

// Initialize DB and start server
initDB().then(() => {
    server.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
});
