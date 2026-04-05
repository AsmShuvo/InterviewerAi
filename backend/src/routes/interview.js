import { Router } from 'express';
import pool from '../config/db.js';
import { authenticate } from '../middleware/auth.js';
import { generateQuestion, evaluateAnswer } from '../config/groq.js';

const router = Router();

router.post('/start', authenticate, async (req, res) => {
  try {
    const { job_role, difficulty, interview_type, question_type, selected_stacks, question_count } = req.body;
    if (!job_role || !difficulty || !interview_type || !question_count) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (question_count < 1 || question_count > 50) {
      return res.status(400).json({ error: 'Question count must be between 1 and 50' });
    }

    const stacksString = Array.isArray(selected_stacks) ? selected_stacks.join(', ') : (selected_stacks || job_role);

    const interview = await pool.query(
      'INSERT INTO interviews (user_id, job_role, difficulty, interview_type, question_type, selected_stacks, question_count) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [req.user.id, job_role, difficulty, interview_type, question_type || 'both', stacksString, question_count]
    );

    const questionText = await generateQuestion(job_role, difficulty, interview_type, question_type || 'both', stacksString, []);

    const question = await pool.query(
      'INSERT INTO questions (interview_id, question_text, order_number) VALUES ($1, $2, 1) RETURNING *',
      [interview.rows[0].id, questionText]
    );

    res.status(201).json({
      interview: interview.rows[0],
      question: question.rows[0]
    });
  } catch (err) {
    console.error('Start interview error:', err);
    res.status(500).json({ error: 'Failed to start interview' });
  }
});

router.post('/answer', authenticate, async (req, res) => {
  try {
    const { interview_id, question_id, answer_text, time_taken } = req.body;
    if (!interview_id || !question_id || !answer_text) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const interview = await pool.query('SELECT * FROM interviews WHERE id = $1 AND user_id = $2', [interview_id, req.user.id]);
    if (interview.rows.length === 0) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    const iv = interview.rows[0];
    const currentQuestion = await pool.query('SELECT * FROM questions WHERE id = $1 AND interview_id = $2', [question_id, interview_id]);
    if (currentQuestion.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Evaluate the answer
    const evaluation = await evaluateAnswer(currentQuestion.rows[0].question_text, answer_text, iv.job_role, iv.difficulty, iv.selected_stacks);

    // Update question with answer and feedback
    await pool.query(
      'UPDATE questions SET answer_text = $1, score = $2, strength = $3, weakness = $4, better_answer = $5, time_taken = $6 WHERE id = $7',
      [answer_text, evaluation.score, evaluation.strength, evaluation.weakness, evaluation.better_answer, time_taken || 0, question_id]
    );

    const answeredCount = currentQuestion.rows[0].order_number;
    const isLast = answeredCount >= iv.question_count;

    if (isLast) {
      // Calculate total score and grade
      const scores = await pool.query('SELECT score FROM questions WHERE interview_id = $1', [interview_id]);
      const totalScore = scores.rows.reduce((sum, q) => sum + q.score, 0) / scores.rows.length;

      let grade;
      if (totalScore >= 9) grade = 'A';
      else if (totalScore >= 7) grade = 'B';
      else if (totalScore >= 5) grade = 'C';
      else grade = 'D';

      await pool.query(
        'UPDATE interviews SET total_score = $1, grade = $2, status = $3 WHERE id = $4',
        [totalScore.toFixed(2), grade, 'completed', interview_id]
      );

      // Add to leaderboard
      await pool.query(
        'INSERT INTO leaderboard (user_id, interview_id, score, job_role) VALUES ($1, $2, $3, $4)',
        [req.user.id, interview_id, totalScore.toFixed(2), iv.job_role]
      );

      return res.json({
        completed: true,
        evaluation,
        total_score: parseFloat(totalScore.toFixed(2)),
        grade
      });
    }

    // Generate next question
    const prevQuestions = await pool.query(
      'SELECT question_text FROM questions WHERE interview_id = $1 ORDER BY order_number',
      [interview_id]
    );
    const previousTexts = prevQuestions.rows.map(q => q.question_text);

    const nextQuestionText = await generateQuestion(iv.job_role, iv.difficulty, iv.interview_type, iv.question_type || 'both', iv.selected_stacks, previousTexts);

    const nextQuestion = await pool.query(
      'INSERT INTO questions (interview_id, question_text, order_number) VALUES ($1, $2, $3) RETURNING *',
      [interview_id, nextQuestionText, answeredCount + 1]
    );

    res.json({
      completed: false,
      evaluation,
      next_question: nextQuestion.rows[0]
    });
  } catch (err) {
    console.error('Answer error:', err);
    res.status(500).json({ error: 'Failed to process answer' });
  }
});

router.get('/history', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM interviews WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ interviews: result.rows });
  } catch (err) {
    console.error('History error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const interview = await pool.query(
      'SELECT * FROM interviews WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (interview.rows.length === 0) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    const questions = await pool.query(
      'SELECT * FROM questions WHERE interview_id = $1 ORDER BY order_number',
      [req.params.id]
    );

    res.json({
      interview: interview.rows[0],
      questions: questions.rows
    });
  } catch (err) {
    console.error('Interview detail error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
