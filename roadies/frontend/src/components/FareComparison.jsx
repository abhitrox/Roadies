import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';

function FareComparison({ rides, onSelectRide }) {
  const { estimatedFares, faresLoading } = useContext(AppContext);

  if (!rides || rides.length === 0) {
    return null;
  }

  // Use estimated fares if available, otherwise use default
  const displayRides = estimatedFares.length > 0 ? estimatedFares : rides;

  return (
    <div className="bg-white rounded-t-3xl shadow-2xl">
      <div className="p-4 border-b">
        <h3 className="font-bold text-gray-900">Compare Fares</h3>
        <p className="text-xs text-gray-500">
          {faresLoading ? '💰 Calculating prices...' : 'Updated based on destination'}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 text-left font-bold text-gray-900">Ride</th>
              <th className="px-4 py-3 text-center font-bold text-gray-900">
                {estimatedFares.length > 0 ? 'Updated' : 'Est.'} Fare
              </th>
              <th className="px-4 py-3 text-center font-bold text-gray-900">ETA</th>
              <th className="px-4 py-3 text-center font-bold text-gray-900">Distance</th>
              <th className="px-4 py-3 text-center font-bold text-gray-900">Rating</th>
            </tr>
          </thead>
          <tbody>
            {displayRides.map((ride) => (
              <tr
                key={ride.id}
                onClick={() => onSelectRide(ride)}
                className="border-b hover:bg-blue-50 cursor-pointer transition"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                      style={{
                        backgroundColor:
                          ride.app === 'uber'
                            ? '#0c0c10'
                            : ride.app === 'ola'
                            ? '#16a34a'
                            : '#d97706',
                      }}
                    >
                      {ride.app.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{ride.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{ride.type}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <p className="font-bold text-blue-600">
                    ₹{ride.estimatedPrice || ride.price}
                  </p>
                  {estimatedFares.length > 0 && (
                    <p className="text-xs text-gray-500 line-through">
                      ₹{ride.price}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <p className="font-semibold text-gray-900">~{ride.eta || 5} min</p>
                </td>
                <td className="px-4 py-3 text-center">
                  <p className="font-semibold text-gray-900">{ride.dist}km</p>
                </td>
                <td className="px-4 py-3 text-center">
                  <p className="font-bold text-gray-900">⭐ {ride.rating}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-gray-50 text-xs text-gray-600">
        {faresLoading ? (
          <p>⏳ Prices updating based on your destination...</p>
        ) : estimatedFares.length > 0 ? (
          <p>✅ Prices updated for your destination</p>
        ) : (
          <p>💡 Prices are estimates and may vary based on demand and distance</p>
        )}
      </div>
    </div>
  );
}

export default FareComparison;