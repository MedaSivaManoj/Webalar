import React from "react";
import { Bar, Pie, Line } from "react-chartjs-2";
import { Chart, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, LineElement, PointElement } from "chart.js";

Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, LineElement, PointElement);

function safeDate(val) {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d) ? null : d;
}

const AnalyticsDashboard = ({ tasks }) => {
  if (!tasks || tasks.length === 0) {
    return (
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #90caf9', padding: 24, margin: '32px auto', maxWidth: 1100, textAlign: 'center' }}>
        <h2 style={{ fontWeight: 700, color: '#1976d2', marginBottom: 18 }}>Board Analytics</h2>
        <p>No tasks available to display analytics.</p>
      </div>
    );
  }
  // Active tasks per user (To Do and In Progress only)
  const userCounts = {};
  tasks.forEach(t => {
    if (t.status === "Todo" || t.status === "In Progress") {
      const name = t.assignedTo?.username || t.assignedTo?.email || "Unassigned";
      userCounts[name] = (userCounts[name] || 0) + 1;
    }
  });
  // Status breakdown
  const statusCounts = { Todo: 0, "In Progress": 0, Done: 0 };
  tasks.forEach(t => { statusCounts[t.status] = (statusCounts[t.status] || 0) + 1; });
  // Priority breakdown
  const priorityLabels = { 0: "Low", 1: "Medium", 2: "High" };
  const priorityCounts = { Low: 0, Medium: 0, High: 0, Unspecified: 0 };
  tasks.forEach(t => {
    if (t.priority === 0 || t.priority === "0") priorityCounts.Low++;
    else if (t.priority === 1 || t.priority === "1") priorityCounts.Medium++;
    else if (t.priority === 2 || t.priority === "2") priorityCounts.High++;
    else priorityCounts.Unspecified++;
  });

  // Overdue (robust date handling)
  const overdueCount = tasks.filter(t => {
    if (!t.dueDate || t.status === "Done") return false;
    const due = safeDate(t.dueDate);
    if (!due) {
      console.warn("Invalid dueDate:", t.dueDate, t);
      return false;
    }
    return due < new Date();
  }).length;

  // Average completion time (robust date handling)
  const completed = tasks.filter(t => {
    const created = safeDate(t.createdAt);
    const updated = safeDate(t.updatedAt);
    if (t.status !== "Done" || !created || !updated) {
      if (t.status === "Done" && (!created || !updated)) {
        console.warn("Invalid createdAt/updatedAt:", t.createdAt, t.updatedAt, t);
      }
      return false;
    }
    return true;
  });
  const avgCompletion = completed.length ?
    (completed.reduce((sum, t) => {
      const created = safeDate(t.createdAt);
      const updated = safeDate(t.updatedAt);
      return sum + (updated - created);
    }, 0) / completed.length / 3600000).toFixed(2) : null;

  // Tasks created over time (by day, robust date handling)
  const dateCounts = {};
  tasks.forEach(t => {
    const d = safeDate(t.createdAt);
    if (d) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
    } else if (t.createdAt) {
      console.warn("Invalid createdAt:", t.createdAt, t);
    }
  });
  const sortedDates = Object.keys(dateCounts).sort((a, b) => {
    const da = new Date(a);
    const db = new Date(b);
    return da - db;
  });

  // Most active user
  let mostActiveUser = null;
  let maxTasks = 0;
  Object.entries(userCounts).forEach(([user, count]) => {
    if (count > maxTasks) {
      mostActiveUser = user;
      maxTasks = count;
    }
  });

  return (
    <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #90caf9', padding: 24, margin: '32px auto', maxWidth: 1200 }}>
      <h2 style={{ fontWeight: 700, color: '#1976d2', marginBottom: 24, textAlign: 'center' }}>Board Analytics</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'center' }}>
        <div style={{ flex: '1 1 300px', maxWidth: '450px', minWidth: '280px' }}>
          <h3 style={{ textAlign: 'center', fontWeight: 600, color: '#1976d2', marginBottom: 4 }}>
            Active Tasks per User<br/>
            <span style={{ fontWeight: 400, fontSize: 15 }}>(To Do + In Progress)</span>
          </h3>
          <div style={{ height: 250 }}>
            <Bar
              data={{
                labels: Object.keys(userCounts),
                datasets: [{ label: 'Active Tasks per User', data: Object.values(userCounts), backgroundColor: '#1976d2' }],
              }}
              options={{ plugins: { legend: { display: false } }, responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </div>
        <div style={{ flex: '1 1 300px', maxWidth: '350px', minWidth: '280px' }}>
          <h3 style={{ textAlign: 'center', fontWeight: 600, color: '#1976d2', marginBottom: 12 }}>Tasks by Status</h3>
          <div style={{ height: 250 }}>
            <Pie
              data={{
                labels: Object.keys(statusCounts),
                datasets: [{ data: Object.values(statusCounts), backgroundColor: ['#1976d2', '#fbc02d', '#388e3c'] }],
              }}
              options={{ plugins: { legend: { position: 'bottom' } }, responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </div>
        <div style={{ flex: '1 1 300px', maxWidth: '350px', minWidth: '280px' }}>
          <h3 style={{ textAlign: 'center', fontWeight: 600, color: '#1976d2', marginBottom: 12 }}>Tasks by Priority</h3>
          <div style={{ height: 250 }}>
            <Pie
              data={{
                labels: Object.keys(priorityCounts),
                datasets: [{ data: Object.values(priorityCounts), backgroundColor: ['#1976d2', '#fbc02d', '#388e3c', '#ab47bc', '#ef5350', '#8d6e63'] }],
              }}
              options={{ plugins: { legend: { position: 'bottom' } }, responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </div>
        <div style={{ flex: '1 1 100%', maxWidth: '90%', minWidth: '280px', marginTop: 24 }}>
          <h3 style={{ textAlign: 'center', fontWeight: 600, color: '#1976d2', marginBottom: 12 }}>Tasks Created Over Time</h3>
          <div style={{ height: 250 }}>
            <Line
              data={{
                labels: sortedDates.map(d => new Date(d).toLocaleDateString()),
                datasets: [{
                  label: 'Tasks Created',
                  data: sortedDates.map(d => dateCounts[d]),
                  fill: true,
                  backgroundColor: '#1976d220',
                  borderColor: '#1976d2',
                  tension: 0.3,
                }],
              }}
              options={{ plugins: { legend: { display: false } }, responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </div>
        <div style={{ flex: '1 1 100%', display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'center', marginTop: 24 }}>
          <div style={{ flex: '1 1 150px', textAlign: 'center', background: '#f5f5f5', padding: 16, borderRadius: 12 }}>
            <div style={{ fontWeight: 600, fontSize: 18, color: '#d32f2f', marginBottom: 8 }}>Overdue Tasks</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: '#d32f2f' }}>{overdueCount}</div>
          </div>
          <div style={{ flex: '1 1 150px', textAlign: 'center', background: '#f5f5f5', padding: 16, borderRadius: 12 }}>
            <div style={{ fontWeight: 600, fontSize: 18, color: '#388e3c', marginBottom: 8 }}>Avg. Completion</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#388e3c' }}>{avgCompletion ? `${avgCompletion} hrs` : 'N/A'}</div>
          </div>
          <div style={{ flex: '1 1 150px', textAlign: 'center', background: '#f5f5f5', padding: 16, borderRadius: 12 }}>
            <div style={{ fontWeight: 600, fontSize: 18, color: '#1976d2', marginBottom: 8 }}>Most Active User</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#1976d2' }}>{mostActiveUser || 'N/A'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
