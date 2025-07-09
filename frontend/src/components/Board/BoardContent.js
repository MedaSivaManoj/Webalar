import React from 'react';
import Column from './Column';

const BoardContent = ({
  loadingTasks,
  darkMode,
  filteredTasks,
  onDragEnd,
  socket,
  user,
  setEditTask,
  setShowModal,
  columnBg,
  columnShadow,
}) => {
  if (loadingTasks) {
    return <div style={{ textAlign: 'center', marginTop: 150, color: darkMode ? '#fff' : '#222' }}>Loading tasks...</div>;
  }

  return (
    <div
      className="board-columns-responsive"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: 16,
        padding: '0 16px',
        marginTop: 100,
        overflowX: 'auto',
        minHeight: 'calc(100vh - 320px)',
      }}
    >
      <div style={{ flex: 1, minWidth: 280, margin: '0 8px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Column
          status="Todo"
          tasks={filteredTasks.filter((t) => t.status === "Todo")}
          onDrop={onDragEnd}
          socket={socket}
          user={user}
          setEditTask={setEditTask}
          setShowModal={setShowModal}
          columnStyle={{ background: columnBg, boxShadow: columnShadow }}
        />
      </div>
      <div style={{ flex: 1, minWidth: 280, margin: '0 8px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Column
          status="In Progress"
          tasks={filteredTasks.filter((t) => t.status === "In Progress")}
          onDrop={onDragEnd}
          socket={socket}
          user={user}
          setEditTask={setEditTask}
          setShowModal={setShowModal}
          columnStyle={{ background: columnBg, boxShadow: columnShadow }}
        />
      </div>
      <div style={{ flex: 1, minWidth: 280, margin: '0 8px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Column
          status="Done"
          tasks={filteredTasks.filter((t) => t.status === "Done")}
          onDrop={onDragEnd}
          socket={socket}
          user={user}
          setEditTask={setEditTask}
          setShowModal={setShowModal}
          columnStyle={{ background: columnBg, boxShadow: columnShadow }}
        />
      </div>
    </div>
  );
};

export default BoardContent;
