import { Router } from 'express';
import pool from '../config/db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { job_role } = req.query;
    let query = `
      SELECT l.*, u.name as user_name
      FROM leaderboard l
      JOIN users u ON l.user_id = u.id
    `;
    const params = [];

    if (job_role) {
      query += ' WHERE l.job_role = $1';
      params.push(job_role);
    }

    query += ' ORDER BY l.score DESC LIMIT 20';

    const result = await pool.query(query, params);

    // Get current user's best score
    let userQuery = 'SELECT MAX(score) as best_score FROM leaderboard WHERE user_id = $1';
    const userParams = [req.user.id];
    if (job_role) {
      userQuery += ' AND job_role = $2';
      userParams.push(job_role);
    }
    const userBest = await pool.query(userQuery, userParams);

    res.json({
      leaderboard: result.rows,
      user_best: userBest.rows[0]?.best_score || null
    });
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
