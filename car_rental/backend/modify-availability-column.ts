import { pool } from './src/config/db';

async function modifyTable() {
    try {
        await pool.query(`
            ALTER TABLE vehicles 
            ALTER COLUMN list_availability TYPE TEXT;
        `);
        console.log('Modified list_availability column to TEXT');
        process.exit(0);
    } catch (err: any) {
        console.error('Error altering table:', err.message);
        process.exit(1);
    }
}

modifyTable();
