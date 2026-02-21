import type { Request, Response } from 'express';
import { pool } from '../config/db.js';

export const createPostJourneyCheck = async (req: Request, res: Response) => {
    const { booking_id, mileage_after, notes_after } = req.body;
    const files = req.files as Express.Multer.File[];

    if (!booking_id || !mileage_after) {
        return res.status(400).json({ error: 'Booking ID and mileage are required.' });
    }

    try {
        await pool.query('BEGIN');

        const updatedCheck = await pool.query(
            `UPDATE pre_journey_checks
             SET mileage_after = $1, notes_after = $2
             WHERE booking_id = $3
             RETURNING *`,
            [mileage_after, notes_after, booking_id]
        );

        if (updatedCheck.rows.length === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ error: 'Pre-journey check not found for this booking.' });
        }

        const bookingResult = await pool.query(
            `SELECT b.vehicle_id, v.owner_id
             FROM bookings b
             JOIN vehicles v ON b.vehicle_id = v.id
             WHERE b.id = $1`,
            [booking_id]
        );

        if (bookingResult.rows.length === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ error: 'Booking not found.' });
        }

        const { vehicle_id, owner_id } = bookingResult.rows[0];

        if (files && files.length > 0) {
            const imagePromises = files.map(file => {
                const imageUrl = `uploads/${file.filename}`;
                return pool.query(
                    `INSERT INTO vehicle_media (vehicle_id, file_url, purpose)
                     VALUES ($1, $2, $3)`,
                    [vehicle_id, imageUrl, 'post-journey']
                );
            });
            await Promise.all(imagePromises);
        }

        // Create a notification for the vehicle owner
        const message = `Your vehicle has completed its journey.`;
        await pool.query(
            `INSERT INTO notifications (user_id, booking_id, message)
             VALUES ($1, $2, $3)`,
            [owner_id, booking_id, message]
        );

        await pool.query('COMMIT');

        res.status(201).json(updatedCheck.rows[0]);
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ error: 'Server error while submitting post-journey check.' });
    }
};
