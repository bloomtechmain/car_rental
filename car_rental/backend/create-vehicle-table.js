import { pool } from './src/config/db.js';
async function createTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS vehicles (
                id SERIAL PRIMARY KEY,
                owner_id UUID REFERENCES users(id),
                make VARCHAR(100) NOT NULL,
                model VARCHAR(100) NOT NULL,
                year INTEGER NOT NULL,
                license_plate VARCHAR(50) NOT NULL,
                price_per_day DECIMAL(10, 2) NOT NULL,
                location VARCHAR(255) NOT NULL,
                image_url TEXT,
                description TEXT,
                is_available BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Vehicles table created successfully');
        process.exit(0);
    }
    catch (err) {
        console.error('Error creating table:', err.message);
        process.exit(1);
    }
}
createTable();
//# sourceMappingURL=create-vehicle-table.js.map