import React, { useState } from 'react';
import { CreditCard, Calendar, Download, TrendingUp, Clock } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';

interface Payout {
  id: string;
  date: string;
  amount: number;
  status: 'completed' | 'pending' | 'processing';
  method: string;
  transactionId: string;
}

export default function PayoutHistory() {
  const { addNotification } = useNotification();
  const [payouts] = useState<Payout[]>([
    {
      id: '1',
      date: '2025-01-15',
      amount: 3250.00,
      status: 'completed',
      method: 'Bank Transfer',
      transactionId: 'TXN-2025-001'
    },
    {
      id: '2',
      date: '2025-01-08',
      amount: 2890.50,
      status: 'completed',
      method: 'Bank Transfer',
      transactionId: 'TXN-2025-002'
    },
    {
      id: '3',
      date: '2025-01-01',
      amount: 3100.75,
      status: 'processing',
      method: 'Bank Transfer',
      transactionId: 'TXN-2025-003'
    },
    {
      id: '4',
      date: '2024-12-25',
      amount: 2750.25,
      status: 'completed',
      method: 'Bank Transfer',
      transactionId: 'TXN-2024-012'
    },
    {
      id: '5',
      date: '2024-12-18',
      amount: 2980.00,
      status: 'completed',
      method: 'Bank Transfer',
      transactionId: 'TXN-2024-011'
    },
    {
      id: '6',
      date: '2024-12-11',
      amount: 2650.50,
      status: 'completed',
      method: 'Bank Transfer',
      transactionId: 'TXN-2024-010'
    },
    {
      id: '7',
      date: '2024-12-04',
      amount: 3120.75,
      status: 'completed',
      method: 'Bank Transfer',
      transactionId: 'TXN-2024-009'
    },
    {
      id: '8',
      date: '2024-11-27',
      amount: 2840.25,
      status: 'completed',
      method: 'Bank Transfer',
      transactionId: 'TXN-2024-008'
    }
  ]);

  const getStatusColor = (status: Payout['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownloadReceipt = (payoutId: string, transactionId: string, amount: number) => {
    addNotification('success', 'Receipt Downloaded', `Receipt for ${transactionId} ($${amount}) has been downloaded`);
  };

  const handlePayoutClick = (payoutId: string, transactionId: string, amount: number) => {
    addNotification('info', 'Payout Details', `Detailed information for ${transactionId} ($${amount}) will be displayed`);
  };

  const handleSettingsChange = (settingType: string, newValue: string) => {
    addNotification('success', 'Settings Updated', `${settingType} has been updated to ${newValue}`);
  };

  const handleSummaryClick = (summaryType: string, value: string) => {
    addNotification('info', 'Summary Details', `Detailed breakdown for ${summaryType}: ${value} will be shown`);
  };

  const totalEarnings = payouts.filter(p => p.status === 'completed').reduce((sum, payout) => sum + payout.amount, 0);
  const pendingAmount = payouts.filter(p => p.status === 'pending').reduce((sum, payout) => sum + payout.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Payout History</h1>
        <p className="text-gray-600 mt-2">Track your earnings and payment history</p>
      </div>

      {/* Payout Summary */}
      <div className="grid md:grid-cols-4 gap-6">
        <div 
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleSummaryClick('Total Earnings', `$${totalEarnings.toLocaleString()}`)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">${totalEarnings.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div 
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleSummaryClick('Pending Payouts', `$${pendingAmount.toLocaleString()}`)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Payouts</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">${pendingAmount.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div 
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleSummaryClick('This Month', '$4,041')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">$4,041</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div 
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleSummaryClick('Next Payout', 'Jan 22')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Next Payout</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">Jan 22</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <CreditCard className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Payout Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payout Settings</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payout Frequency</label>
            <select 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              onChange={(e) => handleSettingsChange('Payout Frequency', e.target.value)}
            >
              <option>Weekly (Fridays)</option>
              <option>Bi-weekly</option>
              <option>Monthly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Payout</label>
            <select 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              onChange={(e) => handleSettingsChange('Minimum Payout', e.target.value)}
            >
              <option>$100</option>
              <option>$250</option>
              <option>$500</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payout History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Payouts</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payouts.map((payout) => (
                <tr 
                  key={payout.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handlePayoutClick(payout.id, payout.transactionId, payout.amount)}
                >
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(payout.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    ${payout.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{payout.method}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payout.status)}`}>
                      {payout.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-600">{payout.transactionId}</td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadReceipt(payout.id, payout.transactionId, payout.amount);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Download className="h-4 w-4" />
                    </button>
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