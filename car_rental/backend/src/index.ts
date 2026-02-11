import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);

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

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
