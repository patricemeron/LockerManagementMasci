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
