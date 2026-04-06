import React, { useState } from 'react';
import TopBar from './TopBar';
import Map from './Map';
import RideDrawer from './RideDrawer';
import ProfilePage from './ProfilePage';

function Dashboard({ user, onLogout }) {
  const [showProfile, setShowProfile] = useState(false);

  const handleLogout = () => {
    setShowProfile(false);
    onLogout();
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <TopBar 
        user={user} 
        onLogout={handleLogout}
        onOpenProfile={() => setShowProfile(true)}
      />
      <div className="flex-1 relative overflow-hidden">
        <Map />
        <RideDrawer />
      </div>

      {/* Profile Modal */}
      {showProfile && (
        <ProfilePage
          user={user}
          onClose={() => setShowProfile(false)}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default Dashboard;