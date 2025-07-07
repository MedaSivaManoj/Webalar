import React, { useState } from "react";
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

  // Card flip state
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className={`task-card${flipped ? " flipped" : ""}`}
      draggable
      onDragStart={handleDragStart}
      tabIndex={0}
      style={{ perspective: 1000, minHeight: 220, outline: 'none', background: 'transparent', border: 'none', boxShadow: 'none', display: 'flex', alignItems: 'stretch', justifyContent: 'center' }}
      onClick={() => setFlipped(f => !f)}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setFlipped(f => !f); }}
      aria-label={flipped ? "Show front of card" : "Show back of card"}
    >
      <div className="task-card-inner" style={{
        position: 'relative',
        width: 320,
        minHeight: 220,
        height: '100%',
        transition: 'transform 0.6s',
        transformStyle: 'preserve-3d',
        transform: flipped ? 'rotateY(180deg)' : 'none',
        borderRadius: 12,
        boxSizing: 'border-box',
        boxShadow: '0 2px 12px 0 rgba(0,0,0,0.10)',
        background: 'var(--card-bg, #fff)',
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Front Side */}
        <div className="task-card-front" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backfaceVisibility: 'hidden',
          borderRadius: 12,
          background: 'var(--card-bg, #fff)',
          color: 'var(--card-fg, #222)',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
        }}>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ marginBottom: 4 }}>
              <span style={{ fontWeight: "bold" }}>Title: </span>{task.title}
            </div>
            <div style={{ marginBottom: 4 }}>
              <span style={{ fontWeight: "bold" }}>Description: </span>{task.description}
            </div>
            <div style={{ marginBottom: 4 }}>
              <span style={{ fontWeight: "bold" }}>Assigned To: </span>{assignedName}
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
          </div>
          <div className="task-actions" style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button onClick={e => { e.stopPropagation(); handleSmartAssign(); }}>Smart Assign</button>
            <button onClick={e => { e.stopPropagation(); onEdit(task); }}>Edit</button>
            <button onClick={e => { e.stopPropagation(); handleDelete(); }} className="danger">Delete</button>
          </div>
        </div>
        {/* Back Side */}
        <div className="task-card-back" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backfaceVisibility: 'hidden',
          borderRadius: 12,
          background: 'var(--card-bg, #fff)',
          color: 'var(--card-fg, #222)',
          transform: 'rotateY(180deg)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
          boxSizing: 'border-box',
          boxShadow: 'none',
        }}>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Details</div>
          <div style={{ marginBottom: 10, fontWeight: 600, fontSize: 15 }}>
            Created: <span style={{ fontWeight: 400 }}>{task.createdAt ? new Date(task.createdAt).toLocaleString() : "-"}</span>
          </div>
          <div style={{ marginBottom: 10, fontWeight: 600, fontSize: 15 }}>
            Updated: <span style={{ fontWeight: 400 }}>{task.updatedAt ? new Date(task.updatedAt).toLocaleString() : "-"}</span>
          </div>
          <div style={{ marginTop: 12, fontSize: 13, color: '#888' }}>(Click or press Enter/Space to flip back)</div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
