import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';

function ProfilePage({ user, onClose, onLogout }) {
  const context = useContext(AppContext);
  const userLocation = context?.userLocation || [27.1767, 78.0081];

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name ?? 'User',
    email: user?.email ?? 'person@example.com',
    phone: user?.phone ?? '+91 9876543210',
    address: user?.address ?? '123 Main St, Agra, UP',
    emergencyContact: user?.emergencyContact ?? 'Mom - 9876543211',
  });

  const [activeTab, setActiveTab] = useState('personal');

  const rides = [
    {
      id: 1,
      app: 'Uber',
      from: 'Taj Mahal',
      to: 'Agra Fort',
      price: 180,
      driver: 'Raj Kumar',
      date: '2 days ago',
    },
    {
      id: 2,
      app: 'Ola',
      from: 'Station',
      to: 'Hotel',
      price: 220,
      driver: 'Priya Singh',
      date: '5 days ago',
    },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
    alert('Profile updated successfully');
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      onLogout();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl border border-gray-200 flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex justify-between items-center flex-shrink-0">
          <h2 className="text-white font-semibold text-lg">Profile</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-700 p-2 rounded transition"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Profile Card */}
          <div className="p-6 border-b bg-gray-50 flex justify-between items-center flex-shrink-0">
            <div className="flex gap-4 items-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                {formData.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-black truncate">{formData.name}</h3>
                <p className="text-sm text-black">Member since Jan 2024</p>
                <div className="flex gap-2 mt-1 flex-wrap">
                  <span className="text-xs bg-blue-100 text-black px-2 py-1 rounded-full border border-blue-200">
                    4.8 Rating
                  </span>
                  <span className="text-xs bg-green-100 text-black px-2 py-1 rounded-full border border-green-200">
                    Verified
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition text-sm flex-shrink-0 whitespace-nowrap"
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b bg-white sticky top-0 z-10 flex-shrink-0">
            {['personal', 'payments', 'history'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 font-medium text-sm transition border-b-2 ${
                  activeTab === tab
                    ? 'border-blue-600 text-black bg-blue-50'
                    : 'border-gray-200 text-black hover:text-black'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* PERSONAL TAB */}
            {activeTab === 'personal' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-black mb-4">Personal Information</h3>

                <div>
                  <label className="text-sm font-medium text-black block mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 disabled:text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-black block mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 disabled:text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-black block mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 disabled:text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-black block mb-2">Home Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 disabled:text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-black block mb-2">Emergency Contact</label>
                  <input
                    type="text"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 disabled:text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black"
                  />
                </div>

                {isEditing && (
                  <button
                    onClick={handleSaveProfile}
                    className="w-full bg-blue-600 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-blue-700 transition mt-4 text-sm"
                  >
                    Save Changes
                  </button>
                )}
              </div>
            )}

            {/* PAYMENTS TAB */}
            {activeTab === 'payments' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-black mb-4">Payment Methods</h3>

                {/* Wallet */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="text-sm text-black font-medium">Roadies Wallet</p>
                      <p className="text-2xl font-bold text-blue-600 mt-1">₹2,450</p>
                      <p className="text-xs text-black mt-1">Add money for faster payments</p>
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 text-sm flex-shrink-0 whitespace-nowrap">
                      Add Money
                    </button>
                  </div>
                </div>

                {/* Payment Cards */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-black mt-4">Saved Cards</p>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex justify-between items-center gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 3h18a2 2 0 012 2v14a2 2 0 01-2 2H3a2 2 0 01-2-2V5a2 2 0 012-2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-black text-sm truncate">Visa ending in 4242</p>
                        <p className="text-xs text-black">Expires 12/25</p>
                      </div>
                    </div>
                    <button className="text-red-600 hover:text-red-700 font-medium text-sm flex-shrink-0 whitespace-nowrap">
                      Remove
                    </button>
                  </div>

                  <button className="w-full border-2 border-dashed border-blue-300 text-blue-600 font-medium py-3 rounded-lg hover:bg-blue-50 transition text-sm">
                    Add New Card
                  </button>
                </div>
              </div>
            )}

            {/* HISTORY TAB */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-black mb-4">Ride History</h3>

                {rides && rides.length > 0 ? (
                  <div className="space-y-3">
                    {rides.map((ride) => (
                      <div
                        key={ride.id}
                        className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:bg-blue-50 transition"
                      >
                        <div className="flex justify-between items-start gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-black truncate">{ride.app}</p>
                            <p className="text-sm text-black truncate">{ride.driver}</p>
                          </div>
                          <p className="font-semibold text-lg text-blue-600 flex-shrink-0">₹{ride.price}</p>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-black mb-2 flex-wrap">
                          <span className="truncate">{ride.from}</span>
                          <span className="text-gray-400 flex-shrink-0">→</span>
                          <span className="truncate">{ride.to}</span>
                        </div>

                        <div className="flex justify-between items-center gap-3 flex-wrap">
                          <p className="text-xs text-black">{ride.date}</p>
                          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                            Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-black py-8 text-sm">No rides yet</p>
                )}
              </div>
            )}

            {/* Padding for scroll */}
            <div className="h-6" />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-800 text-white font-medium py-2 px-4 rounded-lg hover:bg-gray-900 transition text-sm"
          >
            Close
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 bg-gray-800 text-white font-medium py-2 px-4 rounded-lg hover:bg-gray-900 transition text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;