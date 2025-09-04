import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layouts/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { AnalyticsService } from '../services/analyticsService';
import { CampaignService } from '../services/campaignService';
import { useNotification } from '../contexts/NotificationContext';

interface AnalyticsData {
  totalImpressions: number;
  totalEngagements: number;
  engagementRate: number;
  topKiosks: Array<{
    location: string;
    impressions: number;
    clicks: number;
    ctr: number;
  }>;
  campaignPerformance: Array<{
    campaignId: string;
    campaignName: string;
    impressions: number;
    clicks: number;
    ctr: number;
  }>;
  dailyPerformance: Array<{
    period: string;
    impressions: number;
    clicks: number;
    plays: number;
    completions: number;
  }>;
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const [dateRange, setDateRange] = useState('30 Days');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dateRanges = ['7 Days', '30 Days', '90 Days'];

  // Helper function to format numbers
  const formatNumber = (num: number | undefined): string => {
    if (num === undefined || num === null) return '0';
    return num.toLocaleString();
  };

  // Helper function to format percentages
  const formatPercentage = (num: number | undefined): string => {
    if (num === undefined || num === null) return '0.00';
    return num.toFixed(2);
  };

  // Calculate date range
  const getDateRange = (range: string) => {
    const now = new Date();
    const days = range === '7 Days' ? 7 : range === '30 Days' ? 30 : 90;
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return {
      startDate: startDate.toISOString(),
      endDate: now.toISOString()
    };
  };

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Get user's campaigns
      const campaigns = await CampaignService.getUserCampaigns(user.id);
      
      if (campaigns.length === 0) {
        setAnalyticsData({
          totalImpressions: 0,
          totalEngagements: 0,
          engagementRate: 0,
          topKiosks: [],
          campaignPerformance: [],
          dailyPerformance: []
        });
        return;
      }

      const { startDate, endDate } = getDateRange(dateRange);
      
      // Fetch analytics for all campaigns
      const campaignAnalytics = await Promise.all(
        campaigns.map(async (campaign) => {
          try {
            const analytics = await AnalyticsService.getCampaignAnalytics(
              campaign.id,
              startDate,
              endDate
            );
            return {
              campaignId: campaign.id,
              campaignName: campaign.name,
              ...analytics
            };
          } catch (error) {
            console.error(`Error fetching analytics for campaign ${campaign.id}:`, error);
            return {
              campaignId: campaign.id,
              campaignName: campaign.name,
              impressions: 0,
              clicks: 0,
              plays: 0,
              completions: 0,
              ctr: 0,
              playRate: 0,
              completionRate: 0,
              totalEvents: 0
            };
          }
        })
      );

      // Calculate totals
      const totalImpressions = campaignAnalytics.reduce((sum, campaign) => sum + campaign.impressions, 0);
      const totalEngagements = campaignAnalytics.reduce((sum, campaign) => sum + campaign.clicks, 0);
      const engagementRate = totalImpressions > 0 ? (totalEngagements / totalImpressions) * 100 : 0;

      // Get location analytics for top kiosks
      const locationAnalytics = await Promise.all(
        campaigns.map(async (campaign) => {
          try {
            return await AnalyticsService.getLocationAnalytics(campaign.id, startDate, endDate);
          } catch (error) {
            console.error(`Error fetching location analytics for campaign ${campaign.id}:`, error);
            return [];
          }
        })
      );

      // Flatten and aggregate location data
      const allLocations = locationAnalytics.flat();
      const locationMap = new Map<string, { impressions: number; clicks: number; ctr: number }>();
      
      allLocations.forEach(location => {
        const existing = locationMap.get(location.location) || { impressions: 0, clicks: 0, ctr: 0 };
        existing.impressions += location.impressions;
        existing.clicks += location.clicks;
        existing.ctr = existing.impressions > 0 ? (existing.clicks / existing.impressions) * 100 : 0;
        locationMap.set(location.location, existing);
      });

      const topKiosks = Array.from(locationMap.entries())
        .map(([location, data]) => ({ location, ...data }))
        .sort((a, b) => b.impressions - a.impressions)
        .slice(0, 5);

      // Get daily performance data
      const dailyPerformance = await Promise.all(
        campaigns.map(async (campaign) => {
          try {
            return await AnalyticsService.getAnalyticsByTimePeriod(campaign.id, 'daily', 30);
          } catch (error) {
            console.error(`Error fetching daily performance for campaign ${campaign.id}:`, error);
            return [];
          }
        })
      );

      // Aggregate daily performance data
      const dailyMap = new Map<string, { impressions: number; clicks: number; plays: number; completions: number }>();
      
      dailyPerformance.flat().forEach(day => {
        const existing = dailyMap.get(day.period) || { impressions: 0, clicks: 0, plays: 0, completions: 0 };
        existing.impressions += day.impressions;
        existing.clicks += day.clicks;
        existing.plays += day.plays;
        existing.completions += day.completions;
        dailyMap.set(day.period, existing);
      });

