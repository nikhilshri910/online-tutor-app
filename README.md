# Online Tuition Platform (Local Setup)

This project is set up for **local development on Mac** with:
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MySQL
- Auth: JWT in HttpOnly cookies
- Live classes: Zoom links/webhook endpoint
- Recorded videos: Vimeo API integration

## Project Structure

```text
online-tuition/
├── backend/
│   ├── src/
│   │   ├── index.js
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── config/
│   └── .env.example
├── frontend/
│   ├── src/
│   └── vite.config.js
└── README.md
```

## 1) Backend Setup

### Install dependencies

```bash
cd backend
npm install
```

### Configure environment

```bash
cp .env.example .env
```

Update `.env` values for your local MySQL and keys.

### Run backend

```bash
npm run dev
```

Backend runs at `http://localhost:4000`.

### Health check

```bash
curl http://localhost:4000/health
```

Expected: JSON response with `status: ok`.

## 2) Database Schema (MySQL)

SQL files are inside `backend/src/config/`:
- `schema.sql` -> creates database/tables
- `seed.sql` -> sample users

### Create schema

```bash
mysql -u root -p < backend/src/config/schema.sql
```

### Seed users

Generate bcrypt hash first:

```bash
cd backend
npm run hash:password -- Password123!
```

Copy the generated hash and replace `REPLACE_WITH_BCRYPT_HASH` in `backend/src/config/seed.sql`, then run:

```bash
mysql -u root -p < backend/src/config/seed.sql
```

## 3) Authentication

Implemented APIs:
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Notes
- Passwords verified with `bcryptjs`
- JWT created on login
- JWT stored in **HttpOnly cookie**
- Role middleware included (`admin`, `teacher`, `student`)

## 4) Course & Enrollment APIs

- `POST /api/courses` (admin only) -> create course
- `POST /api/courses/:courseId/enroll` (student only) -> enroll self
- `GET /api/courses/my` (auth user) -> list courses for logged-in role

## 5) Zoom Integration (Local)

- `POST /api/courses/:courseId/live-sessions` -> store Zoom meeting link
- `POST /api/zoom/webhook` -> webhook receiver with verification placeholder

### Test Zoom webhook locally using ngrok

1. Start backend on port 4000.
2. Run ngrok tunnel:

```bash
ngrok http 4000
```

3. Copy the HTTPS forwarding URL from ngrok, for example:
   `https://abcd-1234.ngrok-free.app`

4. Set Zoom webhook URL to:
   `https://abcd-1234.ngrok-free.app/api/zoom/webhook`

5. For placeholder secret checking, send header `x-zoom-webhook-secret` matching `.env` `ZOOM_WEBHOOK_SECRET`.

## 6) Vimeo Integration

- `POST /api/courses/:courseId/recordings`

Request body:

```json
{
  "title": "Week 1 Recording",
  "sourceVideoUrl": "https://example.com/video.mp4"
}
```

What it does:
- Uses Vimeo API token from `.env` (`VIMEO_ACCESS_TOKEN`)
- Creates Vimeo video using pull upload
- Stores `vimeo_video_id` and `embed_url` in DB
- Returns `embedUrl` for frontend playback

## 7) Frontend Setup (React + Vite)

### Install dependencies

```bash
cd frontend
npm install
```

### Run frontend

```bash
npm run dev
```

Frontend runs at `http://localhost:5173`.

### Implemented frontend features

- Login page
- Protected routes
- Dashboard for student/teacher/admin
- Fetches `/api/courses/my`
- Shows **Join Live Class** button for Zoom links
- Shows Vimeo embedded player for recordings
- Admin page at `/admin` for course creation

## Security Rules Applied

- No secrets committed in source
- Uses `.env` and `.env.example`
- JWT stored in HttpOnly cookies
- Input validation in controllers
- Role checks in middleware

## Quick Local Test Flow

1. Start MySQL locally.
2. Run schema + seed SQL.
3. Start backend: `cd backend && npm run dev`
4. Start frontend: `cd frontend && npm run dev`
5. Login with seeded test user credentials.
6. Create course (admin), enroll (student), add live session/recording (teacher/admin), and verify dashboard rendering.

