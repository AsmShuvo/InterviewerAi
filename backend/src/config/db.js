import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        target_role VARCHAR(100),
        experience_level VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS interviews (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        job_role VARCHAR(100) NOT NULL,
        difficulty VARCHAR(50) NOT NULL,
        interview_type VARCHAR(50) NOT NULL,
        question_type VARCHAR(20) DEFAULT 'both',
        selected_stacks TEXT,
        question_count INTEGER NOT NULL,
        total_score DECIMAL(4,2),
        grade VARCHAR(2),
        status VARCHAR(20) DEFAULT 'in_progress',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        interview_id INTEGER REFERENCES interviews(id) ON DELETE CASCADE,
        question_text TEXT NOT NULL,
        answer_text TEXT,
        score INTEGER,
        strength TEXT,
        weakness TEXT,
        better_answer TEXT,
        time_taken INTEGER,
        order_number INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS leaderboard (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        interview_id INTEGER REFERENCES interviews(id) ON DELETE CASCADE,
        score DECIMAL(4,2) NOT NULL,
        job_role VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Add new columns if they don't exist (for existing databases)
    await client.query(`
      DO $$ BEGIN
        ALTER TABLE interviews ADD COLUMN IF NOT EXISTS question_type VARCHAR(20) DEFAULT 'both';
        ALTER TABLE interviews ADD COLUMN IF NOT EXISTS selected_stacks TEXT;
      EXCEPTION WHEN others THEN NULL;
      END $$;
    `);

    console.log('Database tables initialized');
  } finally {
    client.release();
  }
}

export default pool;
