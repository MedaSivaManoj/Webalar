import React, { useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TaskModal from "./TaskModal";
import ConflictModal from "./ConflictModal";
import io from "socket.io-client";
import ShareModal from "./ShareModal";
import TopBar from './TopBar';
import FilterBar from './FilterBar';
import BoardContent from './BoardContent';
import InfoPanels from './InfoPanels';

// Responsive styles for horizontal scroll on mobile
// You can move this to your CSS file if you prefer
function injectBoardResponsiveStyle() {
  if (typeof window !== 'undefined' && !document.getElementById('board-columns-responsive-style')) {
    const style = document.createElement('style');
    style.id = 'board-columns-responsive-style';
    style.innerHTML = `
      @media (max-width: 900px) {
        .board-columns-responsive {
          gap: 16px !important;
          padding: 0 6px !important;
          border-radius: 12px !important;
        }
        .board-columns-responsive > div {
          min-width: 260px !important;
          max-width: 320px !important;
          margin: 8px 0 !important;
        }
      }
      @media (max-width: 600px) {
        .board-columns-responsive {
          gap: 8px !important;
          padding: 0 2px !important;
          border-radius: 8px !important;
        }
        .board-columns-responsive > div {
          min-width: 200px !important;
          max-width: 260px !important;
          margin: 4px 0 !important;
        }
      }
      .board-columns-responsive::-webkit-scrollbar {
        height: 8px;
        background: #e3f2fd;
        border-radius: 8px;
      }
      .board-columns-responsive::-webkit-scrollbar-thumb {
        background: #90caf9;
        border-radius: 8px;
      }
    `;
    document.head.appendChild(style);
  }
}

const ACCENT_COLORS = ["#1976d2", "#388e3c", "#d32f2f", "#fbc02d", "#7b1fa2", "#00838f"];

const Board = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState({ text: '', assignee: '', status: '', priority: '', overdue: false });
  const [logs, setLogs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [conflict, setConflict] = useState(null);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('kanban-dark-mode');
    return stored === null ? false : stored === 'true';
  });
  const [accent, setAccent] = useState(() => {
    return localStorage.getItem('kanban-accent-color') || ACCENT_COLORS[0];
  });
  const [isShareModalOpen, setShareModalOpen] = useState(false);

  const socket = useRef();

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `kanban-tasks-${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const imported = JSON.parse(text);
      if (!Array.isArray(imported)) throw new Error("Invalid format");
      for (const t of imported) {
        if (!tasks.find(existing => existing.title === t.title)) {
          await axios.post(`${process.env.REACT_APP_API}/api/tasks`, {
            title: t.title,
            description: t.description,
            priority: t.priority,
            assignedTo: t.assignedTo?._id || t.assignedTo,
            status: t.status,
            dueDate: t.dueDate,
          }, { headers: { Authorization: `Bearer ${user.token}` } });
        }
      }
      fetchTasks();
      alert("Import complete!");
    } catch {
      alert("Import failed. Please check your file format.");
    }
  };

  const fetchTasks = async () => {
    setLoadingTasks(true);
    const res = await axios.get(`${process.env.REACT_APP_API}/api/tasks`, {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    setTasks(res.data);
    setLoadingTasks(false);
  };

  const fetchLogs = async () => {
    setLoadingLogs(true);
    const res = await axios.get(`${process.env.REACT_APP_API}/api/logs`, {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    setLogs(res.data);
    setLoadingLogs(false);
  };

  useEffect(() => {
    injectBoardResponsiveStyle();
    document.body.classList.toggle("dark-mode", darkMode);
    document.body.style.background = darkMode
      ? 'linear-gradient(120deg, #23272f 0%, #222b38 100%)'
      : 'linear-gradient(120deg, #e3f2fd 0%, #fff 100%)';
    document.body.style.transition = 'background 0.3s';
    document.documentElement.style.setProperty('--accent', accent);
  }, [darkMode, accent]);

  useEffect(() => {
    localStorage.setItem('kanban-dark-mode', darkMode);
  }, [darkMode]);
  useEffect(() => {
    localStorage.setItem('kanban-accent-color', accent);
  }, [accent]);

  useEffect(() => {
    if (!user) return navigate("/login");
    fetchTasks();
    fetchLogs();
    if (!socket.current) {
      socket.current = io(process.env.REACT_APP_API);
    }
    socket.current.emit("join", user._id);
    socket.current.on("task_changed", fetchTasks);
    socket.current.on("log_updated", fetchLogs);
    return () => {
      if (socket.current) {
        socket.current.off("task_changed", fetchTasks);
        socket.current.off("log_updated", fetchLogs);
        socket.current.disconnect();
        socket.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  const filteredTasks = tasks.filter(t => {
    const matchesText = filter.text === '' || t.title.toLowerCase().includes(filter.text.toLowerCase());
    const matchesAssignee = filter.assignee === '' || (t.assignedTo && (t.assignedTo.username === filter.assignee || t.assignedTo.email === filter.assignee));
    const matchesStatus = filter.status === '' || t.status === filter.status;
    const matchesPriority = filter.priority === '' || String(t.priority) === String(filter.priority);
    const matchesOverdue = !filter.overdue || (t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done');
    return matchesText && matchesAssignee && matchesStatus && matchesPriority && matchesOverdue;
  });

  const onDragEnd = async (e, newStatus) => {
    const taskId = e.dataTransfer.getData("taskId");
    const task = tasks.find((t) => t._id === taskId);
    if (!task || task.status === newStatus) return;

    const updatedTask = {
      title: task.title,
      description: task.description,
      assignedTo: task.assignedTo?._id || task.assignedTo || null,
      status: newStatus,
      priority: task.priority,
      version: task.version,
      dragAndDrop: true
    };

    try {
      await axios.put(
        `${process.env.REACT_APP_API}/api/tasks/${taskId}`,
        updatedTask,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
    } catch (err) {
      if (err.response?.status === 409) {
        setConflict({
          server: err.response.data.serverVersion,
          client: err.response.data.clientVersion,
        });
      } else {
        alert("Failed to move task. Please try again or refresh the page.");
      }
    }
  };

  const handleSaveTask = async (taskData) => {
    try {
      if (editTask) {
        // Update existing task
        await axios.put(
          `${process.env.REACT_APP_API}/api/tasks/${editTask._id}`,
          taskData,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
      } else {
        // Create new task
        await axios.post(
          `${process.env.REACT_APP_API}/api/tasks`,
          taskData,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
      }
      setShowModal(false);
      setEditTask(null);
      fetchTasks(); // Refresh the task list
    } catch (err) {
      if (err.response?.status === 409) {
        setConflict({
          server: err.response.data.serverVersion,
          client: err.response.data.clientVersion,
        });
      } else {
        alert("Failed to save task. Please try again.");
      }
    }
  };

  const boardBg = darkMode
    ? 'linear-gradient(120deg, #23272f 0%, #222b38 100%)'
    : 'linear-gradient(120deg, #e3f2fd 0%, #fff 100%)';
  const columnBg = darkMode
    ? `linear-gradient(135deg, #23272f 80%, ${accent}10 100%)`
    : 'linear-gradient(135deg, #fff 80%, #e3f2fd 100%)';
  const columnShadow = darkMode
    ? `0 4px 18px 0 ${accent}40, 0 1.5px 8px 0 #1118`
    : '0 4px 18px 0 rgba(33, 150, 243, 0.08)';
  const topBarBg = darkMode
    ? 'linear-gradient(90deg, #23272f 0%, #263043 100%)'
    : 'linear-gradient(90deg, #e3f2fd 0%, #fff 100%)';
  const topBarBorder = darkMode ? '1.5px solid #37474f' : '1.5px solid #bbdefb';

  return (
    <div className="board-container" style={{ position: 'relative', minHeight: '100vh', background: boardBg, transition: 'background 0.3s' }}>
      <TopBar
        setShowModal={setShowModal}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        accent={accent}
        setAccent={setAccent}
        topBarBg={topBarBg}
        topBarBorder={topBarBorder}
      />

      <FilterBar
        filter={filter}
        setFilter={setFilter}
        tasks={tasks}
        handleExport={handleExport}
        handleImport={handleImport}
        accent={accent}
        darkMode={darkMode}
      />

      <BoardContent
        loadingTasks={loadingTasks}
        darkMode={darkMode}
        filteredTasks={filteredTasks}
        onDragEnd={onDragEnd}
        socket={socket.current}
        user={user}
        setEditTask={setEditTask}
        setShowModal={setShowModal}
        columnBg={columnBg}
        columnShadow={columnShadow}
      />

      <InfoPanels
        loadingLogs={loadingLogs}
        logs={logs}
        tasks={tasks}
        columnBg={columnBg}
        columnShadow={columnShadow}
        darkMode={darkMode}
      />

      {showModal && (
        <TaskModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditTask(null);
          }}
          onSave={handleSaveTask}
          task={editTask}
          user={user}
          allTasks={tasks}
        />
      )}
      {conflict && (
        <ConflictModal
          conflict={conflict}
          onResolve={async (resolution) => {
            try {
              await axios.put(
                `${process.env.REACT_APP_API}/api/tasks/${resolution._id}`,
                { ...resolution, conflictResolution: true },
                { headers: { Authorization: `Bearer ${user.token}` } }
              );
            } catch (err) {
              alert("Failed to resolve conflict. Please refresh and try again.");
            }
            setConflict(null);
          }}
          onClose={() => setConflict(null)}
        />
      )}
      {isShareModalOpen && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setShareModalOpen(false)}
          boardId="your-board-id" // Replace with actual board ID
        />
      )}
    </div>
  );
}

export default Board;
