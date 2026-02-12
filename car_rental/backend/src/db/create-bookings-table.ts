import { pool } from '../config/db.js';

const createBookingsTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS bookings (
                id SERIAL PRIMARY KEY,
                vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
                renter_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                start_date DATE NOT NULL,
                end_date DATE NOT NULL,
                total_price DECIMAL(10, 2) NOT NULL,
                status VARCHAR(20) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Bookings table created successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error creating bookings table:', error);
        process.exit(1);
    }
};

createBookingsTable();
