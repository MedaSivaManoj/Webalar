import React from "react";

const ConflictModal = ({ serverTask, clientTask, onMerge, onOverwrite, onCancel }) => {
  return (
    <div className="modal-backdrop">
      <div className="modal" style={{ maxWidth: 600, maxHeight: '90vh', overflow: 'visible', display: 'flex', flexDirection: 'column' }}>
        <h3>Conflict Detected</h3>
        <p>This task was modified by another user. Choose an action:</p>

        <div className="conflict-section" style={{ flex: 1, minHeight: 0, overflow: 'auto', maxHeight: '55vh', marginBottom: 16 }}>
          <h4>Your Changes:</h4>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: '#f1f1f1', padding: '0.6rem', overflowX: 'auto', borderRadius: 4, maxHeight: 180 }}>{JSON.stringify(clientTask, null, 2)}</pre>

          <h4>Server Version:</h4>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: '#f1f1f1', padding: '0.6rem', overflowX: 'auto', borderRadius: 4, maxHeight: 180 }}>{JSON.stringify(serverTask, null, 2)}</pre>
        </div>

        <div className="modal-actions" style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 8 }}>
          <button onClick={onMerge}>Merge</button>
          <button onClick={onOverwrite}>Overwrite</button>
          <button onClick={onCancel} className="danger">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default ConflictModal;
