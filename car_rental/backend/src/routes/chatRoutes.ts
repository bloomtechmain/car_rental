import { Router } from 'express';
import { pool } from '../config/db.js';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.get('/users', authenticateToken, async (req, res) => {
    console.log('Request received for /api/chat/users');
    if (!req.user || !req.user.id) {
        console.error('User not found on request object');
        return res.status(401).json({ error: 'Authentication failed' });
    }
    
    const userId = req.user.id;
    console.log(`Fetching chat users for userId: ${userId}`);

    try {
        const result = await pool.query(`
            SELECT DISTINCT u.id, u.full_name, u.avatar_url
            FROM users u
            JOIN (
                -- Renters of my vehicles
                SELECT b.renter_id AS user_id
                FROM bookings b
                JOIN vehicles v ON b.vehicle_id = v.id
                WHERE v.owner_id = $1

                UNION

                -- Owners of vehicles I rented
                SELECT v.owner_id AS user_id
                FROM bookings b
                JOIN vehicles v ON b.vehicle_id = v.id
                WHERE b.renter_id = $1
            ) AS interacted_users ON u.id = interacted_users.user_id
            WHERE u.id != $1;
        `, [userId]);

        console.log(`Database query returned ${result.rows.length} users.`);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching chat users:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
