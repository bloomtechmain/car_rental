import { pool } from '../config/db.js';

const addBookingDatesColumn = async () => {
    try {
        await pool.query(`
            ALTER TABLE bookings 
            ADD COLUMN IF NOT EXISTS booking_dates TEXT;
        `);
        console.log('Added booking_dates column to bookings table');
        process.exit(0);
    } catch (error) {
        console.error('Error adding booking_dates column:', error);
        process.exit(1);
    }
};

addBookingDatesColumn();
