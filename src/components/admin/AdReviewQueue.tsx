import React, { useState } from 'react';
import { CheckSquare, X, Eye, Clock, AlertCircle, Check } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';

interface PendingAd {
  id: string;
  title: string;
  client: string;
  uploadDate: string;
  type: 'image' | 'video';
  preview: string;
  status: 'pending' | 'reviewing';
  priority: 'high' | 'medium' | 'low';
}

export default function AdReviewQueue() {
  const [ads, setAds] = useState<PendingAd[]>([
    {
      id: '1',
      title: 'Summer Sale Banner',
      client: 'TechCorp Inc.',
      uploadDate: '2025-01-20',
      type: 'image',
      preview: 'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=400',
      status: 'pending',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Product Launch Video',
      client: 'Fashion Forward',
      uploadDate: '2025-01-19',
      type: 'video',
      preview: 'https://images.pexels.com/photos/3945313/pexels-photo-3945313.jpeg?auto=compress&cs=tinysrgb&w=400',
      status: 'reviewing',
      priority: 'medium'
    },
    {
      id: '3',
      title: 'Holiday Promotion',
      client: 'RetailMax',
      uploadDate: '2025-01-18',
      type: 'image',
      preview: 'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=400',
      status: 'pending',
      priority: 'low'
    },
    {
      id: '4',
      title: 'Back to School Campaign',
      client: 'Education First',
      uploadDate: '2025-01-17',
      type: 'video',
      preview: 'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=400',
      status: 'pending',
      priority: 'high'
    },
    {
      id: '5',
      title: 'Spring Collection Preview',
      client: 'Fashion Forward',
      uploadDate: '2025-01-16',
      type: 'image',
      preview: 'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=400',
      status: 'reviewing',
      priority: 'medium'
    },
    {
      id: '6',
      title: 'Tech Conference Promo',
      client: 'Innovation Labs',
      uploadDate: '2025-01-15',
      type: 'video',
      preview: 'https://images.pexels.com/photos/3945313/pexels-photo-3945313.jpeg?auto=compress&cs=tinysrgb&w=400',
      status: 'pending',
      priority: 'high'
    },
    {
      id: '7',
      title: 'Restaurant Week Special',
      client: 'Culinary Delights',
      uploadDate: '2025-01-14',
      type: 'image',
      preview: 'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=400',
      status: 'pending',
      priority: 'medium'
    },
    {
      id: '8',
      title: 'Fitness Center Membership',
      client: 'Health & Fitness Co.',
      uploadDate: '2025-01-13',
      type: 'video',
      preview: 'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=400',
      status: 'reviewing',
      priority: 'low'
    },
    {
      id: '9',
      title: 'Movie Theater Premiere',
      client: 'Cinema Entertainment',
      uploadDate: '2025-01-12',
      type: 'image',
      preview: 'https://images.pexels.com/photos/3945313/pexels-photo-3945313.jpeg?auto=compress&cs=tinysrgb&w=400',
      status: 'pending',
      priority: 'high'
    },
    {
      id: '10',
      title: 'Car Dealership Event',
      client: 'Auto Excellence',
      uploadDate: '2025-01-11',
      type: 'video',
      preview: 'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=400',
      status: 'pending',
      priority: 'medium'
    },
    {
      id: '11',
      title: 'Travel Insurance Promo',
      client: 'Safe Travel Inc.',
      uploadDate: '2025-01-10',
      type: 'image',
      preview: 'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=400',
      status: 'reviewing',
      priority: 'high'
    },
    {
      id: '12',
      title: 'Health Insurance Campaign',
      client: 'Wellness Partners',
      uploadDate: '2025-01-09',
      type: 'video',
      preview: 'https://images.pexels.com/photos/3945313/pexels-photo-3945313.jpeg?auto=compress&cs=tinysrgb&w=400',
      status: 'pending',
      priority: 'medium'
    }
  ]);

  const [selectedAd, setSelectedAd] = useState<PendingAd | null>(null);
  const { addNotification } = useNotification();

  const handleApprove = (adId: string) => {
    setAds(prev => prev.filter(ad => ad.id !== adId));
    addNotification('success', 'Ad Approved', 'The ad has been approved and is now live');
    setSelectedAd(null);
  };

  const handleReject = (adId: string) => {
    setAds(prev => prev.filter(ad => ad.id !== adId));
    addNotification('info', 'Ad Rejected', 'The ad has been rejected and client has been notified');
    setSelectedAd(null);
  };

  const getPriorityColor = (priority: PendingAd['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: PendingAd['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewing': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Ad Review Queue</h1>
        <p className="text-gray-600 mt-2">Review and approve submitted advertisements</p>
      </div>

      {/* Queue Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{ads.filter(a => a.status === 'pending').length}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Review</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{ads.filter(a => a.status === 'reviewing').length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Priority</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{ads.filter(a => a.priority === 'high').length}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved Today</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">18</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Check className="h-6 w-6 text-green-600" />
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
              {ads.map((ad) => (
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
                          src={ad.preview} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{ad.title}</h4>
                        <p className="text-sm text-gray-600">by {ad.client}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Uploaded {new Date(ad.uploadDate).toLocaleDateString()}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ad.status)}`}>
                            {ad.status}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(ad.priority)}`}>
                            {ad.priority} priority
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
                  src={selectedAd.preview} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-3 mb-6">
                <div>
                  <span className="text-sm font-medium text-gray-700">Title:</span>
                  <p className="text-sm text-gray-900">{selectedAd.title}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Client:</span>
                  <p className="text-sm text-gray-900">{selectedAd.client}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Type:</span>
                  <p className="text-sm text-gray-900 capitalize">{selectedAd.type}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Upload Date:</span>
                  <p className="text-sm text-gray-900">{new Date(selectedAd.uploadDate).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => handleApprove(selectedAd.id)}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Check className="h-4 w-4" />
                  <span>Approve</span>
                </button>
                <button
                  onClick={() => handleReject(selectedAd.id)}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Reject</span>
                </button>
                <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                  Request Changes
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
    </div>
  );
}