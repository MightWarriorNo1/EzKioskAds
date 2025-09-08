import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Monitor, DollarSign, MapPin, TrendingUp, Eye, Users, Upload, Calendar, AlertCircle } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { HostService, HostStats, HostNotification } from '../../services/hostService';
import MetricsCard from '../shared/MetricsCard';
import RecentActivity from '../shared/RecentActivity';
import QuickActions from '../shared/QuickActions';
import Card from '../ui/Card';
import Button from '../ui/Button';

export default function HostDashboard() {
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const { user } = useAuth();
  const [stats, setStats] = useState<HostStats | null>(null);
  const [notifications, setNotifications] = useState<HostNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const [statsData, notificationsData] = await Promise.all([
          HostService.getHostStats(user.id),
          HostService.getHostNotifications(user.id, true) // Only unread notifications
        ]);
        
        setStats(statsData);
        setNotifications(notificationsData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        addNotification('error', 'Error', 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.id, addNotification]);

  const metrics = stats ? [
    {
      title: 'Active Kiosks',
      value: stats.active_kiosks.toString(),
      change: `${stats.total_kiosks} total`,
      changeType: 'positive' as const,
      icon: Monitor,
      color: 'green' as const
    },
    {
      title: 'Monthly Revenue',
      value: `$${stats.monthly_revenue.toLocaleString()}`,
      change: 'This month',
      changeType: 'positive' as const,
      icon: DollarSign,
      color: 'blue' as const
    },
    {
      title: 'Total Impressions',
      value: stats.total_impressions.toLocaleString(),
      change: 'All time',
      changeType: 'positive' as const,
      icon: Eye,
      color: 'purple' as const
    },
    {
      title: 'Pending Ads',
      value: stats.pending_ads.toString(),
      change: 'Awaiting review',
      changeType: stats.pending_ads > 0 ? 'warning' as const : 'positive' as const,
      icon: Upload,
      color: stats.pending_ads > 0 ? 'orange' as const : 'green' as const
    }
  ] : [];

  const quickActions = [
    {
      title: 'Manage Kiosks',
      description: 'View and configure your kiosks',
      href: '/host/kiosks',
      icon: Monitor,
      color: 'green' as const
    },
    {
      title: 'Upload Ads',
      description: 'Upload new ads for review',
      href: '/host/ads/upload',
      icon: Upload,
      color: 'blue' as const
    },
    {
      title: 'Assign Ads',
      description: 'Schedule ads to specific kiosks',
      href: '/host/ads',
      icon: Calendar,
      color: 'purple' as const
    },
    {
      title: 'Revenue Dashboard',
      description: 'View detailed revenue analytics',
      href: '/host/revenue',
      icon: TrendingUp,
      color: 'orange' as const
    }
  ];

  const recentActivities = notifications.slice(0, 6).map(notification => ({
    action: notification.title,
    time: new Date(notification.created_at).toLocaleString(),
    type: notification.type === 'ad_approved' || notification.type === 'payout_processed' ? 'success' as const :
          notification.type === 'ad_rejected' || notification.type === 'kiosk_offline' ? 'warning' as const :
          'info' as const
  }));

  const handleMetricClick = (metricTitle: string) => {
    // Navigate to relevant page based on metric
    switch (metricTitle) {
      case 'Active Kiosks':
        navigate('/host/kiosks');
        break;
      case 'Monthly Revenue':
        navigate('/host/revenue');
        break;
      case 'Total Impressions':
        navigate('/host/revenue');
        break;
      case 'Pending Ads':
        navigate('/host/ads');
        break;
      default:
        addNotification('info', 'Metric Details', `Detailed view for ${metricTitle} will be displayed`);
    }
  };

  const handleQuickAction = (actionTitle: string) => {
    // Navigate to relevant page based on action
    switch (actionTitle) {
      case 'Manage Kiosks':
        navigate('/host/kiosks');
        break;
      case 'Upload Ads':
        navigate('/host/ads/upload');
        break;
      case 'Assign Ads':
        navigate('/host/ads');
        break;
      case 'Revenue Dashboard':
        navigate('/host/revenue');
        break;
      default:
        addNotification('info', 'Quick Action', `${actionTitle} functionality will be implemented soon`);
    }
  };

  const handleRecentActivityClick = (activity: string) => {
    // Navigate to relevant page based on activity type
    if (activity.includes('Kiosk')) {
      navigate('/host/kiosks');
    } else if (activity.includes('Ad') || activity.includes('assignment')) {
      navigate('/host/ads');
    } else if (activity.includes('payout') || activity.includes('revenue')) {
      navigate('/host/payouts');
    } else {
      addNotification('info', 'Activity Details', `Details for "${activity}" will be shown`);
    }
  };

  const handleChartInteraction = (chartType: string) => {
    // Navigate to revenue page for chart interactions
    navigate('/host/revenue');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Host Dashboard</h1>
          <p className="mt-2">Loading your dashboard...</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Host Dashboard</h1>
        <p className="mt-2">Monitor your kiosks and track revenue performance</p>
        {notifications.length > 0 && (
          <div className="mt-4 flex items-center gap-2 text-orange-600 dark:text-orange-400">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm font-medium">
              You have {notifications.length} unread notification{notifications.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div 
            key={index} 
            className="animate-fade-in-up cursor-pointer" 
            style={{ animationDelay: `${index * 60}ms` }}
            onClick={() => handleMetricClick(metric.title)}
          >
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
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => handleQuickAction(qa.title)}
                >
                  Open
                </Button>
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