      const aggregatedDailyPerformance = Array.from(dailyMap.entries())
        .map(([period, data]) => ({ period, ...data }))
        .sort((a, b) => new Date(a.period).getTime() - new Date(b.period).getTime());

      setAnalyticsData({
        totalImpressions,
        totalEngagements,
        engagementRate,
        topKiosks,
        campaignPerformance: campaignAnalytics.map(campaign => ({
          campaignId: campaign.campaignId,
          campaignName: campaign.campaignName,
          impressions: campaign.impressions,
          clicks: campaign.clicks,
          ctr: campaign.ctr
        })),
        dailyPerformance: aggregatedDailyPerformance
      });

    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setError('Failed to load analytics data. Please try again.');
      addNotification('error', 'Analytics Error', 'Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount and when date range changes
  useEffect(() => {
    fetchAnalyticsData();
  }, [user, dateRange]);

  // Handle date range change
  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
  };

  if (loading) {
    return (
      <DashboardLayout
        title="Analytics"
        subtitle="Performance metrics and insights for your campaigns"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout
        title="Analytics"
        subtitle="Performance metrics and insights for your campaigns"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={fetchAnalyticsData}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Analytics"
      subtitle="Performance metrics and insights for your campaigns"
    >
      {/* Date Range Selector */}
      <div className="flex justify-end mb-8">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {dateRanges.map((range) => (
            <button
              key={range}
              onClick={() => handleDateRangeChange(range)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                dateRange === range
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Impressions</h3>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {formatNumber(analyticsData?.totalImpressions)}
          </div>
          <p className="text-gray-600 text-sm">People who viewed your ads</p>
          <div className="w-full h-16 bg-gray-100 rounded mt-4"></div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Engagements</h3>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {formatNumber(analyticsData?.totalEngagements)}
          </div>
          <p className="text-gray-600 text-sm">Interactions with your ads</p>
          <div className="w-full h-16 bg-gray-100 rounded mt-4"></div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Engagement Rate</h3>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {formatPercentage(analyticsData?.engagementRate)}%
          </div>
          <p className="text-gray-600 text-sm">Percentage of impressions that resulted in engagement</p>
          <div className="w-full h-16 bg-gray-100 rounded mt-4"></div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Top Performing Kiosks */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Performing Kiosks</h3>
          <div className="space-y-4">
            {analyticsData?.topKiosks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No kiosk data available for the selected period.</p>
              </div>
            ) : (
              analyticsData?.topKiosks.map((kiosk) => {
                const maxImpressions = Math.max(...(analyticsData?.topKiosks.map(k => k.impressions) || [1]));
                const maxClicks = Math.max(...(analyticsData?.topKiosks.map(k => k.clicks) || [1]));
                const impressionWidth = (kiosk.impressions / maxImpressions) * 100;
                const clickWidth = (kiosk.clicks / maxClicks) * 100;
                
                return (
                  <div key={kiosk.location} className="flex items-center space-x-4">
                    <div className="w-20 text-sm text-gray-600 truncate" title={kiosk.location}>
                      {kiosk.location}
                    </div>
                <div className="flex-1">
                  <div className="flex space-x-2">
                        <div 
                          className="h-6 bg-blue-200 rounded" 
                          style={{ width: `${impressionWidth}%` }}
                        ></div>
                        <div 
                          className="h-6 bg-green-200 rounded" 
                          style={{ width: `${clickWidth}%` }}
                        ></div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                      {formatNumber(kiosk.impressions)} / {formatNumber(kiosk.clicks)}
                </div>
              </div>
                );
              })
            )}
          </div>
          <div className="flex items-center space-x-4 mt-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-200 rounded"></div>
              <span>Impressions</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-200 rounded"></div>
              <span>Engagements</span>
            </div>
          </div>
        </div>

        {/* Campaign Performance */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Campaign Performance</h3>
          <div className="space-y-4">
            {analyticsData?.campaignPerformance.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No campaign data available for the selected period.</p>
              </div>
            ) : (
              analyticsData?.campaignPerformance.map((campaign) => {
                const maxImpressions = Math.max(...(analyticsData?.campaignPerformance.map(c => c.impressions) || [1]));
                const maxClicks = Math.max(...(analyticsData?.campaignPerformance.map(c => c.clicks) || [1]));
                const impressionWidth = (campaign.impressions / maxImpressions) * 100;
                const clickWidth = (campaign.clicks / maxClicks) * 100;
                
                return (
                  <div key={campaign.campaignId} className="flex items-center space-x-4">
                    <div className="w-24 text-sm text-gray-600 truncate" title={campaign.campaignName}>
                      {campaign.campaignName}
                    </div>
                <div className="flex-1">
                  <div className="flex space-x-2">
                        <div 
                          className="h-6 bg-blue-200 rounded" 
                          style={{ width: `${impressionWidth}%` }}
                        ></div>
                        <div 
                          className="h-6 bg-green-200 rounded" 
                          style={{ width: `${clickWidth}%` }}
                        ></div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                      {formatNumber(campaign.impressions)} / {formatNumber(campaign.clicks)}
                </div>
              </div>
                );
              })
            )}
          </div>
          <div className="flex items-center space-x-4 mt-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-200 rounded"></div>
              <span>Impressions</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-200 rounded"></div>
              <span>Engagements</span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Performance */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Daily Performance</h3>
        <div className="relative">
          {analyticsData?.dailyPerformance.length === 0 ? (
          <div className="w-full h-48 bg-gray-100 rounded flex items-center justify-center">
            <div className="text-center">
                <div className="text-2xl font-bold text-gray-400 mb-2">No Data Available</div>
                <p className="text-gray-500">No daily performance data available for the selected period.</p>
              </div>
            </div>
          ) : (
            <div className="w-full h-48 bg-gray-100 rounded flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-400 mb-2">Chart Coming Soon</div>
                <p className="text-gray-500">Daily performance chart visualization will be available soon.</p>
                <div className="mt-4 text-sm text-gray-600">
                  <p>Data points available: {analyticsData?.dailyPerformance.length || 0} days</p>
                </div>
            </div>
          </div>
          )}
        </div>
      </div>

      {/* Audience Demographics */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Audience Demographics</h3>
          <div className="w-48 h-48 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-2xl font-bold">Pie Chart</div>
              <div className="text-sm">Age Distribution</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Key Insights</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Primary Audience</h4>
              <p className="text-gray-600 text-sm">Your ads are resonating most with the 25-34 age group, which makes up 35% of your audience.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Engagement by Age</h4>
              <p className="text-gray-600 text-sm">The 18-24 age group has the highest engagement rate at 15%, followed by the 25-34 age group at 12%.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Recommendation</h4>
              <p className="text-gray-600 text-sm">Consider creating targeted campaigns for the 25-34 age group to maximize ROI, while also developing content that appeals to the highly engaged 18-24 demographic.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Analytics */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Campaign Analytics</h3>
          <button className="text-gray-600 hover:text-gray-900 underline">View All Campaigns</button>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {analyticsData?.campaignPerformance.length === 0 ? (
            <div className="md:col-span-2 text-center py-8 text-gray-500">
              <p>No campaign analytics available for the selected period.</p>
            </div>
          ) : (
            analyticsData?.campaignPerformance.slice(0, 2).map((campaign) => (
              <div key={campaign.campaignId} className="bg-white rounded-lg border border-gray-200 p-6">
                <h4 className="font-semibold text-gray-900 mb-4">{campaign.campaignName}</h4>
            <div className="space-y-2 text-sm text-gray-600">
                  <div>Impressions: {formatNumber(campaign.impressions)}</div>
                  <div>Engagements: {formatNumber(campaign.clicks)}</div>
                  <div>Engagement Rate: {formatPercentage(campaign.ctr)}%</div>
            </div>
            <button 
              onClick={() => navigate(`/client/campaigns/${campaign.campaignId}`)}
              className="mt-4 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
            >
              View Details
            </button>
          </div>
            ))
          )}
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Insights</h3>
        <div className="space-y-4">
          {analyticsData?.campaignPerformance.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No performance insights available. Create campaigns to see analytics data.</p>
            </div>
          ) : (
            <>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Top Performing Campaign</h4>
                <p className="text-gray-600">
                  {analyticsData?.campaignPerformance && analyticsData.campaignPerformance.length > 0 ? (
                    <>
                      {analyticsData.campaignPerformance[0].campaignName} is your best performing campaign with an engagement rate of {formatPercentage(analyticsData.campaignPerformance[0].ctr)}%. 
                      Consider extending this campaign or creating similar ones.
                    </>
                  ) : (
                    'No campaign data available for insights.'
                  )}
                </p>
          </div>
          <div>
                <h4 className="font-medium text-gray-900 mb-2">Overall Performance</h4>
                <p className="text-gray-600">
                  Your campaigns have generated {formatNumber(analyticsData?.totalImpressions)} total impressions with an overall engagement rate of {formatPercentage(analyticsData?.engagementRate)}%.
                  {analyticsData?.topKiosks && analyticsData.topKiosks.length > 0 && ` Your top performing location is ${analyticsData.topKiosks[0].location} with ${formatNumber(analyticsData.topKiosks[0].impressions)} impressions.`}
                </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Optimization Opportunities</h4>
                <p className="text-gray-600">
                  {analyticsData?.topKiosks && analyticsData.topKiosks.length > 1 ? (
                    <>
                      Consider focusing more budget on your top-performing locations like {analyticsData.topKiosks.slice(0, 2).map(k => k.location).join(' and ')} 
                      which are generating the most engagement.
                    </>
                  ) : (
                    'Create more campaigns across different locations to gather more performance data and identify optimization opportunities.'
                  )}
                </p>
          </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
