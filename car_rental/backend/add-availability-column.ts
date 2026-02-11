import { pool } from './src/config/db';

async function alterTable() {
    try {
        await pool.query(`
            ALTER TABLE vehicles 
            ADD COLUMN IF NOT EXISTS list_availability VARCHAR(100);
        `);
        console.log('Added list_availability column to vehicles table');
        process.exit(0);
    } catch (err: any) {
        console.error('Error altering table:', err.message);
        process.exit(1);
    }
}

alterTable();
