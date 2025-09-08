import React, { useState, useEffect } from 'react';
import { CheckSquare, X, Eye, Clock, AlertCircle, Check, RefreshCw } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';
import { AdminService, AdReviewItem } from '../../services/adminService';

export default function AdReviewQueue() {
  const [ads, setAds] = useState<AdReviewItem[]>([]);
  const [selectedAd, setSelectedAd] = useState<AdReviewItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const { addNotification } = useNotification();

  useEffect(() => {
    loadAdReviewQueue();
  }, []);

  const loadAdReviewQueue = async () => {
    try {
      setLoading(true);
      const reviewQueue = await AdminService.getAdReviewQueue();
      setAds(reviewQueue);
    } catch (error) {
      console.error('Error loading ad review queue:', error);
      addNotification('error', 'Error', 'Failed to load ad review queue');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (adId: string) => {
    try {
      setReviewing(adId);
      await AdminService.reviewAd(adId, 'approve');
      setAds(prev => prev.filter(ad => ad.id !== adId));
      addNotification('success', 'Ad Approved', 'The ad has been approved and is now live. Client has been notified via email.');
      setSelectedAd(null);
    } catch (error) {
      console.error('Error approving ad:', error);
      addNotification('error', 'Error', 'Failed to approve ad');
    } finally {
      setReviewing(null);
    }
  };

  const handleReject = async (adId: string, reason?: string) => {
    try {
      setReviewing(adId);
      await AdminService.reviewAd(adId, 'reject', reason);
      setAds(prev => prev.filter(ad => ad.id !== adId));
      addNotification('info', 'Ad Rejected', 'The ad has been rejected and client has been notified via email.');
      setSelectedAd(null);
      setShowRejectionModal(false);
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting ad:', error);
      addNotification('error', 'Error', 'Failed to reject ad');
    } finally {
      setReviewing(null);
    }
  };

  const openRejectionModal = () => {
    setShowRejectionModal(true);
  };

  const closeRejectionModal = () => {
    setShowRejectionModal(false);
    setRejectionReason('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploading': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFilePreview = (fileType: string, filePath: string) => {
    if (fileType === 'image') {
      return filePath; // Assuming filePath is a URL
    } else {
      // For videos, we could show a thumbnail or placeholder
      return 'https://images.pexels.com/photos/3945313/pexels-photo-3945313.jpeg?auto=compress&cs=tinysrgb&w=400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ad Review Queue</h1>
          <p className="text-gray-600 mt-2">Review and approve submitted advertisements</p>
        </div>
        <button
          onClick={loadAdReviewQueue}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Queue Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{ads.filter(a => a.status === 'processing').length}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Uploading</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{ads.filter(a => a.status === 'uploading').length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Queue</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{ads.length}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <AlertCircle className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">With Errors</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{ads.filter(a => a.validation_errors && a.validation_errors.length > 0).length}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Review Queue */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Queue List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Review Queue</h3>
            </div>
            
            <div className="divide-y divide-gray-200">
              {loading ? (
                <div className="p-6 text-center">
                  <RefreshCw className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-4" />
                  <p className="text-gray-500">Loading ad review queue...</p>
                </div>
              ) : ads.length === 0 ? (
                <div className="p-6 text-center">
                  <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No ads to review</h3>
                  <p className="text-gray-500">All caught up! Check back later for new submissions.</p>
                </div>
              ) : (
                ads.map((ad) => (
                  <div
                    key={ad.id}
                    className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedAd?.id === ad.id ? 'bg-purple-50 border-l-4 border-purple-500' : ''
                    }`}
                    onClick={() => setSelectedAd(ad)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-28 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={getFilePreview(ad.file_type, ad.file_path)} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{ad.file_name}</h4>
                          <p className="text-sm text-gray-600">by {ad.user.full_name} ({ad.user.company_name || ad.user.email})</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Uploaded {new Date(ad.created_at).toLocaleDateString()}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ad.status)}`}>
                              {ad.status}
                            </span>
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {ad.file_type}
                            </span>
                            {ad.campaign && (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                {ad.campaign.name}
                              </span>
                            )}
                          </div>
                          {ad.validation_errors && ad.validation_errors.length > 0 && (
                            <div className="mt-2">
                              <span className="text-xs text-red-600 font-medium">Validation Errors:</span>
                              <ul className="text-xs text-red-600 mt-1">
                                {ad.validation_errors.map((error, index) => (
                                  <li key={index}>• {error}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Review Panel */}
        <div className="lg:col-span-1">
          {selectedAd ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Details</h3>
              
              {/* Preview */}
              <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden mb-4">
                <img 
                  src={getFilePreview(selectedAd.file_type, selectedAd.file_path)} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-3 mb-6">
                <div>
                  <span className="text-sm font-medium text-gray-700">File Name:</span>
                  <p className="text-sm text-gray-900">{selectedAd.file_name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Client:</span>
                  <p className="text-sm text-gray-900">{selectedAd.user.full_name}</p>
                  <p className="text-xs text-gray-500">{selectedAd.user.email}</p>
                  {selectedAd.user.company_name && (
                    <p className="text-xs text-gray-500">{selectedAd.user.company_name}</p>
                  )}
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Type:</span>
                  <p className="text-sm text-gray-900 capitalize">{selectedAd.file_type}</p>
                </div>
                {selectedAd.campaign && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Campaign:</span>
                    <p className="text-sm text-gray-900">{selectedAd.campaign.name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(selectedAd.campaign.start_date).toLocaleDateString()} - {new Date(selectedAd.campaign.end_date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">Budget: ${selectedAd.campaign.budget}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium text-gray-700">Upload Date:</span>
                  <p className="text-sm text-gray-900">{new Date(selectedAd.created_at).toLocaleDateString()}</p>
                </div>
                {selectedAd.validation_errors && selectedAd.validation_errors.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Validation Errors:</span>
                    <ul className="text-sm text-red-600 mt-1">
                      {selectedAd.validation_errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => handleApprove(selectedAd.id)}
                  disabled={reviewing === selectedAd.id}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {reviewing === selectedAd.id ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  <span>Approve</span>
                </button>
                <button
                  onClick={openRejectionModal}
                  disabled={reviewing === selectedAd.id}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
              <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Ad</h3>
              <p className="text-gray-500">Choose an ad from the queue to review</p>
            </div>
          )}
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectionModal && selectedAd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Ad</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for rejecting this ad. The client will be notified via email.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <div className="flex space-x-3 mt-6">
              <button
                onClick={closeRejectionModal}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(selectedAd.id, rejectionReason)}
                disabled={!rejectionReason.trim() || reviewing === selectedAd.id}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {reviewing === selectedAd.id ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
                <span>Reject Ad</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}