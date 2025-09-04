import React, { useState } from 'react';
import { Ticket, Plus, Edit, Trash2, Copy, Search, BarChart3, Clock, DollarSign } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';

interface Coupon {
  id: string;
  code: string;
  description: string;
  type: 'percentage' | 'fixed' | 'free_placement';
  value: number;
  usageLimit: number;
  usedCount: number;
  expiryDate: string;
  status: 'active' | 'inactive' | 'expired';
  scopes: string[];
}

export default function CouponManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([
    {
      id: '1',
      code: 'SUMMER25',
      description: '25% off all campaigns',
      type: 'percentage',
      value: 25,
      usageLimit: 100,
      usedCount: 45,
      expiryDate: '2025-08-31',
      status: 'active',
      scopes: ['campaigns', 'marketplace']
    },
    {
      id: '2',
      code: 'FREEAD',
      description: 'Free ad placement for new clients',
      type: 'free_placement',
      value: 1,
      usageLimit: 50,
      usedCount: 12,
      expiryDate: '2025-12-31',
      status: 'active',
      scopes: ['campaigns']
    },
    {
      id: '3',
      code: 'SAVE100',
      description: '$100 off orders over $500',
      type: 'fixed',
      value: 100,
      usageLimit: 25,
      usedCount: 25,
      expiryDate: '2025-03-15',
      status: 'expired',
      scopes: ['marketplace']
    },
    {
      id: '4',
      code: 'WELCOME50',
      description: '50% off first campaign',
      type: 'percentage',
      value: 50,
      usageLimit: 200,
      usedCount: 89,
      expiryDate: '2025-06-30',
      status: 'active',
      scopes: ['campaigns']
    },
    {
      id: '5',
      code: 'BULK20',
      description: '20% off bulk orders',
      type: 'percentage',
      value: 20,
      usageLimit: 75,
      usedCount: 32,
      expiryDate: '2025-05-15',
      status: 'active',
      scopes: ['campaigns', 'marketplace']
    },
    {
      id: '6',
      code: 'FLASH150',
      description: '$150 off flash sales',
      type: 'fixed',
      value: 150,
      usageLimit: 30,
      usedCount: 30,
      expiryDate: '2025-02-28',
      status: 'expired',
      scopes: ['marketplace']
    },
    {
      id: '7',
      code: 'LOYALTY10',
      description: '10% off for loyal customers',
      type: 'percentage',
      value: 10,
      usageLimit: 500,
      usedCount: 234,
      expiryDate: '2025-12-31',
      status: 'active',
      scopes: ['campaigns']
    },
    {
      id: '8',
      code: 'NEWYEAR30',
      description: '30% off New Year campaigns',
      type: 'percentage',
      value: 30,
      usageLimit: 150,
      usedCount: 67,
      expiryDate: '2025-01-31',
      status: 'active',
      scopes: ['campaigns']
    },
    {
      id: '9',
      code: 'VIDEO200',
      description: '$200 off video campaigns',
      type: 'fixed',
      value: 200,
      usageLimit: 40,
      usedCount: 18,
      expiryDate: '2025-04-30',
      status: 'active',
      scopes: ['campaigns']
    },
    {
      id: '10',
      code: 'HOLIDAY40',
      description: '40% off holiday promotions',
      type: 'percentage',
      value: 40,
      usageLimit: 80,
      usedCount: 80,
      expiryDate: '2024-12-31',
      status: 'expired',
      scopes: ['campaigns', 'marketplace']
    },
    {
      id: '11',
      code: 'SPRING15',
      description: '15% off spring campaigns',
      type: 'percentage',
      value: 15,
      usageLimit: 120,
      usedCount: 45,
      expiryDate: '2025-05-31',
      status: 'active',
      scopes: ['campaigns']
    },
    {
      id: '12',
      code: 'FIRSTTIME75',
      description: '75% off first-time users',
      type: 'percentage',
      value: 75,
      usageLimit: 60,
      usedCount: 28,
      expiryDate: '2025-07-15',
      status: 'active',
      scopes: ['campaigns']
    },
    {
      id: '13',
      code: 'PREMIUM300',
      description: '$300 off premium packages',
      type: 'fixed',
      value: 300,
      usageLimit: 20,
      usedCount: 8,
      expiryDate: '2025-06-30',
      status: 'active',
      scopes: ['marketplace']
    },
    {
      id: '14',
      code: 'REFERRAL25',
      description: '25% off referral rewards',
      type: 'percentage',
      value: 25,
      usageLimit: 100,
      usedCount: 56,
      expiryDate: '2025-09-30',
      status: 'active',
      scopes: ['campaigns']
    },
    {
      id: '15',
      code: 'QUARTERLY50',
      description: '50% off quarterly subscriptions',
      type: 'percentage',
      value: 50,
      usageLimit: 40,
      usedCount: 22,
      expiryDate: '2025-03-31',
      status: 'active',
      scopes: ['campaigns']
    },
    {
      id: '16',
      code: 'STUDENT20',
      description: '20% off student discounts',
      type: 'percentage',
      value: 20,
      usageLimit: 200,
      usedCount: 134,
      expiryDate: '2025-08-31',
      status: 'active',
      scopes: ['campaigns']
    },
    {
      id: '17',
      code: 'SENIOR30',
      description: '30% off senior citizen discounts',
      type: 'percentage',
      value: 30,
      usageLimit: 80,
      usedCount: 41,
      expiryDate: '2025-10-31',
      status: 'active',
      scopes: ['campaigns']
    },
    {
      id: '18',
      code: 'MILITARY40',
      description: '40% off military discounts',
      type: 'percentage',
      value: 40,
      usageLimit: 60,
      usedCount: 23,
      expiryDate: '2025-11-30',
      status: 'active',
      scopes: ['campaigns']
    },
    {
      id: '19',
      code: 'BIRTHDAY25',
      description: '25% off birthday specials',
      type: 'percentage',
      value: 25,
      usageLimit: 150,
      usedCount: 78,
      expiryDate: '2025-12-31',
      status: 'active',
      scopes: ['campaigns', 'marketplace']
    },
    {
      id: '20',
      code: 'ANNIVERSARY35',
      description: '35% off anniversary celebrations',
      type: 'percentage',
      value: 35,
      usageLimit: 70,
      usedCount: 35,
      expiryDate: '2025-09-15',
      status: 'active',
      scopes: ['campaigns']
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { addNotification } = useNotification();

  const getStatusColor = (status: Coupon['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: Coupon['type']) => {
    switch (type) {
      case 'percentage': return 'bg-blue-100 text-blue-800';
      case 'fixed': return 'bg-purple-100 text-purple-800';
      case 'free_placement': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatValue = (coupon: Coupon) => {
    switch (coupon.type) {
      case 'percentage': return `${coupon.value}%`;
      case 'fixed': return `$${coupon.value}`;
      case 'free_placement': return `${coupon.value} free`;
      default: return coupon.value.toString();
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    addNotification('success', 'Copied!', `Coupon code ${code} copied to clipboard`);
  };

  const toggleStatus = (id: string) => {
    setCoupons(prev => prev.map(coupon => 
      coupon.id === id 
        ? { ...coupon, status: coupon.status === 'active' ? 'inactive' : 'active' }
        : coupon
    ));
    addNotification('success', 'Status Updated', 'Coupon status has been updated');
  };

  const handleEditCoupon = (couponId: string, couponCode: string) => {
    addNotification('info', 'Edit Coupon', `Edit functionality for ${couponCode} will be implemented soon`);
  };

  const handleDeleteCoupon = (couponId: string, couponCode: string) => {
    setCoupons(prev => prev.filter(coupon => coupon.id !== couponId));
    addNotification('success', 'Coupon Deleted', `Coupon ${couponCode} has been successfully deleted`);
  };

  const handleCreateCoupon = () => {
    addNotification('info', 'Create Coupon', 'Coupon creation functionality will be implemented soon');
    setShowCreateModal(false);
  };

  const handleSearch = (query: string) => {
    if (query.length > 0) {
      addNotification('info', 'Search Results', `Found ${filteredCoupons.length} coupons matching "${query}"`);
    }
  };

  const filteredCoupons = coupons.filter(coupon =>
    coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coupon.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Coupon Manager</h1>
          <p className="text-gray-600 mt-2">Create and manage promotional coupons and discounts</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Coupon Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Coupons</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{coupons.filter(c => c.status === 'active').length}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Ticket className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Uses</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{coupons.reduce((sum, c) => sum + c.usedCount, 0)}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">2</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Savings Generated</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">$12,400</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search coupons..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleSearch(e.target.value);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">All Coupons</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type & Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCoupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-mono font-medium text-gray-900">{coupon.code}</span>
                        <button
                          onClick={() => copyCode(coupon.code)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="text-sm text-gray-500">{coupon.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(coupon.type)}`}>
                      {formatValue(coupon)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{coupon.usedCount} / {coupon.usageLimit}</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-purple-500 h-2 rounded-full" 
                        style={{ width: `${(coupon.usedCount / coupon.usageLimit) * 100}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(coupon.expiryDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleStatus(coupon.id)}
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(coupon.status)}`}
                    >
                      {coupon.status}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleEditCoupon(coupon.id, coupon.code)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteCoupon(coupon.id, coupon.code)}
                        className="text-red-600 hover:text-red-800"
                      >
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

      {/* Create Coupon Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Coupon</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Coupon Code</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter coupon code"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Brief description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                    <option value="free_placement">Free Placement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Value</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateCoupon}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}