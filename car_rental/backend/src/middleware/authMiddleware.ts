import type { Request, Response, NextFunction } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { pool } from '../config/db.js';

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.sendStatus(401); // No token provided
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
            clockTolerance: 30, // Allow a 30-second clock skew
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            return res.sendStatus(401); // Invalid token payload
        }

        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [payload.email]);

        if (userResult.rows.length === 0) {
            return res.sendStatus(403); // User not found in our system
        }

        req.user = userResult.rows[0]; // Attach the full DB user record
        next(); // Proceed to the next middleware/route handler
    } catch (err) {
        console.error('Authentication error:', err);
        return res.sendStatus(403); // Handles invalid token
    }
};