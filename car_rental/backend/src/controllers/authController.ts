import type { Request, Response } from 'express';
import { pool } from '../config/db.js';

export const googleLogin = async (req: Request, res: Response) => {
    const { email, name, picture, sub } = req.body;
    console.log('Received Google Login Request:', { email, name, sub });

    if (!email) {
        console.error('Email missing in request');
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        // Check if user exists
        const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (userCheck.rows.length > 0) {
            console.log('User found, updating profile:', userCheck.rows[0].email);
            // User exists, update their name and picture, then return user
            const updatedUser = await pool.query(
                `UPDATE users SET full_name = $1, avatar_url = $2 WHERE email = $3 RETURNING *`,
                [name, picture, email]
            );
            return res.json(updatedUser.rows[0]);
        } else {
            console.log('Creating new user:', email);
            // Create new user
            const newUser = await pool.query(
                `INSERT INTO users (full_name, email, avatar_url, auth_provider, auth_provider_id, is_verified)
                 VALUES ($1, $2, $3, 'google', $4, true)
                 RETURNING *`,
                [name, email, picture, sub]
            );
            return res.json(newUser.rows[0]);
        }
    } catch (err: any) {
        console.error('Google login error:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};
