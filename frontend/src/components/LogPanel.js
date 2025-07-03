import React from "react";

const LogPanel = ({ logs }) => {
  return (
    <div className="log-panel">
      <h3>Activity Log</h3>
      <ul>
        {logs.map((log) => (
          <li key={log._id}>
            <span className="timestamp">
              {new Date(log.timestamp).toLocaleString()}
            </span>{" "}
            <strong>{log.user?.username || "Unknown"}</strong> {log.action}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LogPanel;
