import React from 'react';

const FilterBar = ({
  filter,
  setFilter,
  tasks,
  handleExport,
  handleImport,
  accent,
  darkMode,
}) => {
  const assignees = [...new Set(tasks.map(t => t.assignedTo?.username || t.assignedTo?.email).filter(Boolean))];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, margin: '18px 0 0 0' }}>
        <button onClick={handleExport} style={{ borderRadius: 6, padding: '6px 16px', fontWeight: 600, background: accent, color: '#fff', border: 'none', cursor: 'pointer' }}>Export</button>
        <label style={{ borderRadius: 6, padding: '6px 16px', fontWeight: 600, background: accent, color: '#fff', border: 'none', cursor: 'pointer' }}>
          Import
          <input type="file" accept="application/json" style={{ display: 'none' }} onChange={handleImport} />
        </label>
      </div>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
        alignItems: 'center',
        justifyContent: 'center',
        margin: '24px 0 0 0',
        padding: '12px',
        background: darkMode ? '#23272f' : '#e3f2fd',
        borderRadius: 12,
        boxShadow: darkMode ? `0 2px 8px ${accent}33` : '0 2px 8px #bbdefb',
      }}>
        <input
          type="text"
          placeholder="Search title..."
          value={filter.text}
          onChange={e => setFilter(f => ({ ...f, text: e.target.value }))}
          style={{ borderRadius: 6, border: '1px solid #90caf9', padding: 6, minWidth: 120 }}
        />
        <select value={filter.assignee} onChange={e => setFilter(f => ({ ...f, assignee: e.target.value }))} style={{ borderRadius: 6, border: '1px solid #90caf9', padding: 6 }}>
          <option value="">All Assignees</option>
          {assignees.map(u => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
        <select value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))} style={{ borderRadius: 6, border: '1px solid #90caf9', padding: 6 }}>
          <option value="">All Statuses</option>
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>
        <select value={filter.priority} onChange={e => setFilter(f => ({ ...f, priority: e.target.value }))} style={{ borderRadius: 6, border: '1px solid #90caf9', padding: 6 }}>
          <option value="">All Priorities</option>
          <option value="0">Low</option>
          <option value="1">Medium</option>
          <option value="2">High</option>
        </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: 4, color: darkMode ? '#fff' : '#222' }}>
          <input
            type="checkbox"
            checked={filter.overdue}
            onChange={e => setFilter(f => ({ ...f, overdue: e.target.checked }))}
          />
          Overdue Only
        </label>
      </div>
    </>
  );
};

export default FilterBar;
