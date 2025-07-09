import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const TaskAttachments = ({ taskId, user }) => {
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInput = useRef();

  const fetchAttachments = async () => {
    if (!user?.token) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API}/api/tasks/${taskId}/attachments`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setAttachments(res.data);
    } catch (err) {
      console.error("Failed to fetch attachments", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!user?.token) return;
    fetchAttachments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId, user?.token]);

  const handleUpload = async (e) => {
    e.stopPropagation();
    if (!user?.token) return;
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      await axios.post(
        `${process.env.REACT_APP_API}/api/tasks/${taskId}/attachments`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      e.target.value = "";
      fetchAttachments(); // Refresh attachments
    } catch (err) {
      console.error("Failed to upload attachment", err);
    }
  };

  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleRemove = (e, attachmentId) => {
    e.preventDefault();
    e.stopPropagation();
    setPendingDelete(attachmentId);
  };

  const confirmRemove = async () => {
    if (!user?.token || !pendingDelete) return;
    setDeleting(true);
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API}/api/tasks/${taskId}/attachments/${pendingDelete}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      if (response.status === 200) {
        setAttachments(prev => prev.filter(a => a._id !== pendingDelete));
        await fetchAttachments();
      }
      setPendingDelete(null);
    } catch (err) {
      console.error("Failed to remove attachment", err);
      alert("Failed to remove attachment. Please try again.");
      setPendingDelete(null);
    }
    setDeleting(false);
  };

  if (!user?.token) return null;

  return (
    <>
      {/* Delete Confirmation Dialog */}
      {pendingDelete && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.35)',
          zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 8,
            padding: 24,
            minWidth: 320,
            boxShadow: '0 2px 16px rgba(0,0,0,0.18)',
            textAlign: 'center',
            position: 'relative'
          }}>
            <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 12 }}>Remove Attachment</div>
            <div style={{ marginBottom: 18 }}>Are you sure you want to remove this attachment?</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
              <button onClick={() => setPendingDelete(null)} style={{ padding: '6px 18px', borderRadius: 6, background: '#eee', color: '#333', border: 'none' }}>Cancel</button>
              <button onClick={confirmRemove} disabled={deleting} style={{ padding: '6px 18px', borderRadius: 6, background: '#e53935', color: '#fff', border: 'none' }}>{deleting ? 'Removing...' : 'Remove'}</button>
            </div>
          </div>
        </div>
      )}
      <div
        style={{ width: "100%", marginTop: 12 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontWeight: 600, marginBottom: 6 }}>Attachments</div>
        <div style={{ maxHeight: 100, overflowY: "auto", marginBottom: 8 }}>
          {loading ? (
            <div>Loading...</div>
          ) : attachments.length === 0 ? (
            <div style={{ color: "#888" }}>No attachments yet.</div>
          ) : (
            attachments.map((a) => (
              <div
                key={a._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <a
                  href={`${process.env.REACT_APP_API}${a.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#1976d2",
                    fontWeight: 500,
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {a.filename}
                </a>
                <button
                  onClick={(e) => handleRemove(e, a._id)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#d32f2f",
                    cursor: "pointer",
                    fontSize: 16,
                    padding: "0 4px",
                    marginLeft: 8,
                  }}
                  aria-label={`Remove ${a.filename}`}
                  title={`Remove ${a.filename}`}
                >
                  &times;
                </button>
              </div>
            ))
          )}
        </div>
        <input
          type="file"
          ref={fileInput}
          style={{ display: "none" }}
          onChange={handleUpload}
        />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            fileInput.current && fileInput.current.click();
          }}
          style={{ borderRadius: 6, padding: "6px 12px" }}
        >
          Upload
        </button>
      </div>
    </>
  );
};

export default TaskAttachments;
