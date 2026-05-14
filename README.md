# MeterFlow

MeterFlow is an API usage billing system. This repository contains the MVP of the platform, including user authentication (register/login) and a protected dashboard using the MERN stack (MongoDB, Express, React, Node.js).

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, React Router DOM, Axios
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT, BcryptJS

## Prerequisites
- Node.js (v16+)
- MongoDB connection string (local or MongoDB Atlas)

## Setup Instructions

### 1. Backend Setup

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   - Open `backend/.env`
   - Make sure `MONGO_URI` is set to a valid MongoDB connection string. For local MongoDB, it defaults to `mongodb://localhost:27017/meterflow`.
   - Ensure `JWT_SECRET` is set to a secure string.
4. Start the backend server:
   ```bash
   npm run dev
   # OR
   node server.js
   ```
   The backend should now be running on `http://localhost:5000`.

### 2. Frontend Setup

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend should now be running (usually on `http://localhost:5173`).

### 3. Usage
1. Go to the frontend URL in your browser.
2. You will be redirected to the `/dashboard` route, which will then bounce you to `/login` since you are not authenticated.
3. Click "create a new account" to go to the Signup page.
4. Register a new user. You will be automatically redirected to the dashboard.
5. You can log out using the sidebar and log back in to test the flow.

## Project Structure
- `backend/`: Express server, Mongoose models, authentication logic.
- `frontend/`: React single-page application using Tailwind CSS for UI.
