# Real-Time Collaborative Kanban Board

## 🚀 Project Overview

This is a full-stack, real-time, collaborative Kanban board application designed to streamline task management and team workflow. It provides an intuitive and interactive interface where users can create, assign, and track tasks seamlessly. The application is built with a modern tech stack, focusing on performance, real-time capabilities, and a user-friendly experience. It features advanced functionalities like smart task assignment and optimistic UI updates with conflict resolution, making it a powerful tool for team productivity.

The frontend is deployed on **Vercel** and the backend on **Render**.

## 🛠️ Tech Stack

### Frontend
*   **React.js**: A JavaScript library for building user interfaces.
*   **Socket.IO Client**: Enables real-time, bidirectional event-based communication.
*   **React Router**: For declarative routing in the React application.
*   **Axios**: A promise-based HTTP client for making requests to the backend.
*   **CSS3**: For styling and creating a modern, responsive design.

### Backend
*   **Node.js**: A JavaScript runtime built on Chrome's V8 JavaScript engine.
*   **Express.js**: A minimal and flexible Node.js web application framework.
*   **MongoDB**: A NoSQL database for storing application data.
*   **Mongoose**: An ODM (Object Data Modeling) library for MongoDB and Node.js.
*   **Socket.IO**: For enabling real-time collaboration features.
*   **JSON Web Tokens (JWT)**: For secure user authentication and authorization.
*   **CORS**: To enable cross-origin resource sharing between the frontend and backend.

## ⚙️ Setup and Installation

To get the project running locally, follow these steps:

### Prerequisites
*   Node.js and npm (or yarn) installed.
*   A running MongoDB instance (either locally or on a cloud service like MongoDB Atlas).

### Backend Setup
1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Create a `.env` file** in the `backend` directory and add the following environment variables:
    ```env
    MONGO_URI=<your_mongodb_connection_string>
    JWT_SECRET=<a_strong_secret_key_for_jwt>
    PORT=5000
    ```
4.  **Start the backend server:**
    ```bash
    npm start
    ```
    The server will be running on `http://localhost:5000`.

### Frontend Setup
1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Create a `.env` file** in the `frontend` directory and add the following environment variable to connect to your local backend:
    ```env
    REACT_APP_API=http://localhost:5000
    ```
4.  **Start the frontend application:**
    ```bash
    npm start
    ```
    The application will open in your browser at `http://localhost:3000`.

## ✨ Features and Usage

*   **User Authentication**: Secure sign-up and login system. Only authenticated users can access the board.
*   **Real-time Collaboration**: Any changes to tasks (creation, updates, deletion, moving columns) are instantly broadcast to all connected users.
*   **Task Management**:
    *   **Create Tasks**: Click the "New Task" button to open a modal and add a new task with a title, description, priority, and due date.
    *   **Update Tasks**: Click on a task to edit its details.
    *   **Delete Tasks**: Remove tasks that are no longer needed.
*   **Drag & Drop**: Intuitively move tasks between the "Todo", "In Progress", and "Done" columns.
*   **Activity Log**: A real-time log panel shows a history of all actions performed on the board, such as task creation, assignment changes, and status updates.
*   **Filtering and Searching**: Easily find tasks by searching for titles or filtering by assignee, status, priority, or overdue status.
*   **Responsive Design**: The application is fully responsive and works well on both desktop and mobile devices.
*   **Dark Mode & Theming**: Switch between light and dark themes and choose an accent color to personalize your experience.

---

## 🧠 Advanced Logic Explained

### Smart Assign

The **Smart Assign** feature is designed to improve team efficiency by automatically assigning new or unassigned tasks to the team member who currently has the lightest workload.

**How it works:**
1.  When a user clicks the "Smart Assign" button on a task, a request is sent to the backend.
2.  The `smartAssign` utility function queries the database to find all registered users.
3.  For each user, it calculates the number of tasks currently assigned to them that are **not** in the "Done" status.
4.  It then identifies the user with the minimum number of active tasks.
5.  This "least busy" user is then assigned to the task, and the change is broadcast in real-time to all users.

This logic ensures a more balanced distribution of work across the team, preventing bottlenecks and helping to maintain a steady workflow.

### Optimistic UI & Conflict Handling

To provide a fast and seamless user experience, the application uses an **optimistic UI** approach. When a user makes a change (e.g., moving a task), the UI updates instantly without waiting for the server's confirmation. This makes the app feel incredibly responsive.

However, this can lead to conflicts if two users modify the same task at the same time. The application has a robust system to handle this:

**How it works:**
1.  **Versioning**: Each task in the database has a `version` number.
2.  **Client-side Update**: When a user updates a task, the frontend sends the task's current `version` number along with the update request to the backend.
3.  **Server-side Validation**:
    *   The backend retrieves the task from the database and compares its `version` number with the one sent by the client.
    *   If the versions match, the update is safe. The backend applies the change and increments the task's `version` number in the database.
    *   If the versions **do not match**, it means another user has updated the task in the meantime. The backend rejects the update and sends a `409 Conflict` error back to the client, along with the latest version of the task from the database.
4.  **Conflict Resolution**:
    *   When the frontend receives a `409 Conflict` error, it displays a **Conflict Modal**.
    *   This modal shows the user the difference between their version and the server's version of the task.
    *   The user is given the choice to either **overwrite** the server's version with their changes or **cancel** their action and accept the server's version.

This versioning and conflict resolution mechanism ensures data integrity and prevents users from accidentally overwriting each other's work, which is crucial in a collaborative environment.
