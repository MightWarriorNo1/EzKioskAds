import React, { useState, useEffect } from 'react';
import { Archive, RefreshCw, RotateCcw, Trash2, Eye, Clock, HardDrive, AlertCircle } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';
import { AdminService, AssetLifecycleItem } from '../../services/adminService';
import { GoogleDriveService } from '../../services/googleDriveService';

export default function AssetLifecycleManagement() {
  const [assets, setAssets] = useState<AssetLifecycleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [processingAsset, setProcessingAsset] = useState<string | null>(null);
  const { addNotification } = useNotification();

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      setLoading(true);
      const assetData = await AdminService.getAssetLifecycle();
      setAssets(assetData);
    } catch (error) {
      console.error('Error loading asset lifecycle:', error);
      addNotification('error', 'Error', 'Failed to load asset lifecycle data');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreAsset = async (assetId: string, driveFileId: string) => {
    try {
      setProcessingAsset(assetId);
      await GoogleDriveService.restoreAsset(assetId, driveFileId);
      await AdminService.restoreAsset(assetId);
      
      setAssets(prev => prev.map(asset => 
        asset.id === assetId 
          ? { 
              ...asset, 
              status: 'active', 
              google_drive_folder: 'active',
              restored_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          : asset
      ));

      addNotification('success', 'Asset Restored', 'Asset has been restored to active folder');
    } catch (error) {
      console.error('Error restoring asset:', error);
      addNotification('error', 'Error', 'Failed to restore asset');
    } finally {
      setProcessingAsset(null);
    }
  };

  const processAssetLifecycle = async () => {
    try {
      setLoading(true);
      await GoogleDriveService.processAssetLifecycle();
      await loadAssets();
      addNotification('success', 'Processing Complete', 'Asset lifecycle has been processed');
    } catch (error) {
      console.error('Error processing asset lifecycle:', error);
      addNotification('error', 'Error', 'Failed to process asset lifecycle');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-yellow-100 text-yellow-800';
      case 'deleted': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return HardDrive;
      case 'archived': return Archive;
      case 'deleted': return Trash2;
      default: return HardDrive;
    }
  };

  const filteredAssets = assets.filter(asset => {
    if (statusFilter === 'all') return true;
    return asset.status === statusFilter;
  });

  const stats = {
    total: assets.length,
    active: assets.filter(a => a.status === 'active').length,
    archived: assets.filter(a => a.status === 'archived').length,
    deleted: assets.filter(a => a.status === 'deleted').length
  };

  const getDaysSinceArchived = (archivedAt: string) => {
    const archived = new Date(archivedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - archived.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getDaysUntilDeletion = (archivedAt: string) => {
    const daysSinceArchived = getDaysSinceArchived(archivedAt);
    return Math.max(0, 90 - daysSinceArchived);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Asset Lifecycle Management</h1>
          <p className="text-gray-600 mt-2">Manage Google Drive asset lifecycle with automatic archiving and deletion</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={processAssetLifecycle}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Process Lifecycle</span>
          </button>
          <button
            onClick={loadAssets}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Assets</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <HardDrive className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.active}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <HardDrive className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Archived</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.archived}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Archive className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Deleted</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.deleted}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="deleted">Deleted</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Asset Lifecycle</h3>
        </div>
        
        {loading ? (
          <div className="p-6 text-center">
            <RefreshCw className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading asset lifecycle...</p>
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="p-6 text-center">
            <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assets found</h3>
            <p className="text-gray-500">No assets match your current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asset
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Google Drive
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timeline
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAssets.map((asset) => {
                  const StatusIcon = getStatusIcon(asset.status);
                  const daysUntilDeletion = asset.archived_at ? getDaysUntilDeletion(asset.archived_at) : null;
                  
                  return (
                    <tr key={asset.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                              <StatusIcon className="h-5 w-5 text-purple-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {asset.media_asset.file_name}
                            </div>
                            <div className="text-sm text-gray-500 capitalize">
                              {asset.media_asset.file_type}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {asset.campaign ? (
                          <div>
                            <div className="text-sm text-gray-900">{asset.campaign.name}</div>
                            <div className="text-sm text-gray-500">
                              Ended: {new Date(asset.campaign.end_date).toLocaleDateString()}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">No campaign</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(asset.status)}`}>
                          {asset.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {asset.google_drive_folder || 'Not synced'}
                        </div>
                        {asset.google_drive_file_id && (
                          <div className="text-sm text-gray-500">
                            ID: {asset.google_drive_file_id.slice(0, 8)}...
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          Created: {new Date(asset.created_at).toLocaleDateString()}
                        </div>
                        {asset.archived_at && (
                          <div className="text-sm text-gray-500">
                            Archived: {new Date(asset.archived_at).toLocaleDateString()}
                          </div>
                        )}
                        {asset.deleted_at && (
                          <div className="text-sm text-gray-500">
                            Deleted: {new Date(asset.deleted_at).toLocaleDateString()}
                          </div>
                        )}
                        {asset.restored_at && (
                          <div className="text-sm text-green-600">
                            Restored: {new Date(asset.restored_at).toLocaleDateString()}
                          </div>
                        )}
                        {daysUntilDeletion !== null && daysUntilDeletion > 0 && (
                          <div className="text-sm text-yellow-600">
                            Deletes in {daysUntilDeletion} days
                          </div>
                        )}
                        {daysUntilDeletion === 0 && (
                          <div className="text-sm text-red-600 font-medium">
                            Ready for deletion
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {asset.status === 'archived' && asset.google_drive_file_id && (
                            <button
                              onClick={() => handleRestoreAsset(asset.id, asset.google_drive_file_id!)}
                              disabled={processingAsset === asset.id}
                              className="text-green-600 hover:text-green-900 flex items-center space-x-1"
                              title="Restore asset"
                            >
                              {processingAsset === asset.id ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <RotateCcw className="h-4 w-4" />
                              )}
                              <span>Restore</span>
                            </button>
                          )}
                          <button className="text-blue-600 hover:text-blue-900 flex items-center space-x-1">
                            <Eye className="h-4 w-4" />
                            <span>View</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lifecycle Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Asset Lifecycle Rules</h3>
        <div className="space-y-3 text-sm text-blue-800">
          <div className="flex items-start space-x-2">
            <HardDrive className="h-4 w-4 text-blue-600 mt-0.5" />
            <p><strong>Active:</strong> Assets from active campaigns are stored in the Active folder</p>
          </div>
          <div className="flex items-start space-x-2">
            <Archive className="h-4 w-4 text-blue-600 mt-0.5" />
            <p><strong>Archived:</strong> Assets from ended campaigns are moved to the Archive folder</p>
          </div>
          <div className="flex items-start space-x-2">
            <Clock className="h-4 w-4 text-blue-600 mt-0.5" />
            <p><strong>90-Day Rule:</strong> Archived assets are automatically deleted after 90 days</p>
          </div>
          <div className="flex items-start space-x-2">
            <RotateCcw className="h-4 w-4 text-blue-600 mt-0.5" />
            <p><strong>Restore:</strong> Admins can manually restore assets within the 90-day window</p>
          </div>
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
            <p><strong>Metadata:</strong> Campaign metadata is preserved even after asset deletion</p>
          </div>
        </div>
      </div>
    </div>
  );
}
