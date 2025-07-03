const Task = require("../models/Task");
const Log = require("../models/Log");
const User = require("../models/user");
const { getIO } = require("../socket");
const smartAssign = require("../utils/smartAssign");

exports.getTasks = async (req, res) => {
  const tasks = await Task.find().populate("assignedTo", "username");
  res.json(tasks);
};

exports.createTask = async (req, res) => {
  try {
    const { title, description, priority } = req.body;

    const exists = await Task.findOne({ title });
    if (["Todo", "In Progress", "Done"].includes(title) || exists) {
      return res.status(400).json({ message: "Invalid or duplicate title" });
    }

    const task = await Task.create({ title, description, priority });
    await Log.create({ user: req.user._id, action: "Created task", taskId: task._id });

    // getIO().emit("taskCreated", task);
    getIO().emit("task_updated");
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await Log.create({ user: req.user._id, action: "Updated task", taskId: task._id });

    getIO().emit("taskUpdated", task);
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    await Log.create({ user: req.user._id, action: "Deleted task", taskId: task._id });

    getIO().emit("taskDeleted", task._id);
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.smartAssign = async (req, res) => {
  try {
    const user = await smartAssign();
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { assignedTo: user._id },
      { new: true }
    );

    await Log.create({
      user: req.user._id,
      action: `Smart-assigned to ${user.username}`,
      taskId: task._id,
    });

    getIO().emit("taskUpdated", task);
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
