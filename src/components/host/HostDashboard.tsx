import React from 'react';
import { Monitor, DollarSign, MapPin, TrendingUp, Eye, Users } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';
import MetricsCard from '../shared/MetricsCard';
import RecentActivity from '../shared/RecentActivity';
import QuickActions from '../shared/QuickActions';
import Card from '../ui/Card';
import Button from '../ui/Button';

export default function HostDashboard() {
  const { addNotification } = useNotification();

  const metrics = [
    {
      title: 'Active Kiosks',
      value: '15',
      change: '+3 this month',
      changeType: 'positive' as const,
      icon: Monitor,
      color: 'green' as const
    },
    {
      title: 'Monthly Revenue',
      value: '$18,750',
      change: '+22% from last month',
      changeType: 'positive' as const,
      icon: DollarSign,
      color: 'blue' as const
    },
    {
      title: 'Total Impressions',
      value: '1.2M',
      change: '+18% from last month',
      changeType: 'positive' as const,
      icon: Eye,
      color: 'purple' as const
    },
    {
      title: 'Avg. Uptime',
      value: '97.8%',
      change: '+1.2% from last month',
      changeType: 'positive' as const,
      icon: TrendingUp,
      color: 'orange' as const
    }
  ];

  const quickActions = [
    {
      title: 'Manage Kiosks',
      description: 'View and configure your kiosks',
      href: '/host/kiosks',
      icon: Monitor,
      color: 'green' as const
    },
    {
      title: 'Assign Ads',
      description: 'Schedule ads to specific kiosks',
      href: '/host/ads',
      icon: MapPin,
      color: 'blue' as const
    }
  ];

  const recentActivities = [
    { action: 'Kiosk K-011 (Airport Terminal A) came online', time: '30 seconds ago', type: 'success' as const },
    { action: 'Ad assignment updated for University Campus Center', time: '2 hours ago', type: 'info' as const },
    { action: 'Weekly payout of $3,250 processed', time: '1 day ago', type: 'success' as const },
    { action: 'New ad campaign assigned to 12 kiosks', time: '2 days ago', type: 'info' as const },
    { action: 'Kiosk K-005 (Fashion District Hub) entered maintenance', time: '3 days ago', type: 'warning' as const },
    { action: 'Monthly revenue target exceeded by 15%', time: '1 week ago', type: 'success' as const }
  ];

  const handleMetricClick = (metricTitle: string) => {
    addNotification('info', 'Metric Details', `Detailed view for ${metricTitle} will be displayed`);
  };

  const handleQuickAction = (actionTitle: string) => {
    addNotification('info', 'Quick Action', `${actionTitle} functionality will be implemented soon`);
  };

  const handleRecentActivityClick = (activity: string) => {
    addNotification('info', 'Activity Details', `Details for "${activity}" will be shown`);
  };

  const handleChartInteraction = (chartType: string) => {
    addNotification('info', 'Chart Interaction', `${chartType} chart interaction functionality will be implemented soon`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Host Dashboard</h1>
        <p className="mt-2">Monitor your kiosks and track revenue performance</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className="animate-fade-in-up" style={{ animationDelay: `${index * 60}ms` }}>
            <MetricsCard {...metric} />
          </div>
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 animate-fade-in-up" title="Quick Actions" subtitle="Common host tasks">
          <div className="space-y-3">
            {quickActions.map((qa) => (
              <div key={qa.title} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <qa.icon className="w-5 h-5 text-primary-600" />
                  <div>
                    <div className="font-medium">{qa.title}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{qa.description}</div>
                  </div>
                </div>
                <Button variant="secondary" size="sm">Open</Button>
              </div>
            ))}
          </div>
        </Card>
        <Card className="lg:col-span-2 animate-fade-in-up" title="Recent Activity" subtitle="Latest updates across your kiosks">
          <RecentActivity activities={recentActivities} />
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="animate-fade-in-up" title="Revenue Trends">
        <div 
          className="h-64 bg-gradient-to-br from-success-50 to-primary-50 dark:from-gray-800 dark:to-gray-800 rounded-lg flex items-center justify-center cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleChartInteraction('Revenue')}
        >
          <div className="text-center">
            <DollarSign className="h-12 w-12 text-success-600 mx-auto mb-4" />
            <p>Revenue tracking chart</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Daily, weekly, and monthly earnings breakdown</p>
          </div>
        </div>
      </Card>

      {/* Kiosk Status Map */}
      <Card className="animate-fade-in-up" title="Kiosk Locations">
        <div 
          className="h-64 bg-gradient-to-br from-primary-50 to-success-50 dark:from-gray-800 dark:to-gray-800 rounded-lg flex items-center justify-center cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleChartInteraction('Kiosk Map')}
        >
          <div className="text-center">
            <MapPin className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <p>Interactive map interface</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Real-time kiosk status and performance data</p>
          </div>
        </div>
      </Card>
    </div>
  );
}