import { pool } from '../config/db.js';
export const googleLogin = async (req, res) => {
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
            console.log('User found:', userCheck.rows[0].email);
            // User exists, return user
            return res.json(userCheck.rows[0]);
        }
        else {
            console.log('Creating new user:', email);
            // Create new user
            const newUser = await pool.query(`INSERT INTO users (full_name, email, avatar_url, auth_provider, auth_provider_id, is_verified)
                 VALUES ($1, $2, $3, 'google', $4, true)
                 RETURNING *`, [name, email, picture, sub]);
            return res.json(newUser.rows[0]);
        }
    }
    catch (err) {
        console.error('Google login error:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};
//# sourceMappingURL=authController.js.map