import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const TaskAttachments = ({ taskId, user }) => {
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInput = useRef();

  useEffect(() => {
    const fetchAttachments = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${process.env.REACT_APP_API}/api/tasks/${taskId}/attachments`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setAttachments(res.data);
      } catch {}
      setLoading(false);
    };
    fetchAttachments();
  }, [taskId, user.token]);

  const handleUpload = async e => {
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
      // Refresh attachments
      const res = await axios.get(`${process.env.REACT_APP_API}/api/tasks/${taskId}/attachments`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setAttachments(res.data);
    } catch {}
  };

  return (
    <div style={{ width: "100%", marginTop: 12 }}>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>Attachments</div>
      <div style={{ maxHeight: 100, overflowY: "auto", marginBottom: 8 }}>
        {loading ? (
          <div>Loading...</div>
        ) : attachments.length === 0 ? (
          <div style={{ color: "#888" }}>No attachments yet.</div>
        ) : (
          attachments.map((a, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
              <a href={a.url} target="_blank" rel="noopener noreferrer" style={{ color: "#1976d2", fontWeight: 500 }}>
                {a.filename}
              </a>
              <span style={{ marginLeft: 8, fontSize: 11, color: "#aaa" }}>{a.uploadedAt ? new Date(a.uploadedAt).toLocaleString() : ""}</span>
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
      <button type="button" onClick={() => fileInput.current && fileInput.current.click()} style={{ borderRadius: 6, padding: "6px 12px" }}>
        Upload
      </button>
    </div>
  );
};

export default TaskAttachments;
