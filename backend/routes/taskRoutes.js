
const express = require("express");
const router = express.Router();
const {
  getTasks,
  createTask,
  deleteTask,
} = require("../controllers/taskController");
const { protect } = require("../middleware/authMiddleware");
const Task = require("../models/Task");
const User = require("../models/user");
// const { logAction } = require("../utils/logger");
const { getIO } = require("../socket");

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

    // Remove immutable fields from update object
    const { _id, createdAt, updatedAt, ...updateFields } = req.body;
    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      {
        ...updateFields,
        version: existing.version + 1,
      },
      { new: true }
    );

    // Log the update action for all changes
    const userId = req.user?._id || (req.user && req.user.id);
    let actions = [];
    if (updateFields.status && updateFields.status !== existing.status) {
      actions.push(`Changed status from ${existing.status} to ${updateFields.status}`);
    }
    if (updateFields.assignedTo && String(updateFields.assignedTo) !== String(existing.assignedTo)) {
      actions.push(`Assigned to user ${updateFields.assignedTo}`);
    }
    if (updateFields.title && updateFields.title !== existing.title) {
      actions.push(`Changed title from '${existing.title}' to '${updateFields.title}'`);
    }
    if (updateFields.description && updateFields.description !== existing.description) {
      actions.push(`Changed description`);
    }
    if (updateFields.priority !== undefined && updateFields.priority !== existing.priority) {
      actions.push(`Changed priority from ${existing.priority} to ${updateFields.priority}`);
    }
    if (actions.length === 0) {
      actions.push("Updated task");
    }
    for (const action of actions) {
      await require("../models/Log").create({
        user: userId,
        action,
        taskId: req.params.id,
      });
    }

    try {
      getIO().emit("log_updated");
      getIO().emit("task_changed");
    } catch (e) {
      console.error("Socket.io not initialized when emitting events:", e.message);
    }
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

    try {
      getIO().emit("task_changed");
    } catch (e) {
      console.error("Socket.io not initialized when emitting events:", e.message);
    }
    // logAction(req.user._id, `smart-assigned task '${task.title}' to ${leastBusy.name}`);
    res.json(task);
  } catch (err) {
    console.error("Smart assign failed", err);
    res.status(500).json({ error: "Smart assign failed" });
  }
});


// Get all users (for assignment dropdown)
router.get("/users/all", protect, async (req, res) => {
  try {
    const users = await User.find({}, "_id username email");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

module.exports = router;
