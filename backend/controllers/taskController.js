const Task = require("../models/Task");
const Log = require("../models/Log");
const User = require("../models/user");
const { getIO } = require("../socket");
const smartAssign = require("../utils/smartAssign");

exports.getTasks = async (req, res) => {
  const tasks = await Task.find()
    .populate("assignedTo", "_id username email")
    .populate("createdBy", "_id username email");
  res.json(tasks);
};

exports.createTask = async (req, res) => {
  try {
    const { title, description, priority, assignedTo, status } = req.body;

    const exists = await Task.findOne({ title });
    if (["Todo", "In Progress", "Done"].includes(title) || exists) {
      return res.status(400).json({ message: "Invalid or duplicate title" });
    }

    const task = await Task.create({
      title,
      description,
      priority,
      assignedTo,
      status,
      createdBy: req.user._id,
    });
    await Log.create({
      user: req.user._id,
      action: `Created '${task.title}'`,
      taskId: task._id
    });
    getIO().emit("log_updated");

    // getIO().emit("taskCreated", task);
    getIO().emit("task_changed");
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const oldTask = await Task.findById(req.params.id)
      .populate("assignedTo", "_id username")
      .populate("createdBy", "_id username");
    if (!oldTask) return res.status(404).json({ message: "Task not found" });

    const updatedFields = req.body;
    const task = await Task.findByIdAndUpdate(req.params.id, updatedFields, { new: true })
      .populate("assignedTo", "_id username")
      .populate("createdBy", "_id username");

    // Log field-level changes with improved messages
    const logsToCreate = [];
    const username = req.user.username || (req.user && req.user.name) || "User";
    const taskTitle = task.title;
    // Priority mapping
    const priorityMap = { 0: "low", 1: "medium", 2: "high", "0": "low", "1": "medium", "2": "high" };

    if (updatedFields.status && updatedFields.status !== oldTask.status) {
      // Detect drag-and-drop via a custom flag (frontend should send { dragAndDrop: true })
      if (updatedFields.dragAndDrop) {
        logsToCreate.push({
          user: req.user._id,
          action: `${username} dragged and dropped '${taskTitle}' from ${oldTask.status} to ${updatedFields.status}.`,
          taskId: task._id,
        });
      } else {
        logsToCreate.push({
          user: req.user._id,
          action: `${username} moved '${taskTitle}' from ${oldTask.status} to ${updatedFields.status}.`,
          taskId: task._id,
        });
      }
    }
    if (
      (updatedFields.assignedTo && String(updatedFields.assignedTo) !== String(oldTask.assignedTo?._id || oldTask.assignedTo)) ||
      (updatedFields.assignedTo === null && oldTask.assignedTo)
    ) {
      let oldUser = oldTask.assignedTo?.username || "Unassigned";
      let newUser = "Unassigned";
      if (updatedFields.assignedTo) {
        const newUserObj = await User.findById(updatedFields.assignedTo);
        if (newUserObj) newUser = newUserObj.username;
      }
      logsToCreate.push({
        user: req.user._id,
        action: `${username} changed assignee for '${taskTitle}' from '${oldUser}' to '${newUser}'.`,
        taskId: task._id,
      });
    }
    if (updatedFields.title && updatedFields.title !== oldTask.title) {
      logsToCreate.push({
        user: req.user._id,
        action: `${username} changed title from '${oldTask.title}' to '${updatedFields.title}'.`,
        taskId: task._id,
      });
    }
    if (updatedFields.description && updatedFields.description !== oldTask.description) {
      logsToCreate.push({
        user: req.user._id,
        action: `${username} changed description for '${taskTitle}'.`,
        taskId: task._id,
      });
    }
    if (updatedFields.priority !== undefined && updatedFields.priority !== oldTask.priority) {
      const oldPriority = priorityMap[oldTask.priority] || oldTask.priority;
      const newPriority = priorityMap[updatedFields.priority] || updatedFields.priority;
      logsToCreate.push({
        user: req.user._id,
        action: `${username} changed priority from '${oldPriority}' to '${newPriority}' on '${taskTitle}'.`,
        taskId: task._id,
      });
    }
    if (logsToCreate.length > 0) {
      await Log.insertMany(logsToCreate);
      getIO().emit("log_updated");
    }

    console.log("[SOCKET] Emitting task_changed after updateTask");
    getIO().emit("task_changed");
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    await Log.create({
      user: req.user._id,
      action: `Deleted '${task.title}'`,
      taskId: task._id
    });
    getIO().emit("log_updated");

    // Emit the same event as updates so frontend always listens for one event
    getIO().emit("task_changed");
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
    )
      .populate("assignedTo", "_id username email")
      .populate("createdBy", "_id username email");

    await Log.create({
      user: req.user._id,
      action: `${req.user.username || "User"} used Smart Assign and '${task.title}' was assigned to ${user.username}.`,
      taskId: task._id,
    });
    getIO().emit("log_updated");

    getIO().emit("task_changed");
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
