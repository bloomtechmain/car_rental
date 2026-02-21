import type { Request, Response } from 'express';
import { pool } from '../config/db.js';

export const getNotifications = async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
        const notifications = await pool.query(
            `SELECT n.*, b.renter_id, b.vehicle_id, v.make, v.model
             FROM notifications n
             JOIN bookings b ON n.booking_id = b.id
             JOIN vehicles v ON b.vehicle_id = v.id
             WHERE n.user_id = $1
             ORDER BY n.created_at DESC`,
            [userId]
        );

        res.status(200).json(notifications.rows);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Server error while fetching notifications.' });
    }
};

export const markAsRead = async (req: Request, res: Response) => {
    const { notificationId } = req.params;

    try {
        await pool.query(
            `UPDATE notifications SET is_read = TRUE WHERE id = $1`,
            [notificationId]
        );

        res.status(200).json({ message: 'Notification marked as read.' });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: 'Server error while marking notification as read.' });
    }
};
