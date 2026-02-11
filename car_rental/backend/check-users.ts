import { pool } from './src/config/db';

async function checkUsers() {
    try {
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users';
        `);
        console.log('Users table schema:', res.rows);
        process.exit(0);
    } catch (err: any) {
        console.error('Error checking users:', err.message);
        process.exit(1);
    }
}

checkUsers();