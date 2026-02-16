import type { Request, Response } from 'express';
import { pool } from '../config/db.js';

export const createBooking = async (req: Request, res: Response) => {
    const { vehicle_id, renter_id, booking_dates, total_price } = req.body;

    console.log('Received booking request:', req.body);

    if (!vehicle_id || !renter_id || !booking_dates || !total_price) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Parse dates and sort them
        const datesArray = Array.isArray(booking_dates) ? booking_dates : booking_dates.split(',').map((d: string) => d.trim());
        const sortedDates = datesArray.sort();
        const start_date = sortedDates[0];
        const end_date = sortedDates[sortedDates.length - 1];
        const datesString = datesArray.join(',');

        // Check for availability conflicts
        // This checks if any existing booking overlaps with the new range. 
        // Ideally we should check specific dates if we want non-contiguous bookings support.
        const conflictCheck = await pool.query(
            `SELECT * FROM bookings 
             WHERE vehicle_id = $1 
             AND status != 'cancelled'
             AND (
                (start_date <= $2 AND end_date >= $2) OR
                (start_date <= $3 AND end_date >= $3) OR
                (start_date >= $2 AND end_date <= $3)
             )`,
            [vehicle_id, end_date, start_date]
        );

        if (conflictCheck.rows.length > 0) {
            // Further refinement: Check if actual dates overlap if booking_dates column is populated
            // For now, simple range overlap is safer
            return res.status(409).json({ error: 'Vehicle is not available for these dates' });
        }

        const newBooking = await pool.query(
            `INSERT INTO bookings (vehicle_id, renter_id, start_date, end_date, total_price, status, booking_dates)
             VALUES ($1, $2, $3, $4, $5, 'pending', $6)
             RETURNING *`,
            [vehicle_id, renter_id, start_date, end_date, total_price, datesString]
        );

        console.log('Booking created:', newBooking.rows[0]);
        return res.status(201).json(newBooking.rows[0]);

    } catch (err: any) {
        console.error('Error creating booking:', err);
        return res.status(500).json({ error: 'Server error', details: err.message });
    }
};

export const getBookingsByRenter = async (req: Request, res: Response) => {
    const { renter_id } = req.params;
    try {
        const bookings = await pool.query(
            `SELECT b.*, v.make, v.model, v.image_url, v.location, v.owner_id
             FROM bookings b
             JOIN vehicles v ON b.vehicle_id = v.id
             WHERE b.renter_id = $1
             ORDER BY b.created_at DESC`,
            [renter_id]
        );
        return res.json(bookings.rows);
    } catch (err: any) {
        console.error('Error fetching renter bookings:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};

export const getHireOutsByOwner = async (req: Request, res: Response) => {
    const { owner_id } = req.params;
    try {
        const hireOuts = await pool.query(
            `SELECT b.*, v.make, v.model, v.image_url, u.full_name as renter_name, u.email as renter_email, u.avatar_url as renter_avatar
             FROM bookings b
             JOIN vehicles v ON b.vehicle_id = v.id
             JOIN users u ON b.renter_id = u.id
             WHERE v.owner_id = $1
             ORDER BY b.created_at DESC`,
            [owner_id]
        );
        return res.json(hireOuts.rows);
    } catch (err: any) {
        console.error('Error fetching owner hire-outs:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};

export const updateBookingStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['confirmed', 'rejected', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    try {
        const updatedBooking = await pool.query(
            `UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *`,
            [status, id]
        );

        if (updatedBooking.rows.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        return res.json(updatedBooking.rows[0]);
    } catch (err: any) {
        console.error('Error updating booking status:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};
