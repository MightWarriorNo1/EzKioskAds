import React, { useState } from 'react';
import { Users, Search, Filter, Edit, Trash2, Plus, Mail, Shield } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'host' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  joinDate: string;
  lastLogin: string;
  totalSpent?: number;
  totalEarned?: number;
}

export default function UserManagement() {
  const [users] = useState<User[]>([
    {
      id: '1',
      name: 'John Client',
      email: 'john@techcorp.com',
      role: 'client',
      status: 'active',
      joinDate: '2024-06-15',
      lastLogin: '2025-01-20',
      totalSpent: 15600
    },
    {
      id: '2',
      name: 'Sarah Host',
      email: 'sarah@hostnetwork.com',
      role: 'host',
      status: 'active',
      joinDate: '2024-03-22',
      lastLogin: '2025-01-20',
      totalEarned: 28500
    },
    {
      id: '3',
      name: 'Mike Admin',
      email: 'mike@adflow.com',
      role: 'admin',
      status: 'active',
      joinDate: '2024-01-10',
      lastLogin: '2025-01-20'
    },
    {
      id: '4',
      name: 'Emily Designer',
      email: 'emily@fashionforward.com',
      role: 'client',
      status: 'active',
      joinDate: '2024-08-20',
      lastLogin: '2025-01-19',
      totalSpent: 8900
    },
    {
      id: '5',
      name: 'David Campus',
      email: 'david@campusmedia.com',
      role: 'host',
      status: 'active',
      joinDate: '2024-05-12',
      lastLogin: '2025-01-18',
      totalEarned: 18900
    },
    {
      id: '6',
      name: 'Lisa Retail',
      email: 'lisa@retailmax.com',
      role: 'client',
      status: 'active',
      joinDate: '2024-09-05',
      lastLogin: '2025-01-17',
      totalSpent: 12400
    },
    {
      id: '7',
      name: 'Tom Urban',
      email: 'tom@urbandisplays.com',
      role: 'host',
      status: 'active',
      joinDate: '2024-04-18',
      lastLogin: '2025-01-16',
      totalEarned: 22100
    },
    {
      id: '8',
      name: 'Anna Event',
      email: 'anna@eventmedia.com',
      role: 'host',
      status: 'active',
      joinDate: '2024-07-03',
      lastLogin: '2025-01-15',
      totalEarned: 15600
    },
    {
      id: '9',
      name: 'Chris City',
      email: 'chris@citydisplays.com',
      role: 'host',
      status: 'active',
      joinDate: '2024-06-28',
      lastLogin: '2025-01-14',
      totalEarned: 18200
    },
    {
      id: '10',
      name: 'Maria Sports',
      email: 'maria@sportsmedia.com',
      role: 'host',
      status: 'active',
      joinDate: '2024-05-15',
      lastLogin: '2025-01-13',
      totalEarned: 13400
    },
    {
      id: '11',
      name: 'James Entertainment',
      email: 'james@entertainmentmedia.com',
      role: 'host',
      status: 'active',
      joinDate: '2024-08-10',
      lastLogin: '2025-01-12',
      totalEarned: 16800
    },
    {
      id: '12',
      name: 'Rachel Auto',
      email: 'rachel@automedia.com',
      role: 'host',
      status: 'inactive',
      joinDate: '2024-03-05',
      lastLogin: '2024-12-15',
      totalEarned: 8900
    },
    {
      id: '13',
      name: 'Kevin Travel',
      email: 'kevin@travelmedia.com',
      role: 'host',
      status: 'active',
      joinDate: '2024-09-22',
      lastLogin: '2025-01-11',
      totalEarned: 24500
    },
    {
      id: '14',
      name: 'Samantha Health',
      email: 'samantha@healthmedia.com',
      role: 'host',
      status: 'active',
      joinDate: '2024-07-18',
      lastLogin: '2025-01-10',
      totalEarned: 11200
    },
    {
      id: '15',
      name: 'Alex Public',
      email: 'alex@publicmedia.com',
      role: 'host',
      status: 'suspended',
      joinDate: '2024-04-30',
      lastLogin: '2024-12-20',
      totalEarned: 7600
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const getRoleColor = (role: User['role']) => {
    switch (role) {
      case 'client': return 'bg-blue-100 text-blue-800';
      case 'host': return 'bg-green-100 text-green-800';
      case 'admin': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage clients, hosts, and administrators</p>
        </div>
        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add User</span>
        </button>
      </div>

      {/* User Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{users.length}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Clients</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{users.filter(u => u.role === 'client').length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Hosts</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{users.filter(u => u.role === 'host').length}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Today</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{users.filter(u => u.status === 'active').length}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <Shield className="h-6 w-6 text-emerald-600" />
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
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Roles</option>
              <option value="client">Clients</option>
              <option value="host">Hosts</option>
              <option value="admin">Admins</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      Joined: {new Date(user.joinDate).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      Last login: {new Date(user.lastLogin).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {user.totalSpent && `$${user.totalSpent.toLocaleString()} spent`}
                    {user.totalEarned && `$${user.totalEarned.toLocaleString()} earned`}
                    {!user.totalSpent && !user.totalEarned && '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-800">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-purple-600 hover:text-purple-800">
                        <Mail className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-800">
                        <Trash2 className="h-4 w-4" />
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