const express = require("express");
const router = express.Router();
const {
  getTasks,
  createTask,
  deleteTask,
} = require("../controllers/taskController");
const { protect } = require("../middleware/authMiddleware");
const Task = require("../models/Task");
const User = require("../models/User");
const { logAction } = require("../utils/logger");
const { io } = require("../socket");

// Get all tasks
router.get("/", protect, getTasks);

// Create a task
router.post("/", protect, createTask);

// Version-aware update task
router.put("/:id", protect, async (req, res) => {
  try {
    const existing = await Task.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: "Task not found" });
    }

    if (req.body.version !== existing.version) {
      return res.status(409).json({
        message: "Conflict detected",
        serverVersion: existing,
        clientVersion: req.body,
      });
    }

    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        version: existing.version + 1,
      },
      { new: true }
    );

    io.emit("task_changed");
    logAction(req.user._id, `updated task: ${updated.title}`);
    res.json(updated);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Update failed" });
  }
});

// Delete a task
router.delete("/:id", protect, deleteTask);

// Smart assign task (inline logic)
router.post("/:id/smart-assign", protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    const users = await User.find();
    const activeCounts = await Promise.all(
      users.map(async (user) => {
        const count = await Task.countDocuments({
          assignedTo: user._id,
          status: { $ne: "Done" },
        });
        return { user, count };
      })
    );

    const leastBusy = activeCounts.sort((a, b) => a.count - b.count)[0].user;

    task.assignedTo = leastBusy._id;
    task.version += 1;
    await task.save();

    io.emit("task_changed");
    logAction(req.user._id, `smart-assigned task '${task.title}' to ${leastBusy.name}`);
    res.json(task);
  } catch (err) {
    console.error("Smart assign failed", err);
    res.status(500).json({ error: "Smart assign failed" });
  }
});

module.exports = router;
