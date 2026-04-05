import { Router } from 'express';
import pool from '../config/db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/stats', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const total = await pool.query(
      "SELECT COUNT(*) as count FROM interviews WHERE user_id = $1 AND status = 'completed'",
      [userId]
    );

    const avg = await pool.query(
      "SELECT AVG(total_score) as avg_score FROM interviews WHERE user_id = $1 AND status = 'completed'",
      [userId]
    );

    const best = await pool.query(
      "SELECT MAX(total_score) as best_score FROM interviews WHERE user_id = $1 AND status = 'completed'",
      [userId]
    );

    // Score over time for chart
    const progress = await pool.query(
      "SELECT total_score, job_role, created_at FROM interviews WHERE user_id = $1 AND status = 'completed' ORDER BY created_at ASC LIMIT 20",
      [userId]
    );

    // Weak topics - questions with low scores
    const weakTopics = await pool.query(
      `SELECT i.job_role, AVG(q.score) as avg_score, COUNT(*) as count
       FROM questions q
       JOIN interviews i ON q.interview_id = i.id
       WHERE i.user_id = $1 AND q.score IS NOT NULL AND q.score < 6
       GROUP BY i.job_role
       ORDER BY avg_score ASC LIMIT 5`,
      [userId]
    );

    // Recent interviews
    const recent = await pool.query(
      "SELECT * FROM interviews WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5",
      [userId]
    );

    res.json({
      total_interviews: parseInt(total.rows[0].count),
      avg_score: parseFloat(avg.rows[0].avg_score) || 0,
      best_score: parseFloat(best.rows[0].best_score) || 0,
      progress: progress.rows,
      weak_topics: weakTopics.rows,
      recent_interviews: recent.rows
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
