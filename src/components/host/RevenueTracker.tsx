import React, { useState } from 'react';
import { DollarSign, TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';

export default function RevenueTracker() {
  const { addNotification } = useNotification();
  const [timeRange, setTimeRange] = useState('30d');

  const revenueMetrics = [
    {
      title: 'Today\'s Revenue',
      value: '$625',
      change: '+18% from yesterday',
      changeType: 'positive' as const,
      icon: DollarSign
    },
    {
      title: 'This Week',
      value: '$4,180',
      change: '+12% from last week',
      changeType: 'positive' as const,
      icon: TrendingUp
    },
    {
      title: 'This Month',
      value: '$18,750',
      change: '+22% from last month',
      changeType: 'positive' as const,
      icon: BarChart3
    },
    {
      title: 'Average Daily',
      value: '$625',
      change: '+18% from last period',
      changeType: 'positive' as const,
      icon: Calendar
    }
  ];

  const topKiosks = [
    { name: 'Airport Terminal A', revenue: 6850, growth: 25 },
    { name: 'Mall Entrance A', revenue: 4250, growth: 15 },
    { name: 'University Campus Center', revenue: 3890, growth: 18 },
    { name: 'Bus Terminal Display', revenue: 3650, growth: 12 },
    { name: 'Convention Center Lobby', revenue: 3200, growth: 8 },
    { name: 'Cinema Multiplex', revenue: 2950, growth: 22 },
    { name: 'Food Court Central', revenue: 2890, growth: 8 },
    { name: 'Hospital Main Lobby', revenue: 2450, growth: 15 }
  ];

  const handleTimeRangeChange = (newRange: string) => {
    setTimeRange(newRange);
    addNotification('info', 'Time Range Updated', `Revenue data updated for ${newRange}`);
  };

  const handleMetricClick = (metricTitle: string) => {
    addNotification('info', 'Metric Details', `Detailed revenue data for ${metricTitle} will be displayed`);
  };

  const handleKioskClick = (kioskName: string) => {
    addNotification('info', 'Kiosk Details', `Detailed revenue data for ${kioskName} will be shown`);
  };

  const handleChartInteraction = (chartType: string) => {
    addNotification('info', 'Chart Interaction', `${chartType} chart interaction functionality will be implemented soon`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Revenue Tracker</h1>
          <p className="text-gray-600 mt-2">Monitor your earnings and track performance</p>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-gray-400" />
          <select
            value={timeRange}
            onChange={(e) => handleTimeRangeChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {revenueMetrics.map((metric, index) => (
          <div 
            key={index} 
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleMetricClick(metric.title)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</p>
                <p className={`text-sm mt-1 ${metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.change}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <metric.icon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue Trends</h3>
        <div 
          className="h-64 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg flex items-center justify-center cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleChartInteraction('Revenue')}
        >
          <div className="text-center">
            <DollarSign className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-gray-600">Daily revenue chart</p>
            <p className="text-sm text-gray-500 mt-2">Track earnings over time with trend analysis</p>
          </div>
        </div>
      </div>

      {/* Top Performing Kiosks */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Top Performing Kiosks</h3>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {topKiosks.map((kiosk, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleKioskClick(kiosk.name)}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">
                    #{index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{kiosk.name}</p>
                    <p className="text-sm text-gray-500">${kiosk.revenue} revenue</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${kiosk.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {kiosk.growth >= 0 ? '+' : ''}{kiosk.growth}%
                  </p>
                  <p className="text-xs text-gray-500">vs last period</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}