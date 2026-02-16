import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.sendStatus(401); // No token provided
    }

    const secret = process.env.GOOGLE_CLIENT_ID;
    if (!secret) {
        console.error('JWT Secret is not defined. Make sure GOOGLE_CLIENT_ID is in your .env file');
        return res.sendStatus(500); // Internal Server Error
    }

    try {
        // Verify the token synchronously within the try block
        const decoded: any = jwt.verify(token, secret);

        if (!decoded || !decoded.email) {
            return res.sendStatus(401); // Invalid token payload
        }

        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [decoded.email]);

        if (userResult.rows.length === 0) {
            return res.sendStatus(403); // User not found in our system
        }

        req.user = userResult.rows[0]; // Attach the full DB user record
        next(); // Proceed to the next middleware/route handler
    } catch (err) {
        // This block will now correctly catch errors from jwt.verify and the database query
        console.error('Authentication error:', err);
        return res.sendStatus(403); // Handles invalid signature, expiration, etc.
    }
};