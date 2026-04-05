import React, { useState } from 'react';
import TopBar from './TopBar';
import Map from './Map';
import RideDrawer from './RideDrawer';

function Dashboard({ user, onLogout }) {
  return (
    <div className="flex flex-col h-screen bg-white">
      <TopBar user={user} onLogout={onLogout} />
      <div className="flex-1 relative overflow-hidden">
        <Map />
        <RideDrawer />
      </div>
    </div>
  );
}

export default Dashboard;