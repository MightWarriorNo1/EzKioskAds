import React, { useState } from 'react';
import { Monitor, MapPin, Wifi, WifiOff, Settings, Plus, Search, Filter, Download, DollarSign } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';

interface Kiosk {
  id: string;
  name: string;
  location: string;
  host: string;
  status: 'online' | 'offline' | 'maintenance';
  uptime: number;
  dailyImpressions: number;
  monthlyRevenue: number;
  lastMaintenance: string;
}

export default function KioskManagement() {
  const { addNotification } = useNotification();
  const [kiosks, setKiosks] = useState<Kiosk[]>([
    {
      id: 'K-001',
      name: 'Mall Entrance A',
      location: 'Westfield Shopping Center',
      host: 'Downtown Digital',
      status: 'online',
      uptime: 99.2,
      dailyImpressions: 1250,
      monthlyRevenue: 4200,
      lastMaintenance: '2024-12-15'
    },
    {
      id: 'K-002',
      name: 'Food Court Central',
      location: 'Westfield Shopping Center',
      host: 'Downtown Digital',
      status: 'online',
      uptime: 98.8,
      dailyImpressions: 890,
      monthlyRevenue: 3150,
      lastMaintenance: '2024-11-28'
    },
    {
      id: 'K-003',
      name: 'Train Station Display',
      location: 'Central Station',
      host: 'Metro Displays',
      status: 'maintenance',
      uptime: 95.1,
      dailyImpressions: 0,
      monthlyRevenue: 2800,
      lastMaintenance: '2025-01-18'
    },
    {
      id: 'K-004',
      name: 'University Campus Center',
      location: 'State University',
      host: 'Campus Media',
      status: 'online',
      uptime: 99.5,
      dailyImpressions: 2100,
      monthlyRevenue: 5200,
      lastMaintenance: '2024-12-20'
    },
    {
      id: 'K-005',
      name: 'Fashion District Hub',
      location: 'Fashion District',
      host: 'Urban Displays',
      status: 'maintenance',
      uptime: 92.3,
      dailyImpressions: 0,
      monthlyRevenue: 3800,
      lastMaintenance: '2025-01-20'
    },
    {
      id: 'K-006',
      name: 'Convention Center Lobby',
      location: 'International Convention Center',
      host: 'Event Media',
      status: 'online',
      uptime: 97.8,
      dailyImpressions: 1650,
      monthlyRevenue: 4800,
      lastMaintenance: '2024-11-15'
    },
    {
      id: 'K-007',
      name: 'Downtown Food Court',
      location: 'Downtown Plaza',
      host: 'City Displays',
      status: 'online',
      uptime: 99.0,
      dailyImpressions: 980,
      monthlyRevenue: 3200,
      lastMaintenance: '2024-12-10'
    },
    {
      id: 'K-008',
      name: 'Sports Complex Entrance',
      location: 'Metropolitan Sports Complex',
      host: 'Sports Media',
      status: 'online',
      uptime: 98.2,
      dailyImpressions: 750,
      monthlyRevenue: 2800,
      lastMaintenance: '2024-11-25'
    },
    {
      id: 'K-009',
      name: 'Cinema Multiplex',
      location: 'Entertainment District',
      host: 'Entertainment Media',
      status: 'online',
      uptime: 96.7,
      dailyImpressions: 1450,
      monthlyRevenue: 4200,
      lastMaintenance: '2024-12-05'
    },
    {
      id: 'K-010',
      name: 'Auto Mall Display',
      location: 'Automotive District',
      host: 'Auto Media',
      status: 'offline',
      uptime: 94.5,
      dailyImpressions: 0,
      monthlyRevenue: 2200,
      lastMaintenance: '2025-01-10'
    },
    {
      id: 'K-011',
      name: 'Airport Terminal A',
      location: 'International Airport',
      host: 'Travel Media',
      status: 'online',
      uptime: 99.8,
      dailyImpressions: 3200,
      monthlyRevenue: 8500,
      lastMaintenance: '2024-12-30'
    },
    {
      id: 'K-012',
      name: 'Hospital Main Lobby',
      location: 'Metropolitan Medical Center',
      host: 'Health Media',
      status: 'online',
      uptime: 99.1,
      dailyImpressions: 1100,
      monthlyRevenue: 3600,
      lastMaintenance: '2024-11-20'
    },
    {
      id: 'K-013',
      name: 'Library Information Desk',
      location: 'Public Library',
      host: 'Public Media',
      status: 'maintenance',
      uptime: 91.2,
      dailyImpressions: 0,
      monthlyRevenue: 1800,
      lastMaintenance: '2025-01-22'
    },
    {
      id: 'K-014',
      name: 'Museum Gift Shop',
      location: 'Natural History Museum',
      host: 'Cultural Media',
      status: 'online',
      uptime: 98.9,
      dailyImpressions: 850,
      monthlyRevenue: 2400,
      lastMaintenance: '2024-12-12'
    },
    {
      id: 'K-015',
      name: 'Bus Terminal Display',
      location: 'Central Bus Terminal',
      host: 'Transit Media',
      status: 'online',
      uptime: 97.3,
      dailyImpressions: 2200,
      monthlyRevenue: 5800,
      lastMaintenance: '2024-11-30'
    },
    {
      id: 'K-016',
      name: 'Shopping Mall North',
      location: 'Northside Shopping Center',
      host: 'North Media',
      status: 'online',
      uptime: 98.7,
      dailyImpressions: 1350,
      monthlyRevenue: 4100,
      lastMaintenance: '2024-12-08'
    },
    {
      id: 'K-017',
      name: 'Office Building Lobby',
      location: 'Downtown Business District',
      host: 'Corporate Media',
      status: 'online',
      uptime: 99.3,
      dailyImpressions: 950,
      monthlyRevenue: 2900,
      lastMaintenance: '2024-11-18'
    },
    {
      id: 'K-018',
      name: 'Gas Station Convenience',
      location: 'Highway Rest Stop',
      host: 'Highway Media',
      status: 'offline',
      uptime: 93.8,
      dailyImpressions: 0,
      monthlyRevenue: 1600,
      lastMaintenance: '2025-01-05'
    },
    {
      id: 'K-019',
      name: 'Restaurant Chain Location',
      location: 'Fast Food District',
      host: 'Food Media',
      status: 'online',
      uptime: 97.5,
      dailyImpressions: 680,
      monthlyRevenue: 2100,
      lastMaintenance: '2024-12-14'
    },
    {
      id: 'K-020',
      name: 'Gym Fitness Center',
      location: 'Health & Wellness Plaza',
      host: 'Fitness Media',
      status: 'online',
      uptime: 98.1,
      dailyImpressions: 420,
      monthlyRevenue: 1800,
      lastMaintenance: '2024-11-30'
    },
    {
      id: 'K-021',
      name: 'Bank Branch Lobby',
      location: 'Financial District',
      host: 'Finance Media',
      status: 'online',
      uptime: 99.6,
      dailyImpressions: 780,
      monthlyRevenue: 2500,
      lastMaintenance: '2024-12-22'
    },
    {
      id: 'K-022',
      name: 'Pharmacy Waiting Area',
      location: 'Medical Plaza',
      host: 'Pharma Media',
      status: 'maintenance',
      uptime: 90.5,
      dailyImpressions: 0,
      monthlyRevenue: 1200,
      lastMaintenance: '2025-01-25'
    },
    {
      id: 'K-023',
      name: 'Car Wash Waiting Room',
      location: 'Automotive Service Center',
      host: 'Service Media',
      status: 'online',
      uptime: 96.9,
      dailyImpressions: 320,
      monthlyRevenue: 1100,
      lastMaintenance: '2024-12-03'
    },
    {
      id: 'K-024',
      name: 'Laundry Mat Entrance',
      location: 'Residential Services',
      host: 'Residential Media',
      status: 'online',
      uptime: 97.2,
      dailyImpressions: 280,
      monthlyRevenue: 900,
      lastMaintenance: '2024-11-28'
    },
    {
      id: 'K-025',
      name: 'Post Office Lobby',
      location: 'Government Services Center',
      host: 'Government Media',
      status: 'online',
      uptime: 98.4,
      dailyImpressions: 650,
      monthlyRevenue: 1900,
      lastMaintenance: '2024-12-16'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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

  const handleExportCSV = () => {
    addNotification('success', 'Export Successful', 'Kiosk data has been exported to CSV file');
  };

  const handleAddKiosk = () => {
    addNotification('info', 'Add Kiosk', 'Add kiosk functionality will be implemented soon');
  };

  const handleKioskSettings = (kioskId: string, kioskName: string) => {
    addNotification('info', 'Kiosk Settings', `Settings for ${kioskName} will be opened`);
  };

  const handleKioskLocation = (kioskId: string, kioskName: string) => {
    addNotification('info', 'Kiosk Location', `Location details for ${kioskName} will be displayed`);
  };

  const filteredKiosks = kiosks.filter(kiosk => {
    const matchesSearch = kiosk.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         kiosk.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         kiosk.host.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || kiosk.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kiosk Management</h1>
          <p className="text-gray-600 mt-2">Monitor and manage all kiosks across the network</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleExportCSV}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
          <button 
            onClick={handleAddKiosk}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Kiosk</span>
          </button>
        </div>
      </div>

      {/* Network Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Kiosks</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{kiosks.length}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Monitor className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Online</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{kiosks.filter(k => k.status === 'online').length}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Wifi className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Uptime</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {(kiosks.reduce((sum, k) => sum + k.uptime, 0) / kiosks.length).toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Settings className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                ${kiosks.reduce((sum, k) => sum + k.monthlyRevenue, 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <DollarSign className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search kiosks, locations, or hosts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Status</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Kiosks Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kiosk</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Host</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredKiosks.map((kiosk) => (
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
                  <td className="px-6 py-4 text-sm text-gray-900">{kiosk.host}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(kiosk.status)}`}>
                      {getStatusIcon(kiosk.status)}
                      <span className="ml-1 capitalize">{kiosk.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{kiosk.uptime}% uptime</div>
                    <div className="text-xs text-gray-500">{kiosk.dailyImpressions} daily impressions</div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    ${kiosk.monthlyRevenue.toLocaleString()}/mo
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleKioskSettings(kiosk.id, kiosk.name)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleKioskLocation(kiosk.id, kiosk.name)}
                        className="text-purple-600 hover:text-purple-800"
                      >
                        <MapPin className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}