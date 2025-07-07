import React from "react";

const LogPanel = ({ logs }) => {
  return (
    <div className="log-panel">
      <h3>Activity Log</h3>
      <ul>
        {logs.map((log) => {
          // Remove duplicate username and task title for Smart Assign
          let action = log.action;
          let showTaskTitle = true;
          let showUser = true;
          // Remove duplicate username at the start of action string
          if (log.user?.username) {
            const userRegex = new RegExp(`^${log.user.username}\\s+`, 'i');
            action = action.replace(userRegex, '');
          }
          // Regex to match: username used Smart Assign and 'Task Title' was assigned to ...
          const smartAssignMatch = action.match(/^(\w+) used Smart Assign and '(.+)' was assigned to (.+)\.$/);
          if (smartAssignMatch) {
            // Only show: <username> used Smart Assign and <b>Task Title</b> was assigned to <user>.
            action = `used Smart Assign and <strong>${smartAssignMatch[2]}</strong> was assigned to ${smartAssignMatch[3]}.`;
            showTaskTitle = false;
            showUser = true; // Username will be shown only once
          } else {
            // Bold the task title in other actions if present in single quotes
            action = action.replace(/'([^']+)'/, "<strong>$1</strong>");
            // If action is a create or delete and task title matches log.taskId.title, don't show the trailing 'on ...'
            const createOrDelete = /^(<strong>\w+<\/strong> )?(created|deleted|changed|assigned)/i.test(action);
            if (createOrDelete && log.taskId && log.taskId.title) {
              // Remove ' on <strong>Task Title</strong>' if present at the end
              showTaskTitle = false;
            }
          }
          return (
            <li key={log._id}>
              <span className="timestamp">
                {new Date(log.timestamp || log.createdAt).toLocaleString()}
              </span>{" "}
              {showUser && <span><strong>{log.user?.username || "Unknown"}</strong> </span>}
              <span dangerouslySetInnerHTML={{ __html: action }} />
              {/* Only show task title at end if not Smart Assign and not already in action */}
              {showTaskTitle && log.taskId && log.taskId.title &&
                !/used Smart Assign/.test(action) &&
                !(new RegExp(`<strong>${log.taskId.title}<[\\/]strong>`)).test(action) &&
                !action.includes(log.taskId.title) && (
                  <span> on <strong>{log.taskId.title}</strong></span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default LogPanel;
