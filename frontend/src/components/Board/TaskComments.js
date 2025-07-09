import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../utils/md5";

const getAvatarUrl = email =>
  email ? `https://www.gravatar.com/avatar/${window.md5(email.trim().toLowerCase())}?d=identicon` : undefined;

const TaskComments = ({ taskId, user, socket }) => {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      if (!user?.token) return;
      setLoading(true);
      try {
        const res = await axios.get(`${process.env.REACT_APP_API}/api/tasks/${taskId}/comments`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setComments(res.data);
      } catch {}
      setLoading(false);
    };

    fetchComments();

    if (socket) {
      socket.on("task_comment_added", ({ taskId: changedId, comment }) => {
        if (changedId === taskId) {
          setComments(currentComments => {
            // Check if comment already exists to prevent duplicates
            const exists = currentComments.find(c => 
              c._id === comment._id || 
              (c.user?._id === comment.user?._id && c.text === comment.text && c.createdAt === comment.createdAt)
            );
            return exists ? currentComments : [...currentComments, comment];
          });
        }
      });
      return () => socket.off("task_comment_added");
    }
  }, [taskId, user?.token, socket]);

  const handleAdd = async e => {
    e.preventDefault();
    if (!text.trim() || !user?.token) return;
    try {
      await axios.post(
        `${process.env.REACT_APP_API}/api/tasks/${taskId}/comments`,
        { text },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setText("");
      // Don't manually add to comments here, let socket handle it to avoid duplicates
    } catch {}
  };

  if (!user?.token) return null; // Optionally show a message like: <div>Please log in to view comments.</div>

  return (
    <div style={{ width: "100%", marginTop: 12 }} onClick={e => e.stopPropagation()}>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>Comments</div>
      <div style={{ maxHeight: 120, overflowY: "auto", marginBottom: 8 }}>
        {loading ? (
          <div>Loading...</div>
        ) : comments.length === 0 ? (
          <div style={{ color: "#888" }}>No comments yet.</div>
        ) : (
          comments.map((c) => (
            <div key={c._id || `${c.user?._id}-${c.createdAt}`} style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
              {c.user && c.user.email && (
                <img
                  src={getAvatarUrl(c.user.email)}
                  alt="avatar"
                  style={{ width: 24, height: 24, borderRadius: "50%", marginRight: 8 }}
                />
              )}
              <div style={{ fontWeight: 500, marginRight: 6 }}>{c.user?.username || c.user?.email || "User"}:</div>
              <div style={{ color: "#333" }}>{c.text}</div>
              <div style={{ marginLeft: 8, fontSize: 11, color: "#aaa" }}>
                {c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}
              </div>
            </div>
          ))
        )}
      </div>
      <form onSubmit={handleAdd} style={{ display: "flex", gap: 6 }}>
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Add a comment..."
          style={{ flex: 1, borderRadius: 6, border: "1px solid #ccc", padding: 6 }}
        />
        <button type="submit" style={{ borderRadius: 6, padding: "6px 12px" }}>Add</button>
      </form>
    </div>
  );
};

export default TaskComments;
