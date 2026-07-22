# Locker Management

Student locker/door registration form (React) backed by an Express + MongoDB API.

- 70 lockers × 18 doors each. Once a student claims a locker/door, it's enforced
  unique at the database level (`{ lockerNumber, doorNumber }` unique index), so
  no other student can pick it afterwards — including under concurrent submissions.
- Grade is restricted to 7–12.
- `/` — student registration form.
- `/officers` — officer dashboard: locker grid (click a locker to see its doors),
  searchable table of all registrations, and the ability to remove a registration
  (frees the door back up).

## Structure

- `backend/` — Express API + Mongoose models, connects to MongoDB Atlas.
- `frontend/` — React app (Vite + react-router-dom).

## Setup

### Backend

```
cd backend
npm install
cp .env.example .env   # fill in MONGODB_URI with your Atlas connection string
npm run dev
```

Runs on http://localhost:4000.

### Frontend

```
cd frontend
npm install
cp .env.example .env   # defaults to http://localhost:4000/api
npm run dev
```

Runs on http://localhost:5173.

## Deploying to Render

This repo includes a `render.yaml` Blueprint that provisions both services in one
step: `locker-management-backend` (Web Service) and `locker-management-frontend`
(Static Site).

1. In the Render dashboard: **New +** → **Blueprint** → connect this GitHub repo.
   Render reads `render.yaml` and creates both services, but leaves their secret
   env vars blank (they're marked `sync: false` on purpose — never commit real
   secrets to the repo).
2. On **locker-management-backend**, set:
   - `MONGODB_URI` — your Atlas connection string
   - `OFFICER_PASSWORD` — the shared officer login password
   - `JWT_SECRET` — a random string, e.g. output of `openssl rand -hex 32`
   - `CLIENT_ORIGIN` — leave a placeholder for now (e.g. `http://localhost:5173`);
     you'll update it in step 4
3. Deploy the backend and copy its public URL (e.g. `https://locker-management-backend.onrender.com`).
4. On **locker-management-frontend**, set:
   - `VITE_API_URL` — `https://locker-management-backend.onrender.com/api`
   Deploy the frontend and copy its public URL.
5. Go back to **locker-management-backend**, update `CLIENT_ORIGIN` to the
   frontend's actual URL, and trigger a redeploy (this is what CORS uses to
   allow the frontend's requests).

Vite bakes `VITE_API_URL` in at build time, so if you ever change the backend's
URL, you need to update that var and redeploy the frontend, not just the backend.
