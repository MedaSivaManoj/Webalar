# Real-Time Collaborative To-Do Board

## Project Overview
A modern, full-stack Kanban board application for task management and team collaboration. Features include real-time updates, analytics dashboard, activity log, card flip UI, comments, attachments, due dates, smart assignment, conflict handling, public board sharing, and full mobile responsiveness.

The frontend is deployed on **Vercel** and the backend on **Render**.

## Tech Stack
- **Frontend:** React, Chart.js, React Chart.js 2, CSS (custom, responsive, dark mode)
- **Backend:** Node.js, Express, MongoDB (Mongoose), Socket.io
- **Deployment:** Render (backend), Vercel (frontend) or your own host

## Setup & Installation

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the repository
```sh
git clone https://github.com/MedaSivaManoj/Webalar.git
cd project-root
```

### 2. Environment Variables

#### Backend (`backend/.env`)
Create a `.env` file in the `backend/` directory with the following variables:
```
MONGO_URI=your_mongodb_connection_string   # MongoDB Atlas or local connection string
JWT_SECRET=your_jwt_secret                # Any strong random string for JWT signing
CLIENT_URL=http://localhost:3000          # The URL of your frontend (for CORS)
```
- **Never commit your `.env` file or secrets to version control.**
- For production, set these variables in your Render (or other host) dashboard.

#### Frontend (`frontend/.env`)
Create a `.env` file in the `frontend/` directory with:
```
REACT_APP_API=http://localhost:5000        # The URL of your backend API
```
- For production, set `REACT_APP_API` to your deployed backend URL (e.g., `https://your-backend.onrender.com`).
- **Never expose secrets or private keys in the frontend `.env` file.**

### 3. Install dependencies
```sh
cd backend
npm install
cd ../frontend
npm install
```

### 4. Run the app locally
- **Backend:**
  ```sh
  cd backend
  npm start
  # or: npm run dev
  ```
- **Frontend:**
  ```sh
  cd frontend
  npm start
  ```
- Visit [http://localhost:3000](http://localhost:3000)

## Features & Usage Guide
- **Kanban Board:** Drag-and-drop tasks between columns (To Do, In Progress, Done). Each task card can be moved by dragging, and columns update in real time for all users.
- **Card Flip UI:** Click the flip button on a task card to view more details, including comments, attachments, and metadata. The card flips with a smooth animation.
- **Comments & Attachments:** Add, view, and remove comments and file attachments for each task. All changes are instantly reflected for all collaborators.
- **Smart Assign:** Assigns a task to the most available user based on their current active workload, helping balance tasks across the team.
- **Conflict Handling:** If two users edit the same task at the same time, a conflict modal appears, allowing you to review and resolve differences before saving.
- **Activity Log:** See the last 40 actions (comments, status changes, attachments, assignments, etc.) with timestamps and user info, so you always know what's happening.
- **Analytics Dashboard:** Visualize task status, priority, user workload, overdue tasks, and average completion times with interactive charts and graphs.
- **Public Board:** Share a read-only board link for public viewing, making it easy to keep stakeholders informed without requiring them to log in.
- **Mobile Responsive:** Fully optimized for all devices. On mobile, columns are stacked vertically for easy scrolling and interaction.
- **Dark Mode:** Toggle for accessible, modern UI. All features and charts are styled for both light and dark themes.

## Smart Assign Logic
When a user clicks "Smart Assign" on a task, the backend:
1. Counts the number of active (To Do + In Progress) tasks for each user.
2. Assigns the task to the user with the fewest active tasks.
3. If multiple users are tied, picks one at random.
4. Updates the task and notifies all clients in real time.

This ensures fair distribution of work and helps prevent overload for any single team member.

## Conflict Handling Logic
- When two users try to update the same task at the same time, the backend detects a version conflict using a version or timestamp check.
- The frontend displays a conflict modal showing both the user's changes and the latest version from the server.
- The user can choose which version to keep or manually merge changes before saving.
- This prevents accidental overwrites and ensures data integrity in collaborative environments.

## Deployment
- **Backend:** Deploy to [Render](https://render.com/) or similar. Set environment variables in the Render dashboard.
- **Frontend:** Deploy to [Vercel](https://vercel.com/) or [Netlify](https://netlify.com/). Set `REACT_APP_API` to your backend URL.

## Live Demo & Video
- **Live App:** [https://webalar-mauve.vercel.app](https://webalar-mauve.vercel.app)
  - Explore the full Kanban experience, including real-time collaboration, analytics, and public board sharing. No login required for public boards.
- **Demo Video:** [YouTube Demo](https://youtu.be/your-demo-video)
  - Watch a walkthrough of all major features, including Smart Assign, conflict resolution, analytics, and mobile usage.

---

For any issues or contributions, please open an issue or pull request on GitHub.
