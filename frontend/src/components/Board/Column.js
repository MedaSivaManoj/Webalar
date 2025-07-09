import React from "react";
import TaskCard from "./TaskCard";

const Column = ({ status, tasks, onDrop, socket, user, setEditTask, setShowModal, columnStyle }) => {
  const handleDrop = (e) => {
    e.preventDefault();
    onDrop(e, status);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleEdit = (task) => {
    setEditTask(task);
    setShowModal(true);
  };

  const displayStatus = status === "Todo" ? "To Do" : status;

  return (
    <div className="column" onDrop={handleDrop} onDragOver={handleDragOver} style={columnStyle}>
      <h3>{displayStatus}</h3>
      {tasks.map((task) => (
        <TaskCard
          key={task._id}
          task={task}
          socket={socket}
          user={user}
          onEdit={handleEdit}
        />
      ))}
    </div>
  );
};

export default Column;
