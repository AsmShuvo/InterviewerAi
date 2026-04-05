import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.put('/update', authenticate, async (req, res) => {
  try {
    const { name, target_role, experience_level } = req.body;
    const result = await pool.query(
      'UPDATE users SET name = COALESCE($1, name), target_role = COALESCE($2, target_role), experience_level = COALESCE($3, experience_level) WHERE id = $4 RETURNING id, name, email, role, target_role, experience_level',
      [name, target_role, experience_level, req.user.id]
    );
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/password', authenticate, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Both passwords are required' });
    }

    const user = await pool.query('SELECT password FROM users WHERE id = $1', [req.user.id]);
    const valid = await bcrypt.compare(current_password, user.rows[0].password);
    if (!valid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hashed = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, req.user.id]);
    res.json({ message: 'Password updated' });
  } catch (err) {
    console.error('Password change error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
