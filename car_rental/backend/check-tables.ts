import { pool } from './src/config/db.js';

async function checkTables() {
    try {
        const res = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public';
        `);
        console.log('Tables:', res.rows.map(r => r.table_name));
        process.exit(0);
    } catch (err: any) {
        console.error('Error checking tables:', err.message);
        process.exit(1);
    }
}

checkTables();
