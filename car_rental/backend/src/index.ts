import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { pool } from './config/db.js';
import { initDB } from './db/init.js';
import authRoutes from './routes/authRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { createPostJourneyCheck } from './controllers/postJourneyCheckController.js';
import { createPreJourneyCheck, getPreJourneyCheckByBookingId } from './controllers/preJourneyCheckController.js';
import upload from './middleware/multer.js';


dotenv.config();

const app = express();

const port = process.env.PORT || 3000;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bookings', bookingRoutes);
app.post('/api/pre-journey-checks', upload.array('images'), createPreJourneyCheck);
app.post('/api/post-journey-checks', upload.array('images'), createPostJourneyCheck);
app.get('/api/pre-journey-checks/:booking_id', getPreJourneyCheckByBookingId);
app.use('/api/notifications', notificationRoutes);

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
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
});
