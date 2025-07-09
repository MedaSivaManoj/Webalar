import React from "react";

const LogPanel = ({ logs }) => {
  // Show only the last 40 logs
  const displayLogs = logs.slice(-40);
  return (
    <div className="log-panel">
      <h3>Activity Log</h3>
      <ul>
        {displayLogs.map((log) => {
          let action = log.action;
          let showTaskTitle = true;
          let showUser = true;
          if (log.user?.username) {
            const userRegex = new RegExp(`^${log.user.username}\\s+`, 'i');
            action = action.replace(userRegex, '');
          }
          const smartAssignMatch = action.match(/^(w+) used Smart Assign and '(.+)' was assigned to (.+)\.$/);
          if (smartAssignMatch) {
            action = `used Smart Assign and <strong>${smartAssignMatch[2]}</strong> was assigned to ${smartAssignMatch[3]}.`;
            showTaskTitle = false;
            showUser = true;
          } else {
            action = action.replace(/'([^']+)'/, "<strong>$1</strong>");
            const createOrDelete = /^(<strong>\w+<\/strong> )?(created|deleted|changed|assigned)/i.test(action);
            if (createOrDelete && log.taskId && log.taskId.title) {
              showTaskTitle = false;
            }
          }
          // Bold everything except the timestamp, use fontWeight 600 for all
          return (
            <li key={log._id}>
              <span className="timestamp" style={{ fontWeight: 400 }}>
                {new Date(log.timestamp || log.createdAt).toLocaleString()}
              </span>{" "}
              <span style={{ fontWeight: 600 }}>
                {showUser && <span>{log.user?.username || "Unknown"} </span>}
                <span dangerouslySetInnerHTML={{ __html: action.replace(/<strong>(.*?)<\/strong>/g, '<span style="font-weight:600">$1</span>') }} />
                {/* Only show task title at end if not Smart Assign and not already in action */}
                {showTaskTitle && log.taskId && log.taskId.title &&
                  !/used Smart Assign/.test(action) &&
                  !(new RegExp(`<strong>${log.taskId.title}<[\\/]strong>`)).test(action) &&
                  !action.includes(log.taskId.title) && (
                    <span> on <span style={{ fontWeight: 600 }}>{log.taskId.title}</span></span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default LogPanel;
