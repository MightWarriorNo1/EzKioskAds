import React, { useState } from 'react';
import { Monitor, MapPin, Wifi, WifiOff, Settings, BarChart3, Plus } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';

interface Kiosk {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'maintenance';
  uptime: number;
  lastSeen: string;
  currentAd: string;
  dailyImpressions: number;
  coordinates: [number, number];
}

export default function KioskManager() {
  const { addNotification } = useNotification();
  const [view, setView] = useState<'list' | 'map'>('list');
  
  const [kiosks, setKiosks] = useState<Kiosk[]>([
    {
      id: 'K-001',
      name: 'Mall Entrance A',
      location: 'Westfield Shopping Center',
      status: 'online',
      uptime: 99.2,
      lastSeen: '2 minutes ago',
      currentAd: 'Summer Sale 2025',
      dailyImpressions: 1250,
      coordinates: [40.7128, -74.0060]
    },
    {
      id: 'K-002',
      name: 'Food Court Central',
      location: 'Westfield Shopping Center',
      status: 'online',
      uptime: 98.8,
      lastSeen: '5 minutes ago',
      currentAd: 'Holiday Promotion',
      dailyImpressions: 890,
      coordinates: [40.7589, -73.9851]
    },
    {
      id: 'K-003',
      name: 'Train Station Display',
      location: 'Central Station',
      status: 'offline',
      uptime: 95.1,
      lastSeen: '2 hours ago',
      currentAd: 'No ad playing',
      dailyImpressions: 0,
      coordinates: [40.7505, -73.9934]
    },
    {
      id: 'K-004',
      name: 'University Campus Center',
      location: 'State University',
      status: 'online',
      uptime: 99.5,
      lastSeen: '1 minute ago',
      currentAd: 'Back to School Campaign',
      dailyImpressions: 2100,
      coordinates: [40.7345, -73.9900]
    },
    {
      id: 'K-005',
      name: 'Fashion District Hub',
      location: 'Fashion District',
      status: 'maintenance',
      uptime: 92.3,
      lastSeen: '30 minutes ago',
      currentAd: 'Maintenance Mode',
      dailyImpressions: 0,
      coordinates: [40.7484, -73.9857]
    },
    {
      id: 'K-006',
      name: 'Convention Center Lobby',
      location: 'International Convention Center',
      status: 'online',
      uptime: 97.8,
      lastSeen: '3 minutes ago',
      currentAd: 'Tech Conference Promo',
      dailyImpressions: 1650,
      coordinates: [40.7608, -73.9792]
    },
    {
      id: 'K-007',
      name: 'Downtown Food Court',
      location: 'Downtown Plaza',
      status: 'online',
      uptime: 99.0,
      lastSeen: '4 minutes ago',
      currentAd: 'Restaurant Week Special',
      dailyImpressions: 980,
      coordinates: [40.7589, -73.9851]
    },
    {
      id: 'K-008',
      name: 'Sports Complex Entrance',
      location: 'Metropolitan Sports Complex',
      status: 'online',
      uptime: 98.2,
      lastSeen: '6 minutes ago',
      currentAd: 'Fitness Center Membership',
      dailyImpressions: 750,
      coordinates: [40.7421, -73.9911]
    },
    {
      id: 'K-009',
      name: 'Cinema Multiplex',
      location: 'Entertainment District',
      status: 'online',
      uptime: 96.7,
      lastSeen: '8 minutes ago',
      currentAd: 'Movie Theater Premiere',
      dailyImpressions: 1450,
      coordinates: [40.7568, -73.9785]
    },
    {
      id: 'K-010',
      name: 'Auto Mall Display',
      location: 'Automotive District',
      status: 'offline',
      uptime: 94.5,
      lastSeen: '1 hour ago',
      currentAd: 'No ad playing',
      dailyImpressions: 0,
      coordinates: [40.7328, -73.9872]
    },
    {
      id: 'K-011',
      name: 'Airport Terminal A',
      location: 'International Airport',
      status: 'online',
      uptime: 99.8,
      lastSeen: '30 seconds ago',
      currentAd: 'Travel Insurance Promo',
      dailyImpressions: 3200,
      coordinates: [40.6413, -73.7781]
    },
    {
      id: 'K-012',
      name: 'Hospital Main Lobby',
      location: 'Metropolitan Medical Center',
      status: 'online',
      uptime: 99.1,
      lastSeen: '2 minutes ago',
      currentAd: 'Health Insurance Campaign',
      dailyImpressions: 1100,
      coordinates: [40.7648, -73.9808]
    },
    {
      id: 'K-013',
      name: 'Library Information Desk',
      location: 'Public Library',
      status: 'maintenance',
      uptime: 91.2,
      lastSeen: '45 minutes ago',
      currentAd: 'Maintenance Mode',
      dailyImpressions: 0,
      coordinates: [40.7527, -73.9772]
    },
    {
      id: 'K-014',
      name: 'Museum Gift Shop',
      location: 'Natural History Museum',
      status: 'online',
      uptime: 98.9,
      lastSeen: '1 minute ago',
      currentAd: 'Museum Membership Drive',
      dailyImpressions: 850,
      coordinates: [40.7813, -73.9740]
    },
    {
      id: 'K-015',
      name: 'Bus Terminal Display',
      location: 'Central Bus Terminal',
      status: 'online',
      uptime: 97.3,
      lastSeen: '5 minutes ago',
      currentAd: 'Public Transport App',
      dailyImpressions: 2200,
      coordinates: [40.7505, -73.9934]
    }
  ]);

  const getStatusColor = (status: Kiosk['status']) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800';
      case 'offline': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Kiosk['status']) => {
    switch (status) {
      case 'online': return <Wifi className="h-4 w-4" />;
      case 'offline': return <WifiOff className="h-4 w-4" />;
      case 'maintenance': return <Settings className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  const handleAddKiosk = () => {
    addNotification('info', 'Add Kiosk', 'Add kiosk functionality will be implemented soon');
  };

  const handleKioskSettings = (kioskId: string, kioskName: string) => {
    addNotification('info', 'Kiosk Settings', `Settings for ${kioskName} will be opened`);
  };

  const handleKioskAnalytics = (kioskId: string, kioskName: string) => {
    addNotification('info', 'Kiosk Analytics', `Analytics for ${kioskName} will be displayed`);
  };

  const handleViewChange = (newView: 'list' | 'map') => {
    setView(newView);
    addNotification('info', 'View Changed', `Switched to ${newView} view`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kiosk Manager</h1>
          <p className="text-gray-600 mt-2">Monitor and manage your digital advertising kiosks</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => handleViewChange('list')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                view === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => handleViewChange('map')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                view === 'map' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Map View
            </button>
          </div>
          <button onClick={handleAddKiosk} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Kiosk</span>
          </button>
        </div>
      </div>

      {/* List View */}
      {view === 'list' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Your Kiosks</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kiosk</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Ad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Daily Impressions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uptime</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {kiosks.map((kiosk) => (
                  <tr key={kiosk.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{kiosk.name}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {kiosk.location}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(kiosk.status)}`}>
                        {getStatusIcon(kiosk.status)}
                        <span className="ml-1 capitalize">{kiosk.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{kiosk.currentAd}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{kiosk.dailyImpressions.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{kiosk.uptime}%</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => handleKioskSettings(kiosk.id, kiosk.name)} className="text-blue-600 hover:text-blue-800">
                          <Settings className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleKioskAnalytics(kiosk.id, kiosk.name)} className="text-green-600 hover:text-green-800">
                          <BarChart3 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Map View */}
      {view === 'map' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Kiosk Locations Map</h3>
          <div className="h-96 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600">Interactive map with kiosk locations</p>
              <p className="text-sm text-gray-500 mt-2">Real-time status indicators and performance data</p>
            </div>
          </div>
          
          {/* Map Legend */}
          <div className="mt-4 flex justify-center">
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Online</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-gray-600">Offline</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-600">Maintenance</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}