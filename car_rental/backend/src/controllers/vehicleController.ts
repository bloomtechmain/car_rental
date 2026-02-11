import type { Request, Response } from 'express';
import { pool } from '../config/db.js';

export const createVehicle = async (req: Request, res: Response) => {
    const { owner_id, make, model, year, license_plate, price_per_day, location, description, list_availability } = req.body;
    
    // Handle image upload
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    console.log('Received Create Vehicle Request:', req.body);
    console.log('File:', req.file);

    if (!owner_id || !make || !model || !year || !license_plate || !price_per_day || !location) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const newVehicle = await pool.query(
            `INSERT INTO vehicles (owner_id, make, model, year, license_plate, price_per_day, location, image_url, description, list_availability)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             RETURNING *`,
            [
                owner_id, 
                make, 
                model, 
                parseInt(year), 
                license_plate, 
                parseFloat(price_per_day), 
                location, 
                image_url, 
                description,
                list_availability
            ]
        );
        
        console.log('Vehicle created:', newVehicle.rows[0].id);
        return res.status(201).json(newVehicle.rows[0]);
    } catch (err: any) {
        console.error('Error creating vehicle:', err);
        return res.status(500).json({ error: 'Server error', details: err.message });
    }
};

export const getVehicles = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM vehicles ORDER BY created_at DESC');
        return res.json(result.rows);
    } catch (err: any) {
        console.error('Error fetching vehicles:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};

export const getVehiclesByOwner = async (req: Request, res: Response) => {
    const { owner_id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM vehicles WHERE owner_id = $1 ORDER BY created_at DESC', [owner_id]);
        return res.json(result.rows);
    } catch (err: any) {
        console.error('Error fetching owner vehicles:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};
