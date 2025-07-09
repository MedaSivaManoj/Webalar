import React, { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";


const TaskModal = ({ isOpen, onClose, onSave, task, allTasks = [] }) => {
  const { user } = useContext(AuthContext);
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [priority, setPriority] = useState(task?.priority || "Low");
  const [dueDate, setDueDate] = useState(task?.dueDate ? new Date(task.dueDate).toISOString().slice(0,16) : "");
  const [assignedTo, setAssignedTo] = useState(task?.assignedTo || "");
  const [status, setStatus] = useState(task?.status || "Todo");
  const [users, setUsers] = useState([]);
  const intervalRef = useRef();
  const [error, setError] = useState("");

  useEffect(() => {
    setTitle(task?.title || "");
    setDescription(task?.description || "");
    setPriority(task?.priority || "Low");
    setAssignedTo(task?.assignedTo || "");
    setStatus(task?.status || "Todo");
    setError("");
    setDueDate(task?.dueDate ? new Date(task.dueDate).toISOString().slice(0,16) : "");
  }, [task]);

  // Fetch users for assignment dropdown, and poll every 3 seconds while modal is open
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Use user.token from context if available
        const token = user?.token || (localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).token : null);
        if (!token) return setUsers([]);
        const res = await axios.get(`${process.env.REACT_APP_API}/api/tasks/users/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Defensive: ensure users is always an array of objects with _id, username, email
        if (Array.isArray(res.data) && res.data.length && typeof res.data[0] === 'object') {
          setUsers(res.data);
        } else {
          setUsers([]);
        }
      } catch (err) {
        setUsers([]);
      }
    };
    if (isOpen) {
      fetchUsers();
      intervalRef.current = setInterval(fetchUsers, 3000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isOpen]);

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
    const taskData = {
      title,
      description,
      priority: priorityMap[priority] ?? 0,
      assignedTo: assignedTo || null,
      status,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
    };
    
    // Only spread task data if we're editing an existing task
    if (task) {
      taskData.version = task.version;
    }
    
    onSave(taskData);
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
        <div style={{ marginBottom: 8 }}>
          <label style={{ fontWeight: "bold" }}>Title</label>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              borderRadius: 8,
              border: "1px solid #90caf9",
              background: "#f8fbff",
              marginBottom: 0,
              width: "100%",
            }}
          />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label style={{ fontWeight: "bold" }}>Description</label>
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              borderRadius: 8,
              border: "1px solid #90caf9",
              background: "#f8fbff",
              marginBottom: 0,
              width: "100%",
            }}
          />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label style={{ fontWeight: "bold" }}>Assigned To</label>
          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            style={{
              borderRadius: 8,
              border: "1px solid #90caf9",
              background: "#f8fbff",
              marginBottom: 0,
              width: "100%",
            }}
          >
            <option value="">Assign to...</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.username} ({u.email})
              </option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: 8 }}>
          <label style={{ fontWeight: "bold" }}>Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            style={{
              borderRadius: 8,
              border: "1px solid #90caf9",
              background: "#f8fbff",
              marginBottom: 0,
              width: "100%",
            }}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
        <div style={{ marginBottom: 8 }}>
          <label style={{ fontWeight: "bold" }}>Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{
              borderRadius: 8,
              border: "1px solid #90caf9",
              background: "#f8fbff",
              marginBottom: 0,
              width: "100%",
            }}
          >
            <option value="Todo">Todo</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>
        <div style={{ marginBottom: 8 }}>
          <label style={{ fontWeight: "bold" }}>Due Date</label>
          <input
            type="datetime-local"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            style={{
              borderRadius: 8,
              border: "1px solid #90caf9",
              background: "#f8fbff",
              marginBottom: 0,
              width: "100%",
            }}
          />
        </div>
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

