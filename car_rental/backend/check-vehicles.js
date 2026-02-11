import { pool } from './src/config/db.js';
async function checkVehicles() {
    try {
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'vehicles';
        `);
        console.log('Vehicles table schema:', res.rows);
        process.exit(0);
    }
    catch (err) {
        console.error('Error checking vehicles:', err.message);
        process.exit(1);
    }
}
checkVehicles();
//# sourceMappingURL=check-vehicles.js.map