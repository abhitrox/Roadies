import React from 'react';
import Dashboard from '../components/Dashboard';

function DashboardPage({ user, onLogout }) {
  return <Dashboard user={user} onLogout={onLogout} />;
}

export default DashboardPage;