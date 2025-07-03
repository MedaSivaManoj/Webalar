import React from "react";
import axios from "axios";

const TaskCard = ({ task, socket, user, onEdit }) => {
  const handleDragStart = (e) => {
    e.dataTransfer.setData("taskId", task._id);
  };

  const handleSmartAssign = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API}/api/tasks/${task._id}/smart-assign`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      socket.emit("task_changed");
    } catch (err) {
      console.error("Smart assign failed", err);
    }
  };

  const handleDelete = async () => {
    await axios.delete(`${process.env.REACT_APP_API}/api/tasks/${task._id}`, {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    socket.emit("task_changed");
  };

  return (
    <div className="task-card" draggable onDragStart={handleDragStart}>
      <h4>{task.title}</h4>
      <p>{task.description}</p>
      <p className="assigned">Assigned: {task.assigned_user?.username || "None"}</p>
      <p className="priority">Priority: {task.priority}</p>
      <div className="task-actions">
        <button onClick={handleSmartAssign}>Smart Assign</button>
        <button onClick={() => onEdit(task)}>Edit</button>
        <button onClick={handleDelete} className="danger">Delete</button>
      </div>
    </div>
  );
};

export default TaskCard;
