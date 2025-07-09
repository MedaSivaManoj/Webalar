import React from 'react';
import LogPanel from '../LogPanel';
import AnalyticsDashboard from './AnalyticsDashboard';

const InfoPanels = ({
  loadingLogs,
  logs,
  tasks,
  columnBg,
  columnShadow,
  darkMode,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 20, padding: '0 20px', gap: 20 }}>
      <div style={{ width: '100%', maxWidth: '90vw', background: columnBg, boxShadow: columnShadow, borderRadius: 12, padding: 16 }}>
        <h2 style={{ textAlign: 'center', color: darkMode ? '#fff' : '#222' }}>Activity Log</h2>
        {loadingLogs ? <div>Loading logs...</div> : <LogPanel logs={logs} />}
      </div>
      <div style={{ width: '100%', maxWidth: '90vw', background: columnBg, boxShadow: columnShadow, borderRadius: 12, padding: 16 }}>
        <h2 style={{ textAlign: 'center', color: darkMode ? '#fff' : '#222' }}>Analytics</h2>
        <AnalyticsDashboard tasks={tasks} />
      </div>
    </div>
  );
};

export default InfoPanels;
