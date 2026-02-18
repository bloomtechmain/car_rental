import express from 'express';
import { pool } from '../config/db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get users that the current user has had a booking with (either as owner or renter)
router.get('/users', authenticateToken, async (req, res) => {
    try {
        const currentUserId = req.user.id;

        const result = await pool.query(`
            SELECT DISTINCT u.id, u.full_name AS name, u.email, u.avatar_url AS picture
            FROM users u
            JOIN (
                -- Vehicles I have rented
                SELECT v.owner_id AS user_id
                FROM bookings b
                JOIN vehicles v ON b.vehicle_id = v.id
                WHERE b.renter_id = $1
                UNION
                -- Users who have rented my vehicles
                SELECT b.renter_id AS user_id
                FROM bookings b
                JOIN vehicles v ON b.vehicle_id = v.id
                WHERE v.owner_id = $1
            ) AS interacted_users ON u.id = interacted_users.user_id
            WHERE u.id != $1; -- Exclude the current user
        `, [currentUserId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching chat users:', error);
        res.status(500).send('Server error');
    }
});

export default router;