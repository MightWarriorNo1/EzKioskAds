import { supabase } from '../lib/supabaseClient';

export interface ProofOfPlayRecord {
  reportDateUTC: string;
  accountId: string;
  screenUUID: string;
  screenName: string;
  screenTags: string;
  assetId: string;
  assetName: string;
  assetTags: string;
  startTimeUTC: string;
  deviceLocalTime: string;
  duration: number; // in seconds
}

export interface ProofOfPlayFilters {
  startDate?: string;
  endDate?: string;
  campaignId?: string;
  screenId?: string;
  assetId?: string;
  accountId?: string;
}

export class ProofOfPlayService {
  // Get Proof-of-Play records with filters
  static async getProofOfPlayRecords(
    filters: ProofOfPlayFilters = {}
  ): Promise<ProofOfPlayRecord[]> {
    try {
      let query = supabase
        .from('analytics_events')
        .select(`
          timestamp,
          campaign_id,
          media_id,
          location,
          device_info,
          media_assets!inner(
            id,
            file_name,
            tags
          ),
          campaigns!inner(
            id,
            user_id,
            name
          )
        `)
        .eq('event_type', 'play')
        .order('timestamp', { ascending: false });

      // Apply filters
      if (filters.startDate) {
        query = query.gte('timestamp', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('timestamp', filters.endDate);
      }
      if (filters.campaignId) {
        query = query.eq('campaign_id', filters.campaignId);
      }
      if (filters.screenId) {
        query = query.eq('location', filters.screenId);
      }
      if (filters.assetId) {
        query = query.eq('media_id', filters.assetId);
      }
      if (filters.accountId) {
        query = query.eq('campaigns.user_id', filters.accountId);
      }

      const { data: events, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch Proof-of-Play records: ${error.message}`);
      }

      // Transform data to match CSV structure
      const proofOfPlayRecords: ProofOfPlayRecord[] = (events || []).map(event => {
        const timestamp = new Date(event.timestamp);
        const localTime = new Date(timestamp.getTime() - (timestamp.getTimezoneOffset() * 60000));
        
        return {
          reportDateUTC: timestamp.toISOString().split('T')[0], // YYYY-MM-DD format
          accountId: (event.campaigns as any)?.user_id || '',
          screenUUID: event.location || 'unknown',
          screenName: event.location || 'Unknown Screen',
          screenTags: '',
          assetId: event.media_id || '',
          assetName: (event.media_assets as any)?.file_name || 'Unknown Asset',
          assetTags: (event.media_assets as any)?.tags || '',
          startTimeUTC: timestamp.toISOString(),
          deviceLocalTime: localTime.toISOString(),
          duration: this.calculateDuration(event.device_info)
        };
      });

      return proofOfPlayRecords;
    } catch (error) {
      console.error('Error fetching Proof-of-Play records:', error);
      throw error;
    }
  }

  // Calculate duration from device info or use default
  private static calculateDuration(deviceInfo: any): number {
    // In a real implementation, this would come from the device tracking
    // For now, we'll use a default duration or extract from device info
    if (deviceInfo?.duration) {
      return deviceInfo.duration;
    }
    
    // Default duration based on media type (this would be more sophisticated in production)
    return 15; // 15 seconds default
  }

  // Get available campaigns for filtering
  static async getAvailableCampaigns(accountId?: string): Promise<Array<{
    id: string;
    name: string;
    user_id: string;
  }>> {
    try {
      let query = supabase
        .from('campaigns')
        .select('id, name, user_id')
        .order('name', { ascending: true });

      if (accountId) {
        query = query.eq('user_id', accountId);
      }

      const { data: campaigns, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch campaigns: ${error.message}`);
      }

      return campaigns || [];
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      throw error;
    }
  }

  // Get available screens/locations for filtering
  static async getAvailableScreens(): Promise<Array<{
    id: string;
    name: string;
    location: string;
    tags: string;
  }>> {
    try {
      // Get unique locations from analytics_events
      const { data: events, error } = await supabase
        .from('analytics_events')
        .select('location')
        .eq('event_type', 'play');

      if (error) {
        throw new Error(`Failed to fetch screen locations: ${error.message}`);
      }

      // Extract unique locations and create screen objects
      const uniqueLocations = [...new Set((events || []).map(event => event.location))];
      
      return uniqueLocations.map((location, index) => ({
        id: location,
        name: location,
        location: location,
        tags: ''
      }));
    } catch (error) {
      console.error('Error fetching screens:', error);
      throw error;
    }
  }

  // Get available assets for filtering
  static async getAvailableAssets(accountId?: string): Promise<Array<{
    id: string;
    file_name: string;
    tags: string;
  }>> {
    try {
      let query = supabase
        .from('media_assets')
        .select('id, file_name, tags, user_id')
        .order('file_name', { ascending: true });

      if (accountId) {
        query = query.eq('user_id', accountId);
      }

      const { data: assets, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch assets: ${error.message}`);
      }

      return (assets || []).map(asset => ({
        id: asset.id,
        file_name: asset.file_name,
        tags: asset.tags
      }));
    } catch (error) {
      console.error('Error fetching assets:', error);
      throw error;
    }
  }

  // Export Proof-of-Play data to CSV
  static async exportProofOfPlayToCSV(
    filters: ProofOfPlayFilters = {}
  ): Promise<string> {
    try {
      const records = await this.getProofOfPlayRecords(filters);
      
      // Create CSV header matching the image structure
      const headers = [
        'Report Date UTC',
        'Account ID',
        'Screen UUID',
        'Screen Name',
        'Screen Tags',
        'Asset ID',
        'Asset Name',
        'Asset Tags',
        'Start Time UTC',
        'Device Local Time',
        'Duration'
      ];

      // Create CSV rows
      const csvRows = [headers.join(',')];
      
      records.forEach(record => {
        const row = [
          record.reportDateUTC,
          record.accountId,
          record.screenUUID,
          `"${record.screenName}"`,
          `"${record.screenTags}"`,
          record.assetId,
          `"${record.assetName}"`,
          `"${record.assetTags}"`,
          record.startTimeUTC,
          record.deviceLocalTime,
          record.duration.toString()
        ];
        csvRows.push(row.join(','));
      });

      return csvRows.join('\n');
    } catch (error) {
      console.error('Error exporting Proof-of-Play to CSV:', error);
      throw error;
    }
  }

  // Get Proof-of-Play summary statistics
  static async getProofOfPlaySummary(
    filters: ProofOfPlayFilters = {}
  ): Promise<{
    totalPlays: number;
    uniqueScreens: number;
    uniqueAssets: number;
    totalDuration: number;
    averageDuration: number;
    dateRange: {
      start: string;
      end: string;
    };
  }> {
    try {
      const records = await this.getProofOfPlayRecords(filters);
      
      const uniqueScreens = new Set(records.map(r => r.screenUUID)).size;
      const uniqueAssets = new Set(records.map(r => r.assetId)).size;
      const totalDuration = records.reduce((sum, r) => sum + r.duration, 0);
      const averageDuration = records.length > 0 ? totalDuration / records.length : 0;
      
      const dates = records.map(r => new Date(r.startTimeUTC)).sort();
      const dateRange = {
        start: dates.length > 0 ? dates[0].toISOString().split('T')[0] : '',
        end: dates.length > 0 ? dates[dates.length - 1].toISOString().split('T')[0] : ''
      };

      return {
        totalPlays: records.length,
        uniqueScreens,
        uniqueAssets,
        totalDuration,
        averageDuration,
        dateRange
      };
    } catch (error) {
      console.error('Error getting Proof-of-Play summary:', error);
      throw error;
    }
  }
}
