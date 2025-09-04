import React, { useState } from 'react';
import { Calendar, MapPin, Play, Pause, Edit, BarChart3 } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';

interface AdAssignment {
  id: string;
  adName: string;
  kioskName: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'scheduled' | 'paused';
  impressions: number;
}

export default function AdAssignment() {
  const { addNotification } = useNotification();
  const [assignments, setAssignments] = useState<AdAssignment[]>([
    {
      id: '1',
      adName: 'Summer Sale 2025',
      kioskName: 'Mall Entrance A',
      startDate: '2025-01-15',
      endDate: '2025-02-15',
      status: 'active',
      impressions: 12500
    },
    {
      id: '2',
      adName: 'Holiday Promotion',
      kioskName: 'Food Court Central',
      startDate: '2025-02-01',
      endDate: '2025-02-28',
      status: 'scheduled',
      impressions: 0
    },
    {
      id: '3',
      adName: 'Product Launch Video',
      kioskName: 'Train Station Display',
      startDate: '2025-01-10',
      endDate: '2025-01-31',
      status: 'paused',
      impressions: 8900
    },
    {
      id: '4',
      adName: 'Back to School Campaign',
      kioskName: 'University Campus Center',
      startDate: '2025-01-20',
      endDate: '2025-03-20',
      status: 'active',
      impressions: 18750
    },
    {
      id: '5',
      adName: 'Spring Collection Preview',
      kioskName: 'Fashion District Hub',
      startDate: '2025-02-15',
      endDate: '2025-04-15',
      status: 'scheduled',
      impressions: 0
    },
    {
      id: '6',
      adName: 'Tech Conference Promo',
      kioskName: 'Convention Center Lobby',
      startDate: '2025-01-05',
      endDate: '2025-01-25',
      status: 'paused',
      impressions: 15600
    },
    {
      id: '7',
      adName: 'Restaurant Week Special',
      kioskName: 'Downtown Food Court',
      startDate: '2025-01-25',
      endDate: '2025-02-08',
      status: 'active',
      impressions: 9200
    },
    {
      id: '8',
      adName: 'Fitness Center Membership',
      kioskName: 'Sports Complex Entrance',
      startDate: '2025-02-10',
      endDate: '2025-03-10',
      status: 'scheduled',
      impressions: 0
    },
    {
      id: '9',
      adName: 'Movie Theater Premiere',
      kioskName: 'Cinema Multiplex',
      startDate: '2025-01-12',
      endDate: '2025-01-26',
      status: 'active',
      impressions: 13400
    },
    {
      id: '10',
      adName: 'Car Dealership Event',
      kioskName: 'Auto Mall Display',
      startDate: '2025-02-20',
      endDate: '2025-03-20',
      status: 'scheduled',
      impressions: 0
    }
  ]);

  const getStatusColor = (status: AdAssignment['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleNewAssignment = () => {
    addNotification('info', 'New Assignment', 'New ad assignment functionality will be implemented soon');
  };

  const handlePauseAssignment = (assignmentId: string, adName: string) => {
    setAssignments(prev => prev.map(assignment => 
      assignment.id === assignmentId 
        ? { ...assignment, status: 'paused' as const }
        : assignment
    ));
    addNotification('warning', 'Assignment Paused', `Ad "${adName}" has been paused`);
  };

  const handlePlayAssignment = (assignmentId: string, adName: string) => {
    setAssignments(prev => prev.map(assignment => 
      assignment.id === assignmentId 
        ? { ...assignment, status: 'active' as const }
        : assignment
    ));
    addNotification('success', 'Assignment Activated', `Ad "${adName}" is now active`);
  };

  const handleEditAssignment = (assignmentId: string, adName: string) => {
    addNotification('info', 'Edit Assignment', `Edit functionality for "${adName}" will be implemented soon`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ad Assignment</h1>
          <p className="text-gray-600 mt-2">Assign and schedule ads to your kiosks</p>
        </div>
        <button 
          onClick={handleNewAssignment}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          New Assignment
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Assignments</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {assignments.filter(a => a.status === 'active').length}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Play className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {assignments.filter(a => a.status === 'scheduled').length}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Impressions</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {assignments.reduce((sum, a) => sum + a.impressions, 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Current Assignments</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kiosk</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impressions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assignments.map((assignment) => (
                <tr key={assignment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{assignment.adName}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{assignment.kioskName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(assignment.startDate).toLocaleDateString()} - {new Date(assignment.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(assignment.status)}`}>
                      {assignment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{assignment.impressions.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {assignment.status === 'active' ? (
                        <button 
                          onClick={() => handlePauseAssignment(assignment.id, assignment.adName)}
                          className="text-yellow-600 hover:text-yellow-800"
                        >
                          <Pause className="h-4 w-4" />
                        </button>
                      ) : assignment.status === 'paused' ? (
                        <button 
                          onClick={() => handlePlayAssignment(assignment.id, assignment.adName)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                      ) : null}
                      <button 
                        onClick={() => handleEditAssignment(assignment.id, assignment.adName)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="h-4 w-4" />
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