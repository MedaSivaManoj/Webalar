import React, { useState } from "react";
import TaskComments from "./TaskComments";
import TaskAttachments from "./TaskAttachments";
import axios from "axios";

const TaskCard = ({ task, socket, user, onEdit }) => {
  const [flipped, setFlipped] = useState(false);

  const handleDragStart = (e) => {
    e.dataTransfer.setData("taskId", task._id);
  };

  const handleSmartAssign = async (e) => {
    e.stopPropagation();
    try {
      await axios.post(
        `${process.env.REACT_APP_API}/api/tasks/${task._id}/smart-assign`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
    } catch (err) {
      console.error("Smart assign failed", err);
      alert("Smart assign failed. Please check the console.");
    }
  };

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = (e) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(`${process.env.REACT_APP_API}/api/tasks/${task._id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setShowDeleteDialog(false);
    } catch (err) {
      alert("Failed to delete task. Please try again or refresh the page.");
    }
    setDeleting(false);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(task);
  };

  const handleCardClick = (e) => {
    // Only flip if clicking the back header (for accessibility)
    if (flipped && e.target.closest('.task-card-back-header')) {
      e.stopPropagation();
      setFlipped(f => !f);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      // Only flip if focused on flip button (front) or flip header (back)
      if ((!flipped && e.target.closest('.flip-btn')) ||
          (flipped && e.target.closest('.task-card-back-header'))) {
        e.preventDefault();
        e.stopPropagation();
        setFlipped(f => !f);
      }
    }
  };

  const priorityLabel = ["Low", "Medium", "High"][task.priority] || "Low";
  const assignedName = task.assignedTo?.username || task.assignedTo?.email || "None";
  const createdByName = task.createdBy?.username || task.createdBy?.email || "Unknown";

  const cardStyles = `
    .task-card-container .task-actions {
      margin-top: 0.5rem;
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
    }
    .task-card-container .task-actions button {
      padding: 0.3rem 0.6rem;
      font-size: 0.8rem;
      border: none;
      background: #2196f3;
      color: white;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.2s;
    }
    .task-card-container .task-actions button:hover {
      background: #1976d2;
    }
    .task-card-container .task-actions button.danger {
      background: #e53935;
    }
    .task-card-container .task-actions button.danger:hover {
      background: #d32f2f;
    }
    .task-card-container .task-actions button.flip {
      background: #4caf50;
    }
    .task-card-container .task-actions button.flip:hover {
      background: #388e3c;
    }
    
    /* Fix back card overflow */
    .task-card-back {
      overflow: hidden;
      max-height: 220px;
      min-height: 220px;
      padding: 1rem;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
    }
    .task-card-back-content {
      flex: 1;
      overflow-y: auto;
      padding-right: 4px;
      min-height: 0;
    }
    .task-card-back-item {
      margin-bottom: 0.5rem;
      font-size: 0.85rem;
    }
    .task-card-back-header {
      text-align: center;
      margin-bottom: 0.75rem;
      font-size: 0.8rem;
      color: white;
      background: #2196f3;
      padding: 0.5rem;
      border-bottom: 1px solid rgba(0,0,0,0.1);
      flex-shrink: 0;
      cursor: pointer;
      border-radius: 4px;
      transition: background-color 0.2s;
    }
    .task-card-back-header:hover {
      background: #1976d2;
    }
    body.dark-mode .task-card-back-header {
      color: white;
      background: #2196f3;
      border-bottom-color: #37474f;
    }
    body.dark-mode .task-card-back-header:hover {
      background: #1976d2;
    }
    
    /* Front card flip footer */
    .task-card-front {
      display: flex;
      flex-direction: column;
      min-height: 220px;
    }
    .task-card-front-content {
      flex: 1;
      padding: 1rem;
    }
    /* Remove separate footer since flip is now in actions */
  `;

  return (
    <>
      <style>{cardStyles}</style>
      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.35)',
          zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 8,
            padding: 24,
            minWidth: 320,
            boxShadow: '0 2px 16px rgba(0,0,0,0.18)',
            textAlign: 'center',
            position: 'relative'
          }}>
            <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 12 }}>Delete Task</div>
            <div style={{ marginBottom: 18 }}>Are you sure you want to delete task:<br/><b>"{task.title}"</b>?</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
              <button onClick={() => setShowDeleteDialog(false)} style={{ padding: '6px 18px', borderRadius: 6, background: '#eee', color: '#333', border: 'none' }}>Cancel</button>
              <button onClick={confirmDelete} disabled={deleting} style={{ padding: '6px 18px', borderRadius: 6, background: '#e53935', color: '#fff', border: 'none' }}>{deleting ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}
      <div
        className={`task-card${flipped ? ' flipped' : ''}`}
        draggable
        onDragStart={handleDragStart}
        tabIndex={0}
        role="button"
        aria-pressed={flipped}
        aria-label={flipped ? "Show front of card" : "Show back of card"}
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
      >
        <div className="task-card-inner">
          {/* Front Side */}
          <div className="task-card-front">
            <div className="task-card-front-content">
              <h4>{task.title}</h4>
              <p>{task.description}</p>
              <div><strong>Assigned To:</strong> {assignedName}</div>
              <div><strong>Created By:</strong> {createdByName}</div>
              <div><strong>Priority:</strong> {priorityLabel}</div>
              <div><strong>Status:</strong> {task.status}</div>
              <div className="task-actions">
                <button onClick={handleSmartAssign}>Smart Assign</button>
                <button onClick={handleEdit}>Edit</button>
                <button onClick={handleDelete} className="danger">Delete</button>
                <button className="flip flip-btn" onClick={e => { e.stopPropagation(); setFlipped(f => !f); }}>Flip</button>
              </div>
            </div>
          </div>

          {/* Back Side */}
          <div className="task-card-back">
            <div className="task-card-back-header">
              Click Here to flip back
            </div>
            <div className="task-card-back-content">
              <div className="task-card-back-item"><strong>Created:</strong> {new Date(task.createdAt).toLocaleString()}</div>
              <div className="task-card-back-item"><strong>Updated:</strong> {new Date(task.updatedAt).toLocaleString()}</div>
              <div className="task-card-back-item">
                <strong>Due:</strong>{' '}
                <span style={{ color: task.dueDate && new Date(task.dueDate) < new Date() ? 'red' : 'inherit' }}>
                  {task.dueDate ? new Date(task.dueDate).toLocaleString() : "-"}
                </span>
              </div>
              <div className="task-card-back-item">
                <TaskComments taskId={task._id} user={user} socket={socket} />
              </div>
              <div className="task-card-back-item">
                <TaskAttachments taskId={task._id} user={user} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TaskCard;
