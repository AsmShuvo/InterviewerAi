<div align="center">

# InterviewerAI

### AI-Powered Mock Interview Platform

<p>Practice real interviews with AI. Get instant feedback, track your progress and climb the leaderboard.</p>

<br/>

<img src="https://img.shields.io/badge/Vue.js-3-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white" />
<img src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
<img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
<img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white" />
<img src="https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
<img src="https://img.shields.io/badge/Groq-LLaMA_3.3-F55036?style=for-the-badge&logo=meta&logoColor=white" />
<img src="https://img.shields.io/badge/Pinia-State-FEDD3E?style=for-the-badge&logo=vue.js&logoColor=black" />
<img src="https://img.shields.io/badge/Chart.js-Graphs-FF6384?style=for-the-badge&logo=chart.js&logoColor=white" />
<img src="https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" />

</div>

---

## Features

**Interview Engine**
- AI-generated questions tailored to your role, difficulty, and tech stack
- Supports **Technical**, **HR**, and **Mixed** interview types
- Choose question style: **Theoretical**, **Practical**, or **Both**
- Select from **70+ technologies** across Frontend, Backend, DevOps, and UI/UX
- Configurable question count (1-50 per session)

**Real-Time Evaluation**
- Instant AI-powered scoring (1-10) for each answer
- Detailed feedback: **strengths**, **weaknesses**, and a **better answer** suggestion
- Overall grade: **A** / **B** / **C** / **D** with final score

**Dashboard & Analytics**
- Score progression chart over time
- Stats: total interviews, average score, best score
- Weak topic identification (questions scoring below 6)
- Recent interview history with quick access

**Interview Room**
- Live timer with pause/resume functionality
- Progress bar tracking question completion
- Keyboard shortcut (Ctrl+Enter) for quick submission
- Auto-advance to next question after evaluation

**Leaderboard**
- Global rankings
- Filter by job role
- Personal best score tracking
- Highlighted user entry

**Profile Management**
- Update name, target role, and experience level
- Secure password change with current password verification

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Vue 3, Vite 8, Tailwind CSS 4, Pinia, Vue Router, Axios |
| **Backend** | Node.js, Express.js, Cookie Parser, CORS |
| **AI** | Groq SDK (LLaMA 3.3 70B Versatile) |
| **Database** | PostgreSQL (Neon Serverless) |
| **Auth** | JWT + HTTP-Only Cookies + bcryptjs |
| **Charts** | Chart.js + vue-chartjs |
| **Notifications** | vue3-toastify |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [PostgreSQL](https://www.postgresql.org/) database (or [Neon](https://neon.tech/) serverless)
- [Groq API Key](https://console.groq.com/)

### 1. Clone the repository

```bash
git clone https://github.com/AsmShuvo/InterviewerAi.git
cd InterviewerAI
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
PORT=5000
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

Start the backend server:

```bash
npm start
```

### 3. Setup Frontend

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000
```

Start the development server:

```bash
npm run dev
```

### 4. Open in browser

Visit [http://localhost:5173](http://localhost:5173) and create an account to get started.

---

## Database Schema

```
users
├── id (PK)
├── name
├── email (unique)
├── password (hashed)
├── role
├── target_role
├── experience_level
└── created_at

interviews
├── id (PK)
├── user_id (FK → users)
├── job_role
├── difficulty
├── interview_type
├── question_type
├── selected_stacks
├── question_count
├── total_score
├── grade
├── status (in_progress / completed)
└── created_at

questions
├── id (PK)
├── interview_id (FK → interviews)
├── question_text
├── answer_text
├── score
├── strength
├── weakness
├── better_answer
├── time_taken
└── order_number

leaderboard
├── id (PK)
├── user_id (FK → users)
├── interview_id (FK → interviews)
├── score
├── job_role
└── created_at
```

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/register` | Create account | No |
| `POST` | `/api/auth/login` | Login | No |
| `POST` | `/api/auth/logout` | Logout | Yes |
| `GET` | `/api/auth/me` | Get current user | Yes |
| `POST` | `/api/interview/start` | Start new interview | Yes |
| `POST` | `/api/interview/answer` | Submit answer | Yes |
| `GET` | `/api/interview/history` | Get all interviews | Yes |
| `GET` | `/api/interview/:id` | Get interview details | Yes |
| `GET` | `/api/dashboard/stats` | Get dashboard stats | Yes |
| `GET` | `/api/leaderboard` | Get top 20 scores | Yes |
| `PUT` | `/api/profile/update` | Update profile | Yes |
| `PUT` | `/api/profile/password` | Change password | Yes |

---

## Project Structure

```
InterviewerAI/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js          # PostgreSQL connection
│   │   │   └── groq.js        # Groq AI service
│   │   ├── middleware/
│   │   │   └── auth.js        # JWT authentication
│   │   ├── routes/
│   │   │   ├── auth.js        # Auth endpoints
│   │   │   ├── interview.js   # Interview endpoints
│   │   │   ├── leaderboard.js # Leaderboard endpoints
│   │   │   ├── dashboard.js   # Dashboard endpoints
│   │   │   └── profile.js     # Profile endpoints
│   │   └── server.js          # Express app entry
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── views/
│   │   │   ├── Register.vue
│   │   │   ├── Login.vue
│   │   │   ├── Dashboard.vue
│   │   │   ├── InterviewSetup.vue
│   │   │   ├── InterviewRoom.vue
│   │   │   ├── InterviewResult.vue
│   │   │   ├── History.vue
│   │   │   ├── Leaderboard.vue
│   │   │   └── Profile.vue
│   │   ├── stores/
│   │   │   └── auth.js        # Pinia auth store
│   │   ├── router/
│   │   │   └── index.js       # Vue Router config
│   │   ├── axios.js           # Axios instance
│   │   ├── App.vue
│   │   └── main.js
│   └── package.json
└── README.md
```

---

## Deployment

### Backend (Render)

1. Create a new **Web Service** on [Render](https://render.com/)
2. Set the root directory to `backend`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables: `DATABASE_URL`, `JWT_SECRET`, `GROQ_API_KEY`, `CORS_ORIGIN`, `NODE_ENV=production`

### Frontend (Vercel / Netlify)

1. Set the root directory to `frontend`
2. Build command: `npm run build`
3. Output directory: `dist`
4. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com`

---

<div align="center">

**Build by ASM Shuvo - CSE, SUST**

</div>
