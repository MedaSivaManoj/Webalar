import React, { useState, useEffect } from "react";

const TaskModal = ({ isOpen, onClose, onSave, task, allTasks }) => {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [priority, setPriority] = useState(task?.priority || "Low");
  const [assignedTo, setAssignedTo] = useState(task?.assignedTo || "");
  const [error, setError] = useState("");

  useEffect(() => {
    setTitle(task?.title || "");
    setDescription(task?.description || "");
    setPriority(task?.priority || "Low");
    setAssignedTo(task?.assignedTo || "");
    setError("");
  }, [task]);

  const handleSubmit = () => {
    const reserved = ["Todo", "In Progress", "Done"];
    const duplicate = allTasks.find(
      (t) => t.title === title && t._id !== task?._id
    );
    if (reserved.includes(title)) {
      setError("Task title cannot match column names.");
      return;
    }
    if (duplicate) {
      setError("Task title must be unique.");
      return;
    }
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    const priorityMap = { Low: 0, Medium: 1, High: 2 };
    onSave({
      ...task,
      title,
      description,
      priority: priorityMap[priority] ?? 0,
      assignedTo,
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      style={{
        background: "rgba(33, 150, 243, 0.10)",
        backdropFilter: "blur(2px)",
        zIndex: 1000,
      }}
    >
      <div
        className="modal modal-pop"
        style={{
          background:
            "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
          borderRadius: 16,
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
          border: "1px solid #e3f2fd",
          minWidth: 320,
          maxWidth: 420,
          position: "relative",
        }}
      >
        <h3
          style={{
            color: "#1976d2",
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          {task ? "Edit Task" : "New Task"}
        </h3>
        {error && <p className="error">{error}</p>}
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            borderRadius: 8,
            border: "1px solid #90caf9",
            background: "#f8fbff",
            marginBottom: 8,
          }}
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{
            borderRadius: 8,
            border: "1px solid #90caf9",
            background: "#f8fbff",
            marginBottom: 8,
          }}
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          style={{
            borderRadius: 8,
            border: "1px solid #90caf9",
            background: "#f8fbff",
            marginBottom: 8,
          }}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <input
          type="text"
          placeholder="Assign to (user id)"
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          style={{
            borderRadius: 8,
            border: "1px solid #90caf9",
            background: "#f8fbff",
            marginBottom: 8,
          }}
        />
        <div className="modal-actions">
          <button
            onClick={handleSubmit}
            style={{
              borderRadius: 8,
              background: "#1976d2",
              color: "white",
              fontWeight: 600,
              boxShadow: "0 2px 8px #90caf9",
            }}
          >
            {task ? "Save" : "Create"}
          </button>
          <button
            onClick={onClose}
            className="danger"
            style={{ borderRadius: 8 }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;

