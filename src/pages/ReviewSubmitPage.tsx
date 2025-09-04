import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, MapPin, Calendar, Clock, DollarSign, Upload, AlertTriangle } from 'lucide-react';
import DashboardLayout from '../components/layouts/DashboardLayout';
import { CampaignService } from '../services/campaignService';
import { MediaService } from '../services/mediaService';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

interface SelectedWeek {
  startDate: string;
  endDate: string;
  slots: number;
}

interface CampaignData {
  kiosk: any;
  selectedWeeks: SelectedWeek[];
  totalSlots: number;
  baseRate: number;
  mediaFile?: File;
  slotsPerWeek?: number;
  uploadedMediaAsset?: any;
}

export default function ReviewSubmitPage() {
  const navigate = useNavigate();
  const location = useLocation() as { state?: CampaignData };
  const { user } = useAuth();
  const { addNotification } = useNotification();
  
  const campaignData = location.state;
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Redirect if no campaign data or user not authenticated
  React.useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }
    if (!campaignData) {
      navigate('/client/new-campaign');
      return;
    }
  }, [campaignData, user, navigate]);
  
  if (!campaignData || !user) {
    return null; // Will redirect
  }
  
  const kiosk = campaignData.kiosk;
  const selectedWeeks = campaignData.selectedWeeks || [];
  const totalSlots = campaignData.totalSlots || 1;
  const baseRate = campaignData.baseRate || 40.00;
  const uploadedMediaAsset = campaignData.uploadedMediaAsset;

  const steps = [
    { number: 1, name: 'Setup Service', current: false, completed: true },
    { number: 2, name: 'Select Kiosk', current: false, completed: true },
    { number: 3, name: 'Choose Weeks', current: false, completed: true },
    { number: 4, name: 'Add Media & Duration', current: false, completed: true },
    { number: 5, name: 'Review & Submit', current: true, completed: false }
  ];

  const handleBack = () => {
    navigate('/client/add-media-duration', { state: campaignData });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
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

  const calculateTotalCost = () => {
    return totalSlots * baseRate;
  };

  const handleSubmit = async () => {
    if (!user || !uploadedMediaAsset) return;

    setIsSubmitting(true);
    
    try {
      // Generate campaign name
      const campaignName = `${kiosk.name} - ${selectedWeeks.length} week${selectedWeeks.length > 1 ? 's' : ''} campaign`;
      
      // Calculate campaign dates
      const startDate = selectedWeeks[0]?.startDate;
      const endDate = selectedWeeks[selectedWeeks.length - 1]?.endDate;
      
      if (!startDate || !endDate) {
        throw new Error('Invalid campaign dates');
      }

      // Create campaign
      const newCampaign = await CampaignService.createCampaign({
        name: campaignName,
        description: `Campaign for ${kiosk.name} running for ${selectedWeeks.length} week${selectedWeeks.length > 1 ? 's' : ''}`,
        start_date: startDate,
        end_date: endDate,
        budget: calculateTotalCost(),
        total_slots: totalSlots,
        total_cost: calculateTotalCost(),
        user_id: user.id,
        kiosk_ids: [kiosk.id],
        target_locations: [kiosk.city],
        media_asset_id: uploadedMediaAsset.id
      });

      if (!newCampaign) {
        throw new Error('Failed to create campaign');
      }

      addNotification('success', 'Campaign Created!', `Your campaign "${campaignName}" has been created successfully and is now pending approval.`);
      
      // Navigate to campaigns page
      navigate('/client/campaigns');
    } catch (error) {
      console.error('Error creating campaign:', error);
      addNotification('error', 'Campaign Creation Failed', error instanceof Error ? error.message : 'Failed to create campaign. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout 
      title="Create New Campaign" 
      subtitle=""
      showBreadcrumb={false}
    >
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shadow-soft ${
                step.completed 
                  ? 'bg-green-600 text-white' 
                  : step.current
                  ? 'bg-black text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}>
                {step.completed ? '✓' : step.number}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                step.current ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {step.name}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-8 h-1 mx-4 ${
                  step.completed ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Back Navigation */}
      <div className="mb-8">
        <button
          onClick={handleBack}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors shadow-soft"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Add Media</span>
        </button>
      </div>

      {/* Section Title */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Review & Submit Campaign
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Please review all the details below before submitting your campaign for approval.
        </p>
      </div>

      {/* Review Content */}
      <div className="space-y-8">
        {/* Kiosk Selection Review */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Selected Kiosk</h3>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">{kiosk.name}</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{kiosk.city}</p>
                <p className="text-gray-500 dark:text-gray-500 text-sm">{kiosk.address}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    kiosk.traffic === 'High Traffic' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : kiosk.traffic === 'Medium Traffic'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}>
                    {kiosk.traffic}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {kiosk.price}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Weeks Review */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Selected Weeks</h3>
          </div>
          
          <div className="space-y-3">
            {selectedWeeks.map((week, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Week {index + 1}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(week.startDate)} - {formatDate(week.endDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {week.slots} slot{week.slots > 1 ? 's' : ''}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatCurrency(week.slots * baseRate)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Media Asset Review */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <Upload className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Media Asset</h3>
          </div>
          
          {uploadedMediaAsset && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                  {uploadedMediaAsset.file_type === 'image' ? (
                    <img 
                      src={uploadedMediaAsset.metadata?.publicUrl} 
                      alt="Media preview" 
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-gray-500 dark:text-gray-400">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {uploadedMediaAsset.file_name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {uploadedMediaAsset.file_type === 'image' ? 'Image' : 'Video'} • 
                    {uploadedMediaAsset.dimensions?.width}x{uploadedMediaAsset.dimensions?.height}
                    {uploadedMediaAsset.duration && ` • ${Math.round(uploadedMediaAsset.duration)}s`}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600 dark:text-green-400">Approved</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Cost Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Cost Summary</h3>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Base rate per week:</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(baseRate)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Total weeks:</span>
                <span className="font-medium text-gray-900 dark:text-white">{selectedWeeks.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Total slots:</span>
                <span className="font-medium text-gray-900 dark:text-white">{totalSlots}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">Total Cost:</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(calculateTotalCost())}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Important Notice
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Your campaign will be submitted for approval. Once approved, it will be scheduled to run during the selected weeks. 
                You will be notified via email when your campaign is approved and goes live.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`group relative px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-soft ${
            isSubmitting
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Creating Campaign...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Submit Campaign</span>
            </div>
          )}
        </button>
      </div>
    </DashboardLayout>
  );
}
