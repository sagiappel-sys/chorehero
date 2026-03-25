# 🏆 ChoreHero

A gamified household chore management app built with the **MERN stack** — MongoDB, Express, React, Node.js.

## Features

- 🏠 Create or join households with an invite code
- 📋 Add, edit, and delete chores (admin only)
- ✅ Complete chores and earn points
- 🏆 Weekly leaderboard with hero banner
- 🔔 Real-time notifications via Socket.io
- 📱 Mobile-first responsive design

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS        |
| Backend   | Node.js, Express                    |
| Database  | MongoDB Atlas + Mongoose            |
| Auth      | JWT + bcrypt                        |
| Real-time | Socket.io                           |
| Routing   | React Router v6                     |

## Project Structure

```
chorehero/
├── client/          # React frontend (Vite)
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       └── services/
├── server/          # Express API
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   └── routes/
└── package.json     # Root workspace
```

## Getting Started

### Prerequisites
- Node.js v18+
- A free [MongoDB Atlas](https://cloud.mongodb.com) account

### Setup

1. **Clone the repo** and install dependencies:
   ```bash
   cd chorehero
   npm run install:all
   ```

2. **Create your `.env` file** in the `server/` folder:
   ```bash
   cp .env.example server/.env
   ```
   Fill in your `MONGODB_URI` and `JWT_SECRET`.

3. **Start both servers** (runs on ports 5000 + 5173):
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173)

## Environment Variables

Copy `.env.example` to `server/.env` and set:

| Variable       | Description                          |
|----------------|--------------------------------------|
| `MONGODB_URI`  | MongoDB Atlas connection string      |
| `JWT_SECRET`   | Any long random string               |
| `JWT_EXPIRE`   | Token expiry, e.g. `7d`             |
| `PORT`         | Server port (default: 5000)         |

## Deployment

- **Frontend**: Netlify, Vercel (build: `cd client && npm run build`, publish: `client/dist`)
- **Backend**: Railway, Render, Fly.io
- **Database**: MongoDB Atlas (free tier)
