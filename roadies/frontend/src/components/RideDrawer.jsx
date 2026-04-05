import React, { useState, useEffect } from 'react';
import RideCard from './RideCard';
import { ridesAPI } from '../services/api';

function RideDrawer() {
  const [rides, setRides] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRides();
  }, [filter]);

  const fetchRides = async () => {
    setLoading(true);
    try {
      const response = filter === 'all'
        ? await ridesAPI.getNearby()
        : await ridesAPI.getFiltered(filter);
      setRides(response.data);
    } catch (error) {
      console.error('Error fetching rides:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRides = filter === 'all' ? rides : rides.filter(r => r.type === filter);

  return (
    <div className="absolute bottom-0 left-0 right-0 z-60 bg-white border-t-2 border-border rounded-t-3xl max-h-[58vh] flex flex-col">
      {/* Handle */}
      <div className="w-9 h-1 bg-border rounded-full mx-auto mt-2.5 mb-2"></div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2">
        <h3 className="text-base font-black text-ink">Rides near you</h3>
        <div className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
          {filteredRides.length} available
        </div>
      </div>

      {/* Subheader */}
      <div className="flex items-center justify-between px-4 text-xs text-muted font-medium">
        <span>Predicted for current time</span>
        <span className="text-green-600 font-bold">1.0x — no surge</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 px-4 py-2 overflow-x-auto flex-wrap">
        {['all', 'bike', 'auto', 'cab', 'xl'].map(type => (
          <button
            key={type}
            onClick={() => {
              setFilter(type);
              setSelectedId(null);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              filter === type
                ? 'bg-ink text-white'
                : 'bg-pill text-muted hover:bg-gray-300'
            }`}
          >
            {type === 'all' ? 'All' : type === 'xl' ? 'XL / SUV' : type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Rides List */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-full text-muted text-sm">
            Loading rides...
          </div>
        ) : filteredRides.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted text-sm">
            No rides available
          </div>
        ) : (
          filteredRides.map(ride => (
            <RideCard
              key={ride.id}
              ride={ride}
              isSelected={selectedId === ride.id}
              onSelect={() => setSelectedId(ride.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default RideDrawer;