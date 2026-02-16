import { pool } from '../config/db.js';

export const initDB = async () => {
    try {
        // Create users table if not exists (defaulting to SERIAL if created now)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                full_name VARCHAR(255),
                email VARCHAR(255) UNIQUE NOT NULL,
                avatar_url TEXT,
                auth_provider VARCHAR(50),
                auth_provider_id VARCHAR(255),
                is_verified BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Check if users.id is UUID or Integer
        const userSchemaRes = await pool.query(`
            SELECT data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'id';
        `);
        
        const userIdType = userSchemaRes.rows[0]?.data_type;
        console.log(`Detected users.id type: ${userIdType}`);

        // Define foreign key type based on users.id
        const fkType = userIdType === 'uuid' ? 'UUID' : 'INTEGER';

        // Create vehicles table with dynamic foreign key type
        await pool.query(`
            CREATE TABLE IF NOT EXISTS vehicles (
                id SERIAL PRIMARY KEY,
                owner_id ${fkType} REFERENCES users(id) ON DELETE CASCADE,
                make VARCHAR(100),
                model VARCHAR(100),
                year INTEGER,
                license_plate VARCHAR(50),
                price_per_day DECIMAL(10, 2),
                location VARCHAR(255),
                image_url TEXT,
                description TEXT,
                list_availability TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Create bookings table with dynamic foreign key type
        await pool.query(`
            CREATE TABLE IF NOT EXISTS bookings (
                id SERIAL PRIMARY KEY,
                vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
                renter_id ${fkType} REFERENCES users(id) ON DELETE CASCADE,
                start_date DATE NOT NULL,
                end_date DATE NOT NULL,
                total_price DECIMAL(10, 2) NOT NULL,
                status VARCHAR(20) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS messages (
                id SERIAL PRIMARY KEY,
                room VARCHAR(255) NOT NULL,
                sender_id UUID REFERENCES users(id),
                content TEXT NOT NULL,
                timestamp TIMESTAMPTZ DEFAULT NOW()
            );
        `);

        console.log('Database tables initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
};
