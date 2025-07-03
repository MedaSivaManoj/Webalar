import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Column from "./Column";
import LogPanel from "../LogPanel";
import TaskModal from "./TaskModal";
import ConflictModal from "./ConflictModal";
import io from "socket.io-client";

const Board = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [conflict, setConflict] = useState(null);

  const socket = io(process.env.REACT_APP_API);

  const fetchTasks = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API}/api/tasks`, {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    setTasks(res.data);
  };

  const fetchLogs = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API}/api/logs`, {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    setLogs(res.data);
  };

  useEffect(() => {
    if (!user) return navigate("/login");

    fetchTasks();
    fetchLogs();

    socket.emit("join", user._id);

    socket.on("task_updated", () => fetchTasks());
    socket.on("log_updated", () => fetchLogs());

    return () => socket.disconnect();
  }, []);

  const onDragEnd = async (e, newStatus) => {
    const taskId = e.dataTransfer.getData("taskId");
    const task = tasks.find((t) => t._id === taskId);
    if (!task || task.status === newStatus) return;

    await axios.put(
      `${process.env.REACT_APP_API}/api/tasks/${taskId}`,
      { status: newStatus, version: task.version },
      { headers: { Authorization: `Bearer ${user.token}` } }
    );
    socket.emit("task_changed");
  };

  return (
    <div className="board-container">
      <div className="columns">
        {["Todo", "In Progress", "Done"].map((status) => (
          <Column
            key={status}
            status={status}
            tasks={tasks.filter((t) => t.status === status)}
            onDrop={onDragEnd}
            socket={socket}
            user={user}
            setEditTask={setEditTask}
            setShowModal={setShowModal}
          />
        ))}
      </div>

      <LogPanel logs={logs} />

      <button className="add-task-btn" onClick={() => setShowModal(true)}>
        + New Task
      </button>

      <button
        className="logout-btn"
        onClick={() => {
          localStorage.removeItem("user");
          window.location.href = "/login";
        }}
      >
        Logout
      </button>

      <TaskModal
        isOpen={showModal}
        onClose={() => {
          setEditTask(null);
          setShowModal(false);
        }}
        onSave={async (taskData) => {
          try {
            const endpoint = editTask
              ? `/api/tasks/${editTask._id}`
              : "/api/tasks";
            const method = editTask ? "put" : "post";

            const res = await axios[method](
              `${process.env.REACT_APP_API}${endpoint}`,
              { ...taskData, version: editTask?.version },
              { headers: { Authorization: `Bearer ${user.token}` } }
            );

            socket.emit("task_changed");
            setEditTask(null);
            setShowModal(false);
          } catch (err) {
            if (err.response?.status === 409) {
              setConflict({
                server: err.response.data.serverVersion,
                client: err.response.data.clientVersion,
              });
            }
          }
        }}
        task={editTask}
        allTasks={tasks}
      />

      {conflict && (
        <ConflictModal
          serverTask={conflict.server}
          clientTask={conflict.client}
          onMerge={async () => {
            const merged = {
              ...conflict.server,
              ...conflict.client,
              version: conflict.server.version,
            };
            await axios.put(
              `${process.env.REACT_APP_API}/api/tasks/${merged._id}`,
              merged,
              { headers: { Authorization: `Bearer ${user.token}` } }
            );
            socket.emit("task_changed");
            setConflict(null);
            setEditTask(null);
            setShowModal(false);
          }}
          onOverwrite={async () => {
            const overwrite = {
              ...conflict.client,
              version: conflict.server.version,
            };
            await axios.put(
              `${process.env.REACT_APP_API}/api/tasks/${overwrite._id}`,
              overwrite,
              { headers: { Authorization: `Bearer ${user.token}` } }
            );
            socket.emit("task_changed");
            setConflict(null);
            setEditTask(null);
            setShowModal(false);
          }}
          onCancel={() => setConflict(null)}
        />
      )}
    </div>
  );
};

export default Board;
