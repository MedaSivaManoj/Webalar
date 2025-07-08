import React, { useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Column from "./Column";
import AnalyticsDashboard from "./AnalyticsDashboard";
import LogPanel from "../LogPanel";
import TaskModal from "./TaskModal";
import ConflictModal from "./ConflictModal";
import TypingEffect from "../Auth/TypingEffect";
import io from "socket.io-client";
import ShareModal from "./ShareModal";

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
  const [profileOpen, setProfileOpen] = useState(false);
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
      {/* Top bar with New Task (left), Hello (center), Logout (right) */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px 0 16px', // reduced horizontal padding for more space
          zIndex: 100,
          pointerEvents: 'none',
          background: topBarBg,
          boxShadow: '0 4px 24px 0 rgba(33, 150, 243, 0.13)',
          borderBottom: topBarBorder,
          minHeight: 70,
          transition: 'box-shadow 0.2s, background 0.3s',
          backdropFilter: 'blur(6px)',
        }}
      >
        <button
          className="add-task-btn"
          style={{
            pointerEvents: 'auto',
            position: 'relative',
            left: 0,
            background: `linear-gradient(90deg, var(--accent, ${accent}) 60%, #2196f3 100%)`,
            color: '#fff',
            fontWeight: 800,
            fontSize: 18,
            borderRadius: 10,
            border: 'none',
            boxShadow: `0 4px 16px ${accent}80`,
            padding: '12px 28px',
            letterSpacing: 1.2,
            transition: 'background 0.2s, transform 0.1s, box-shadow 0.2s',
            cursor: 'pointer',
            outline: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
          onClick={() => setShowModal(true)}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setShowModal(true); }}
          tabIndex={0}
          aria-label="Create a new task"
          title="Create a new task"
        >
          <span style={{fontWeight: 900, fontSize: 22, marginRight: 2, verticalAlign: 'middle', display: 'flex', alignItems: 'center'}}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="9.25" y="4" width="3.5" height="14" rx="1.75" fill="white"/><rect x="18" y="9.25" width="3.5" height="14" rx="1.75" transform="rotate(90 18 9.25)" fill="white"/></svg>
          </span>
          New Task
        </button>
        <div
          style={{
            pointerEvents: 'auto',
            fontWeight: 700,
            fontSize: '1.6rem',
            color: darkMode ? accent : '#1976d2',
            textAlign: 'center',
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            letterSpacing: 1.1,
            textShadow: darkMode ? '0 2px 8px #222' : '0 2px 8px #bbdefb',
            position: 'relative',
            userSelect: 'none',
          }}
        >
          {user && user.username ? (
            <TypingEffect text={`Hello, ${user.username}`} speed={40} />
          ) : ''}
        </div>

        {/* Menu icon at top-right */}
        <div
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 18,
            position: 'relative',
          }}
        >
          <button
            aria-label="Open menu"
            title="Open menu"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px 32px 8px 8px', // extra right padding for label
              borderRadius: 8,
              color: darkMode ? accent : '#1976d2',
              fontSize: 20,
              outline: profileOpen ? `2px solid ${accent}` : 'none',
              boxShadow: profileOpen ? `0 0 0 2px ${accent}33` : 'none',
              transition: 'box-shadow 0.2s, outline 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 0,
              minWidth: 100, // ensure enough width for icon+label
              minHeight: 44,
              overflow: 'visible',
              gap: 8,
              fontWeight: 700,
              letterSpacing: 0.5,
              whiteSpace: 'nowrap',
              maxWidth: 180,
            }}
            onClick={() => setProfileOpen(v => !v)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setProfileOpen(v => !v); }}
            tabIndex={0}
          >
            {/* Menu (hamburger) icon */}
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect y="6" width="28" height="3.5" rx="1.75" fill="currentColor"/>
              <rect y="12.25" width="28" height="3.5" rx="1.75" fill="currentColor"/>
              <rect y="18.5" width="28" height="3.5" rx="1.75" fill="currentColor"/>
            </svg>
            <span style={{fontSize: 17, color: 'inherit', fontWeight: 700, userSelect: 'none', marginLeft: 2, overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 100, display: 'inline-block'}}>Menu</span>
          </button>
          {profileOpen && (
            <div
              style={{
                position: 'absolute',
                top: 54,
                right: 0,
                minWidth: 240,
                background: darkMode ? '#23272f' : '#fff',
                color: darkMode ? '#fff' : '#222',
                borderRadius: 16,
                boxShadow: '0 8px 32px 0 rgba(33, 150, 243, 0.13)',
                border: darkMode ? '1.5px solid #37474f' : '1.5px solid #e3f2fd',
                zIndex: 999,
                padding: '24px 28px 18px 28px', // extra padding
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                animation: 'fadeIn 0.18s',
              }}
              tabIndex={-1}
              aria-label="Menu"
            >
              {/* X mark to close dropdown */}
              <button
                aria-label="Close menu"
                title="Close menu"
                onClick={() => setProfileOpen(false)}
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  background: 'none',
                  border: 'none',
                  color: darkMode ? accent : '#1976d2',
                  fontSize: 22,
                  cursor: 'pointer',
                  borderRadius: 6,
                  padding: 4,
                  zIndex: 1001,
                  transition: 'background 0.2s',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="5" y1="5" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/><line x1="15" y1="5" x2="5" y2="15" stroke="currentColor" strokeWidth="2"/></svg>
              </button>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '10px 0',
                  textAlign: 'left',
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: 'pointer',
                  color: darkMode ? accent : accent,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
                tabIndex={0}
                aria-label="Logout"
                onClick={() => { localStorage.removeItem("user"); window.location.href = "/login"; }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="9" width="10" height="2" rx="1" fill="currentColor"/><rect x="13.7071" y="5.29289" width="2" height="8" rx="1" transform="rotate(45 13.7071 5.29289)" fill="currentColor"/><rect x="13.7071" y="14.7071" width="2" height="8" rx="1" transform="rotate(-45 13.7071 14.7071)" fill="currentColor"/></svg>
                Logout
              </button>
              <div style={{ fontSize: 15, color: darkMode ? '#90caf9' : accent, marginBottom: 8, fontWeight: 600 }}>Accent Color</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                {ACCENT_COLORS.map(color => (
                  <button
                    key={color}
                    aria-label={`Set accent color to ${color}`}
                    title={`Set accent color to ${color}`}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: color,
                      border: color === accent ? `2.5px solid ${darkMode ? '#fff' : '#1976d2'}` : '2px solid #bbb',
                      margin: '0 2px',
                      cursor: 'pointer',
                      outline: 'none',
                      boxShadow: color === accent ? `0 0 0 2px ${color}55` : 'none',
                      transition: 'box-shadow 0.2s, border 0.2s',
                    }}
                    onClick={() => setAccent(color)}
                    tabIndex={0}
                  />
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 15 }}>Theme:</span>
                <button aria-label="Light mode" style={{padding:'4px 12px',borderRadius:6,border:!darkMode?`2px solid ${accent}`:'1.5px solid #bbb',background:!darkMode?accent+'20':'#fff',color:!darkMode?accent:'#222',cursor:'pointer'}} onClick={e=>{e.stopPropagation();setDarkMode(false);}}>Light</button>
                <button aria-label="Dark mode" style={{padding:'4px 12px',borderRadius:6,border:darkMode?`2px solid ${accent}`:'1.5px solid #bbb',background:darkMode?accent+'20':'#23272f',color:darkMode?accent:'#fff',cursor:'pointer'}} onClick={e=>{e.stopPropagation();setDarkMode(true);}}>Dark</button>
              </div>
              <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-10px);} to { opacity: 1; transform: none; }}`}</style>
            </div>
          )}
        </div>

      </div>

      {/* Export/Import & Filter/Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, margin: '18px 0 0 0' }}>
        <button onClick={handleExport} style={{ borderRadius: 6, padding: '6px 16px', fontWeight: 600, background: accent, color: '#fff', border: 'none', cursor: 'pointer' }}>Export</button>
        <label style={{ borderRadius: 6, padding: '6px 16px', fontWeight: 600, background: accent, color: '#fff', border: 'none', cursor: 'pointer' }}>
          Import
          <input type="file" accept="application/json" style={{ display: 'none' }} onChange={handleImport} />
        </label>
      </div>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
        alignItems: 'center',
        justifyContent: 'center',
        margin: '24px 0 0 0',
        padding: '0 12px',
        background: darkMode ? '#23272f' : '#e3f2fd',
        borderRadius: 12,
        boxShadow: darkMode ? `0 2px 8px ${accent}33` : '0 2px 8px #bbdefb',
      }}>
        <input
          type="text"
          placeholder="Search title..."
          value={filter.text}
          onChange={e => setFilter(f => ({ ...f, text: e.target.value }))}
          style={{ borderRadius: 6, border: '1px solid #90caf9', padding: 6, minWidth: 120 }}
        />
        <select value={filter.assignee} onChange={e => setFilter(f => ({ ...f, assignee: e.target.value }))} style={{ borderRadius: 6, border: '1px solid #90caf9', padding: 6 }}>
          <option value="">All Assignees</option>
          {[...new Set(tasks.map(t => t.assignedTo?.username || t.assignedTo?.email).filter(Boolean))].map(u => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
        <select value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))} style={{ borderRadius: 6, border: '1px solid #90caf9', padding: 6 }}>
          <option value="">All Statuses</option>
          <option value="Todo">Todo</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>
        <select value={filter.priority} onChange={e => setFilter(f => ({ ...f, priority: e.target.value }))} style={{ borderRadius: 6, border: '1px solid #90caf9', padding: 6 }}>
          <option value="">All Priorities</option>
          <option value="0">Low</option>
          <option value="1">Medium</option>
          <option value="2">High</option>
        </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14 }}>
          <input type="checkbox" checked={filter.overdue} onChange={e => setFilter(f => ({ ...f, overdue: e.target.checked }))} />
          Overdue Only
        </label>
      </div>
      <div
        className={`columns board-gradient-bg board-columns-responsive${darkMode ? ' dark' : ''}`}
        style={{
          marginTop: 110,
          display: 'flex',
          gap: 32,
          padding: '0 24px',
          justifyContent: 'center',
          alignItems: 'flex-start',
          minHeight: '60vh',
          background: 'none',
          borderRadius: 24,
          boxShadow: darkMode ? `0 8px 32px 0 ${accent}40` : '0 8px 32px 0 rgba(33, 150, 243, 0.10)',
          overflowX: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: `${accent} #e3f2fd`,
          transition: 'box-shadow 0.2s, background 0.3s',
        }}
        aria-label="Kanban board columns"
        tabIndex={0}
      >
        {loadingTasks ? (
          <div style={{width:'100%',display:'flex',justifyContent:'center',alignItems:'center',minHeight:200}}>
            <div className="spinner" aria-label="Loading tasks" style={{width:48,height:48,border:`6px solid #e3f2fd`,borderTop:`6px solid ${accent}`,borderRadius:'50%',animation:'spin 1s linear infinite'}}></div>
            <style>{`@keyframes spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}`}</style>
          </div>
        ) : ["Todo", "In Progress", "Done"].map((status, idx) => (
          <div
            key={status}
            className="board-column-card"
            style={{
              background: columnBg,
              borderRadius: 16,
              boxShadow: columnShadow,
              padding: '18px 10px 24px 10px',
              minWidth: 320,
              maxWidth: 370,
              flex: '0 0 340px',
              marginBottom: 24,
              border: darkMode ? `1.5px solid ${accent}` : '1.5px solid #e3f2fd',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              transition: 'box-shadow 0.3s, background 0.3s, border 0.3s',
              animation: 'fadeInCol 0.5s',
              animationDelay: `${idx * 0.08}s`,
              animationFillMode: 'backwards',
            }}
            aria-label={`${status} column`}
            tabIndex={0}
          >
            <style>{`@keyframes fadeInCol { from { opacity: 0; transform: translateY(24px);} to { opacity: 1; transform: none; }}`}</style>
            <Column
              status={status}
              tasks={filteredTasks.filter((t) => t.status === status)}
              onDrop={onDragEnd}
              socket={socket.current}
              user={user}
              setEditTask={setEditTask}
              setShowModal={setShowModal}
            />
          </div>
        ))}
      </div>


      <div className="analytics-dashboard">
        <AnalyticsDashboard tasks={tasks} />
      </div>

      {loadingLogs ? (
        <div style={{width:'100%',display:'flex',justifyContent:'center',alignItems:'center',minHeight:100}}>
          <div className="spinner" aria-label="Loading logs" style={{width:32,height:32,border:'5px solid #e3f2fd',borderTop:`5px solid ${accent}`,borderRadius:'50%',animation:'spin 1s linear infinite'}}></div>
        </div>
      ) : <div className="log-panel"><LogPanel logs={logs} /></div>}

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

            await axios[method](
              `${process.env.REACT_APP_API}${endpoint}`,
              { ...taskData, version: editTask?.version },
              { headers: { Authorization: `Bearer ${user.token}` } }
            );
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
            setConflict(null);
            setEditTask(null);
            setShowModal(false);
          }}
          onCancel={() => setConflict(null)}
        />
      )}

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setShareModalOpen(false)}
        tasks={tasks}
      />
    </div>
  );
}

export default Board;
