import express from 'express';
import cors from 'cors';
import { pool } from './config/db.js';
import { initDB } from './db/init.js';
import authRoutes from './routes/authRoutes.js';
import http from 'http';
import { Server } from 'socket.io';
import { initializeChat } from './controllers/chatController.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import chatRoutes from './routes/chatRoutes.js';



const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  path: "/my-custom-chat-path",
  cors: {
    origin: "http://localhost:5173",
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

initializeChat(io);

// Initialize DB and start server
initDB().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
});
