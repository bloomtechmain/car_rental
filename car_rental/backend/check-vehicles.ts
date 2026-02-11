import { pool } from './src/config/db';

async function checkVehicles() {
    try {
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'vehicles';
        `);
        console.log('Vehicles table schema:', res.rows);
        process.exit(0);
    } catch (err: any) {
        console.error('Error checking vehicles:', err.message);
        process.exit(1);
    }
}

checkVehicles();
