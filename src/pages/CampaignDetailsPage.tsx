import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, DollarSign, Activity, Eye, MousePointer, Play, Pause, Edit, Trash2 } from 'lucide-react';
import DashboardLayout from '../components/layouts/DashboardLayout';
import { CampaignService, Campaign } from '../services/campaignService';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

export default function CampaignDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addNotification } = useNotification();
  
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (id && user) {
      loadCampaignDetails();
    }
  }, [id, user]);

  const loadCampaignDetails = async () => {
    if (!id || !user) return;
    
    try {
      setLoading(true);
      const campaigns = await CampaignService.getUserCampaigns(user.id);
      const foundCampaign = campaigns.find(c => c.id === id);
      
      if (foundCampaign) {
        setCampaign(foundCampaign);
      } else {
        addNotification('error', 'Campaign Not Found', 'The requested campaign could not be found.');
        navigate('/client/campaigns');
      }
    } catch (error) {
      console.error('Error loading campaign details:', error);
      addNotification('error', 'Error', 'Failed to load campaign details.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!campaign) return;
    
    setActionLoading(newStatus);
    try {
      // This would call a campaign update service
      addNotification('success', 'Campaign Updated', `Campaign ${newStatus === 'paused' ? 'paused' : 'resumed'} successfully.`);
      setCampaign({ ...campaign, status: newStatus as Campaign['status'] });
    } catch (error) {
      addNotification('error', 'Error', 'Failed to update campaign status.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEdit = () => {
    addNotification('info', 'Coming Soon', 'Campaign editing feature is coming soon.');
  };

  const handleDelete = () => {
    if (!campaign) return;
    
    if (window.confirm(`Are you sure you want to delete "${campaign.name}"? This action cannot be undone.`)) {
      addNotification('info', 'Coming Soon', 'Campaign deletion feature is coming soon.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'paused': return 'bg-gray-500';
      case 'completed': return 'bg-blue-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return (
      <DashboardLayout title="Campaign Details" subtitle="">
        <div className="animate-pulse">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!campaign) {
    return (
      <DashboardLayout title="Campaign Details" subtitle="">
        <div className="text-center py-12">
          <div className="text-gray-500">Campaign not found.</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Campaign Details" subtitle="">
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/client/campaigns')}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Campaigns
        </button>
      </div>

      {/* Campaign Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {campaign.name}
            </h1>
            <p className="text-gray-600">
              {campaign.description || 'No description provided'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`${getStatusColor(campaign.status)} text-white text-sm px-3 py-1 rounded-full`}>
              {getStatusText(campaign.status)}
            </span>
            
            {/* Action Buttons */}
            <div className="flex space-x-2">
              {campaign.status === 'active' && (
                <button
                  onClick={() => handleStatusChange('paused')}
                  disabled={actionLoading === 'paused'}
                  className="p-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded-lg transition-colors"
                  title="Pause Campaign"
                >
                  <Pause className="h-5 w-5" />
                </button>
              )}
              
              {campaign.status === 'paused' && (
                <button
                  onClick={() => handleStatusChange('active')}
                  disabled={actionLoading === 'active'}
                  className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                  title="Resume Campaign"
                >
                  <Play className="h-5 w-5" />
                </button>
              )}
              
              <button
                onClick={handleEdit}
                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit Campaign"
              >
                <Edit className="h-5 w-5" />
              </button>
              
              <button
                onClick={handleDelete}
                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete Campaign"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Duration</p>
              <p className="text-lg font-semibold text-gray-900">
                {Math.ceil((new Date(campaign.end_date).getTime() - new Date(campaign.start_date).getTime()) / (1000 * 60 * 60 * 24))} days
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <MapPin className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Kiosks</p>
              <p className="text-lg font-semibold text-gray-900">{campaign.kiosk_count}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Cost</p>
              <p className="text-lg font-semibold text-gray-900">{formatCurrency(campaign.total_cost)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Activity className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Ad Duration</p>
              <p className="text-lg font-semibold text-gray-900">{campaign.total_slots * 15}s</p>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Details */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Campaign Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Information</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Start Date</label>
              <p className="text-gray-900">{formatDate(campaign.start_date)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">End Date</label>
              <p className="text-gray-900">{formatDate(campaign.end_date)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Budget</label>
              <p className="text-gray-900">{formatCurrency(campaign.budget)}</p>
            </div>
            {campaign.daily_budget && (
              <div>
                <label className="text-sm font-medium text-gray-700">Daily Budget</label>
                <p className="text-gray-900">{formatCurrency(campaign.daily_budget)}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-700">Target Locations</label>
              <p className="text-gray-900">
                {campaign.target_locations?.join(', ') || 'Not specified'}
              </p>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Eye className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-700">Impressions</span>
              </div>
              <span className="font-semibold text-gray-900">
                {campaign.impressions?.toLocaleString() || '0'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MousePointer className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-700">Clicks</span>
              </div>
              <span className="font-semibold text-gray-900">
                {campaign.clicks?.toLocaleString() || '0'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-700">Spent</span>
              </div>
              <span className="font-semibold text-gray-900">
                {formatCurrency(campaign.total_spent || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Activity className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-700">CTR</span>
              </div>
              <span className="font-semibold text-gray-900">
                {campaign.impressions && campaign.clicks 
                  ? `${((campaign.clicks / campaign.impressions) * 100).toFixed(2)}%`
                  : '0.00%'
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
