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
    try {
      await axios.delete(`${process.env.REACT_APP_API}/api/tasks/${task._id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      // Do NOT emit or fetch here; let the socket event handle it
    } catch (err) {
      alert("Failed to delete task. Please try again or refresh the page.");
    }
  };

  // Priority label mapping
  const priorityLabel = typeof task.priority === "number"
    ? ["Low", "Medium", "High"][task.priority] || "Low"
    : (task.priority || "Low");


  // Assigned user name
  const assignedName = task.assignedTo?.username || task.assignedTo?.email || task.assignedTo || "None";

  // Created by user name
  const createdByName = task.createdBy?.username || task.createdBy?.email || task.createdBy || "Unknown";

  return (
    <div className="task-card" draggable onDragStart={handleDragStart}>
      <div style={{ marginBottom: 4 }}>
        <span style={{ fontWeight: "bold" }}>Title: </span>{task.title}
      </div>
      <div style={{ marginBottom: 4 }}>
        <span style={{ fontWeight: "bold" }}>Description: </span>{task.description}
      </div>
      <div style={{ marginBottom: 4 }}>
        <span style={{ fontWeight: "bold" }}>Assignee: </span>{assignedName}
      </div>
      <div style={{ marginBottom: 4 }}>
        <span style={{ fontWeight: "bold" }}>Created By: </span>{createdByName}
      </div>
      <div style={{ marginBottom: 4 }}>
        <span style={{ fontWeight: "bold" }}>Priority: </span>{priorityLabel}
      </div>
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontWeight: "bold" }}>Status: </span>{task.status}
      </div>
      <div className="task-actions">
        <button onClick={handleSmartAssign}>Smart Assign</button>
        <button onClick={() => onEdit(task)}>Edit</button>
        <button onClick={handleDelete} className="danger">Delete</button>
      </div>
    </div>
  );
};

export default TaskCard;
