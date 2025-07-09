const express = require("express");
const router = express.Router();
const {
  getTasks,
  createTask,
  deleteTask,
  updateTask,
  smartAssign,
  addComment,
  getComments,
  uploadAttachment,
  getAttachments,
  removeAttachment
} = require("../controllers/taskController");
const upload = require("../utils/upload");
const { protect } = require("../middleware/authMiddleware");
// Attachments endpoints
router.post('/:id/attachments', protect, upload.single('file'), uploadAttachment);
router.get('/:id/attachments', protect, getAttachments);
router.delete('/:id/attachments/:attachmentId', protect, removeAttachment);

// Comments endpoints
router.post('/:id/comments', protect, addComment);
router.get('/:id/comments', protect, getComments);
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

    // Log the update action for all changes, with user-friendly labels
    const userId = req.user?._id || (req.user && req.user.id);
    const username = req.user?.username || req.user?.name || "User";
    let actions = [];
    // Priority mapping
    const priorityMap = { 0: "low", 1: "medium", 2: "high", "0": "low", "1": "medium", "2": "high" };
    if (updateFields.status && updateFields.status !== existing.status) {
      actions.push(`${username} moved '${updated.title || existing.title}' from ${existing.status} to ${updateFields.status}.`);
    }
    if (updateFields.assignedTo && String(updateFields.assignedTo) !== String(existing.assignedTo)) {
      // Try to get user name
      let assignedUser = null;
      try {
        const userDoc = await require("../models/user").findById(updateFields.assignedTo);
        assignedUser = userDoc?.username || userDoc?.email;
      } catch {}
      if (assignedUser) {
        actions.push(`${username} assigned '${updated.title || existing.title}' to ${assignedUser}.`);
      } else {
        actions.push(`${username} changed assignee for '${updated.title || existing.title}'.`);
      }
    }
    if (updateFields.title && updateFields.title !== existing.title) {
      actions.push(`${username} changed title from '${existing.title}' to '${updateFields.title}'.`);
    }
    if (updateFields.description && updateFields.description !== existing.description) {
      actions.push(`${username} changed description for '${updated.title || existing.title}'.`);
    }
    if (updateFields.priority !== undefined && updateFields.priority !== existing.priority) {
      const oldPriority = priorityMap[existing.priority] || existing.priority;
      const newPriority = priorityMap[updateFields.priority] || updateFields.priority;
      actions.push(`${username} changed priority from '${oldPriority}' to '${newPriority}' on '${updated.title || existing.title}'.`);
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

    // Log the smart assign action
    await require("../models/Log").create({
      user: req.user._id,
      action: `${req.user.username || "User"} used Smart Assign and '${task.title}' was assigned to ${leastBusy.username || leastBusy.email}.`,
      taskId: task._id,
    });
    try {
      getIO().emit("log_updated");
      getIO().emit("task_changed");
    } catch (e) {
      console.error("Socket.io not initialized when emitting events:", e.message);
    }
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
