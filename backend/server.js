const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const logRoutes = require("./routes/logRoutes");
const boardRoutes = require("./routes/boardRoutes"); // Import board routes
const { setupSocket } = require("./socket");

dotenv.config();

const app = express();
const server = http.createServer(app);
setupSocket(server);

const allowedOrigins = [
  'http://localhost:3000',
  'https://your-netlify-app-name.netlify.app' // Add your Netlify URL here
];

app.use(cors({ 
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true 
}));
app.use(express.json());
app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/board", boardRoutes); // Use board routes

// MongoDB connection and server start
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
    server.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));
