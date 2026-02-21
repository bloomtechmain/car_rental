import { pool } from '../config/db.js';

const createPreJourneyChecksTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS pre_journey_checks (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
                mileage_before INT,
                mileage_after INT,
                notes_before TEXT,
                notes_after TEXT,
                created_at TIMESTAMPTZ DEFAULT now()
            );
        `);
        console.log('Pre-journey checks table created or already exists.');
    } catch (error) {
        console.error('Error creating pre-journey checks table:', error);
    } finally {
        pool.end();
    }
};

createPreJourneyChecksTable();
