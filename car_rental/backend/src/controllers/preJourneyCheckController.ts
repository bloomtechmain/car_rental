import type { Request, Response } from 'express';
import { pool } from '../config/db.js';

export const getPreJourneyCheckByBookingId = async (req: Request, res: Response) => {
    const { booking_id } = req.params;

    try {
        // Fetch the core pre-journey check data
        const checkResult = await pool.query(
            `SELECT * FROM pre_journey_checks WHERE booking_id = $1`,
            [booking_id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Pre-journey check not found for this booking.' });
        }

        const preJourneyCheck = checkResult.rows[0];

        // Fetch associated images
        const mediaResult = await pool.query(
            `SELECT file_url, purpose FROM vehicle_media WHERE vehicle_id = (
                SELECT vehicle_id FROM bookings WHERE id = $1
            )`,
            [booking_id]
        );

        const images = mediaResult.rows.filter(row => row.purpose === 'pre-journey').map(row => row.file_url);
        const postImages = mediaResult.rows.filter(row => row.purpose === 'post-journey').map(row => row.file_url);

        // Combine and send the response
        const response = {
            ...preJourneyCheck,
            images: images,
            post_images: postImages
        };

        return res.status(200).json(response);

    } catch (err: any) {
        console.error('Error fetching pre-journey check:', err);
        return res.status(500).json({ error: 'Server error', details: err.message });
    }
};

export const createPreJourneyCheck = async (req: Request, res: Response) => {
    const { booking_id, mileage_before, notes_before } = req.body;
    const files = req.files as Express.Multer.File[];

    if (!booking_id || !mileage_before) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Create the pre-journey check record
        const newCheck = await pool.query(
            `INSERT INTO pre_journey_checks (booking_id, mileage_before, notes_before)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [booking_id, mileage_before, notes_before]
        );

        const checkId = newCheck.rows[0].id;

        // Save image URLs
        if (files && files.length > 0) {
            const booking = await pool.query('SELECT vehicle_id FROM bookings WHERE id = $1', [booking_id]);
            const vehicleId = booking.rows[0].vehicle_id;

            const imagePromises = files.map(file => {
                const imageUrl = `uploads/${file.filename}`;
                return pool.query(
                    `INSERT INTO vehicle_media (vehicle_id, file_url, purpose)
                     VALUES ($1, $2, $3)`,
                    [vehicleId, imageUrl, 'pre-journey']
                );
            });
            await Promise.all(imagePromises);
        }

        return res.status(201).json(newCheck.rows[0]);
    } catch (err: any) {
        console.error('Error creating pre-journey check:', err);
        return res.status(500).json({ error: 'Server error', details: err.message });
    }
};
