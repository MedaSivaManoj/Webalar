import React from "react";

const ConflictModal = ({ serverTask, clientTask, onMerge, onOverwrite, onCancel }) => {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Conflict Detected</h3>
        <p>This task was modified by another user. Choose an action:</p>

        <div className="conflict-section">
          <h4>Your Changes:</h4>
          <pre>{JSON.stringify(clientTask, null, 2)}</pre>

          <h4>Server Version:</h4>
          <pre>{JSON.stringify(serverTask, null, 2)}</pre>
        </div>

        <div className="modal-actions">
          <button onClick={onMerge}>Merge</button>
          <button onClick={onOverwrite}>Overwrite</button>
          <button onClick={onCancel} className="danger">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default ConflictModal;
