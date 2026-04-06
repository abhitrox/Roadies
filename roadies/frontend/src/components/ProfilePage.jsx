import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';

function ProfilePage({ user, onClose, onLogout }) {
  const { userLocation } = useContext(AppContext) || {
    userLocation: [27.1767, 78.0081],
  };

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || 'User',
    email: user?.email || 'user@example.com',
    phone: user?.phone || '+91 9876543210',
    address: user?.address || '123 Main St, Agra, UP',
    emergencyContact: user?.emergencyContact || 'Mom - 9876543211',
  });

  const [activeTab, setActiveTab] = useState('personal'); // personal, payments, history, settings
  const [rides, setRides] = useState([
    {
      id: 1,
      app: 'Uber',
      from: 'Taj Mahal',
      to: 'Agra Fort',
      date: '2 days ago',
      price: 180,
      rating: 5,
      driver: 'Raj Kumar',
    },
    {
      id: 2,
      app: 'Ola',
      from: 'Agra Railway Station',
      to: 'Hotel Amar',
      date: '5 days ago',
      price: 220,
      rating: 4,
      driver: 'Priya Singh',
    },
    {
      id: 3,
      app: 'Rapido',
      from: 'Market Area',
      to: 'Office',
      date: '1 week ago',
      price: 90,
      rating: 5,
      driver: 'Arjun Patel',
    },
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
    alert('✅ Profile updated successfully!');
    // Here you would save to backend
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-white font-bold text-xl">👤 My Profile</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-800 rounded-full p-2 transition text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Profile Header Card */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                  {user?.name?.charAt(0).toUpperCase() || 'G'}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{formData.name}</h3>
                  <p className="text-sm text-gray-600">Member since Jan 2024</p>
                  <div className="flex gap-2 mt-2">
                    <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full font-semibold">
                      ⭐ 4.8 Rating
                    </span>
                    <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full font-semibold">
                      ✓ Verified
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                {isEditing ? 'Cancel' : '✏️ Edit'}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white border-b flex gap-0 sticky top-0 z-10">
            {[
              { id: 'personal', label: '👤 Personal' },
              { id: 'payments', label: '💳 Payments' },
              { id: 'history', label: '📋 History' },
              { id: 'settings', label: '⚙️ Settings' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-3 font-semibold transition ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 border-b-2 border-gray-200 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Based on Active Tab */}
          <div className="p-6">
            {/* Personal Info Tab */}
            {activeTab === 'personal' && (
              <div className="space-y-4">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Personal Information</h3>

                <div>
                  <label className="text-sm font-semibold text-gray-700">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700">Home Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700">Emergency Contact</label>
                  <input
                    type="text"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {isEditing && (
                  <button
                    onClick={handleSaveProfile}
                    className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition mt-4"
                  >
                    ✓ Save Changes
                  </button>
                )}
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <div className="space-y-4">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Payment Methods</h3>

                {/* Wallet */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-2xl border-2 border-blue-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">💳 Roadies Wallet</p>
                      <p className="text-2xl font-bold text-blue-600">₹2,450</p>
                      <p className="text-xs text-gray-500 mt-1">Add money to wallet for faster payments</p>
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700">
                      + Add Money
                    </button>
                  </div>
                </div>

                {/* Payment Cards */}
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-700 mt-4">Saved Cards</p>

                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💳</span>
                      <div>
                        <p className="font-semibold text-gray-900">Visa ending in 4242</p>
                        <p className="text-xs text-gray-500">Expires 12/25</p>
                      </div>
                    </div>
                    <button className="text-red-600 hover:text-red-700 font-semibold">Remove</button>
                  </div>

                  <button className="w-full border-2 border-dashed border-blue-300 text-blue-600 font-semibold py-3 rounded-2xl hover:bg-blue-50 transition">
                    + Add New Card
                  </button>
                </div>
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Ride History</h3>

                {rides.length > 0 ? (
                  <div className="space-y-3">
                    {rides.map((ride) => (
                      <div
                        key={ride.id}
                        className="bg-gray-50 p-4 rounded-2xl border border-gray-200 hover:bg-blue-50 transition"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-bold text-gray-900">{ride.app}</p>
                            <p className="text-sm text-gray-600">{ride.driver}</p>
                          </div>
                          <p className="font-bold text-lg text-blue-600">₹{ride.price}</p>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <span>📍 {ride.from}</span>
                          <span>→</span>
                          <span>🎯 {ride.to}</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <p className="text-xs text-gray-500">{ride.date}</p>
                          <div className="flex gap-2">
                            <span className="text-yellow-500">⭐ {ride.rating}.0</span>
                            <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No rides yet</p>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-4">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Settings & Preferences</h3>

                {/* Notification Settings */}
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-700">Notifications</p>

                  {[
                    { label: 'Ride Updates', enabled: true },
                    { label: 'Promotions & Offers', enabled: true },
                    { label: 'Payment Confirmations', enabled: true },
                    { label: 'Safety Alerts', enabled: true },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">{item.label}</span>
                      <input type="checkbox" defaultChecked={item.enabled} className="w-5 h-5" />
                    </div>
                  ))}
                </div>

                {/* Safety Settings */}
                <div className="space-y-3 mt-4">
                  <p className="text-sm font-semibold text-gray-700">Safety & Privacy</p>

                  <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    🔒 Share Trip with Trusted Contacts
                  </button>
                  <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    🆘 Emergency SOS Settings
                  </button>
                  <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    🔐 Privacy Settings
                  </button>
                </div>

                {/* App Settings */}
                <div className="space-y-3 mt-4">
                  <p className="text-sm font-semibold text-gray-700">App</p>

                  <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    🌙 Dark Mode (Coming Soon)
                  </button>
                  <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    📱 App Version 1.0.0
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer with Logout */}
        <div className="border-t p-6 bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-200 text-gray-900 font-bold rounded-lg hover:bg-gray-300 transition"
          >
            Close
          </button>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to logout?')) {
                onLogout();
              }
            }}
            className="flex-1 px-4 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition"
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;