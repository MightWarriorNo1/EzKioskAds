import { supabase } from '../lib/supabaseClient';

export interface GoogleDriveConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  accessToken?: string;
  tokenExpiry?: number;
  activeFolderId?: string;
  archiveFolderId?: string;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime: string;
  modifiedTime: string;
  webViewLink: string;
  webContentLink?: string;
  parents?: string[];
}

export interface DriveFolder {
  id: string;
  name: string;
  mimeType: string;
  createdTime: string;
  modifiedTime: string;
  webViewLink: string;
  parents?: string[];
}

export class GoogleDriveService {
  private static config: GoogleDriveConfig | null = null;

  // Initialize Google Drive configuration
  static async initialize(): Promise<void> {
    try {
      const { data: integration } = await supabase
        .from('system_integrations')
        .select('config')
        .eq('type', 'google_drive')
        .eq('status', 'connected')
        .single();

      if (integration?.config) {
        this.config = integration.config as GoogleDriveConfig;
      }
    } catch (error) {
      console.error('Error initializing Google Drive service:', error);
    }
  }

  // Check if Google Drive is configured and connected
  static isConfigured(): boolean {
    return this.config !== null && !!this.config.refreshToken;
  }

  // Refresh access token
  private static async refreshAccessToken(): Promise<void> {
    if (!this.config?.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          refresh_token: this.config.refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh access token');
      }

      const data = await response.json();
      this.config.accessToken = data.access_token;
      this.config.tokenExpiry = Date.now() + (data.expires_in * 1000);

      // Update the stored config
      await supabase
        .from('system_integrations')
        .update({
          config: this.config,
          last_sync: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('type', 'google_drive')
        .eq('status', 'connected');

    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw error;
    }
  }

  // Create folders for asset management
  static async createAssetFolders(): Promise<{ activeFolderId: string; archiveFolderId: string }> {
    if (!this.isConfigured()) {
      throw new Error('Google Drive service is not configured');
    }

    try {
      await this.refreshAccessToken();

      // Create Active folder
      const activeFolder = await this.createFolder('Active Assets', 'Folder for currently active advertising assets');
      
      // Create Archive folder
      const archiveFolder = await this.createFolder('Archived Assets', 'Folder for archived advertising assets');

      // Update config with folder IDs
      this.config!.activeFolderId = activeFolder.id;
      this.config!.archiveFolderId = archiveFolder.id;

      await supabase
        .from('system_integrations')
        .update({
          config: this.config,
          updated_at: new Date().toISOString()
        })
        .eq('type', 'google_drive')
        .eq('status', 'connected');

      return {
        activeFolderId: activeFolder.id,
        archiveFolderId: archiveFolder.id
      };
    } catch (error) {
      console.error('Error creating asset folders:', error);
      throw error;
    }
  }

  // Create a folder
  private static async createFolder(name: string, description?: string): Promise<DriveFolder> {
    const response = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config!.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        description,
        mimeType: 'application/vnd.google-apps.folder',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create folder');
    }

    return await response.json();
  }

  // Upload file to Google Drive
  static async uploadFile(
    file: File,
    folderId: string,
    fileName?: string
  ): Promise<DriveFile> {
    if (!this.isConfigured()) {
      throw new Error('Google Drive service is not configured');
    }

    try {
      await this.refreshAccessToken();

      const metadata = {
        name: fileName || file.name,
        parents: [folderId],
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', file);

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config!.accessToken}`,
        },
        body: form,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  // Move file between folders
  static async moveFile(fileId: string, newParentFolderId: string): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error('Google Drive service is not configured');
    }

    try {
      await this.refreshAccessToken();

      // Get current parents
      const fileResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=parents`, {
        headers: {
          'Authorization': `Bearer ${this.config!.accessToken}`,
        },
      });

      if (!fileResponse.ok) {
        throw new Error('Failed to get file info');
      }

      const fileData = await fileResponse.json();
      const previousParents = fileData.parents?.join(',') || '';

      // Move file to new parent
      const moveResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?addParents=${newParentFolderId}&removeParents=${previousParents}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.config!.accessToken}`,
        },
      });

      if (!moveResponse.ok) {
        throw new Error('Failed to move file');
      }
    } catch (error) {
      console.error('Error moving file:', error);
      throw error;
    }
  }

  // Delete file from Google Drive
  static async deleteFile(fileId: string): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error('Google Drive service is not configured');
    }

    try {
      await this.refreshAccessToken();

      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.config!.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  // Get files in a folder
  static async getFilesInFolder(folderId: string): Promise<DriveFile[]> {
    if (!this.isConfigured()) {
      throw new Error('Google Drive service is not configured');
    }

    try {
      await this.refreshAccessToken();

      const response = await fetch(`https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents&fields=files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink)`, {
        headers: {
          'Authorization': `Bearer ${this.config!.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get files');
      }

      const data = await response.json();
      return data.files || [];
    } catch (error) {
      console.error('Error getting files:', error);
      throw error;
    }
  }

  // Process asset lifecycle - move expired assets to archive
  static async processAssetLifecycle(): Promise<void> {
    try {
      // Get assets that need to be archived
      const { data: assetsToArchive } = await supabase
        .from('asset_lifecycle')
        .select(`
          *,
          campaign:campaigns!asset_lifecycle_campaign_id_fkey(id, end_date)
        `)
        .eq('status', 'active')
        .not('google_drive_file_id', 'is', null);

      if (!assetsToArchive) return;

      for (const asset of assetsToArchive) {
        // Check if campaign has ended
        if (asset.campaign && new Date(asset.campaign.end_date) < new Date()) {
          await this.archiveAsset(asset.id, asset.google_drive_file_id!);
        }
      }

      // Get assets that need to be deleted (archived for 90+ days)
      const { data: assetsToDelete } = await supabase
        .from('asset_lifecycle')
        .select('*')
        .eq('status', 'archived')
        .not('google_drive_file_id', 'is', null)
        .lt('archived_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

      if (!assetsToDelete) return;

      for (const asset of assetsToDelete) {
        await this.deleteAsset(asset.id, asset.google_drive_file_id!);
      }
    } catch (error) {
      console.error('Error processing asset lifecycle:', error);
    }
  }

  // Archive an asset
  private static async archiveAsset(assetId: string, driveFileId: string): Promise<void> {
    try {
      if (!this.config?.archiveFolderId) {
        throw new Error('Archive folder not configured');
      }

      // Move file to archive folder
      await this.moveFile(driveFileId, this.config.archiveFolderId);

      // Update database
      await supabase
        .from('asset_lifecycle')
        .update({
          status: 'archived',
          google_drive_folder: 'archive',
          archived_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', assetId);

    } catch (error) {
      console.error('Error archiving asset:', error);
      throw error;
    }
  }

  // Delete an asset
  private static async deleteAsset(assetId: string, driveFileId: string): Promise<void> {
    try {
      // Delete from Google Drive
      await this.deleteFile(driveFileId);

      // Update database
      await supabase
        .from('asset_lifecycle')
        .update({
          status: 'deleted',
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', assetId);

    } catch (error) {
      console.error('Error deleting asset:', error);
      throw error;
    }
  }

  // Restore an asset from archive
  static async restoreAsset(assetId: string, driveFileId: string): Promise<void> {
    try {
      if (!this.config?.activeFolderId) {
        throw new Error('Active folder not configured');
      }

      // Move file back to active folder
      await this.moveFile(driveFileId, this.config.activeFolderId);

      // Update database
      await supabase
        .from('asset_lifecycle')
        .update({
          status: 'active',
          google_drive_folder: 'active',
          restored_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', assetId);

    } catch (error) {
      console.error('Error restoring asset:', error);
      throw error;
    }
  }

  // Test Google Drive connection
  static async testConnection(): Promise<boolean> {
    try {
      if (!this.isConfigured()) {
        return false;
      }

      await this.refreshAccessToken();

      const response = await fetch('https://www.googleapis.com/drive/v3/about?fields=user', {
        headers: {
          'Authorization': `Bearer ${this.config!.accessToken}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error testing Google Drive connection:', error);
      return false;
    }
  }

  // Setup Google Drive integration (OAuth flow)
  static async setupIntegration(authCode: string, redirectUri: string): Promise<void> {
    try {
      // Exchange authorization code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || '',
          client_secret: process.env.REACT_APP_GOOGLE_CLIENT_SECRET || '',
          code: authCode,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to exchange authorization code');
      }

      const tokens = await tokenResponse.json();

      const config: GoogleDriveConfig = {
        clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.REACT_APP_GOOGLE_CLIENT_SECRET || '',
        refreshToken: tokens.refresh_token,
        accessToken: tokens.access_token,
        tokenExpiry: Date.now() + (tokens.expires_in * 1000),
      };

      // Create asset folders
      const folders = await this.createAssetFolders();
      config.activeFolderId = folders.activeFolderId;
      config.archiveFolderId = folders.archiveFolderId;

      // Store the configuration
      const { error } = await supabase
        .from('system_integrations')
        .upsert({
          name: 'Google Drive',
          type: 'google_drive',
          status: 'connected',
          config,
          last_sync: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      this.config = config;
    } catch (error) {
      console.error('Error setting up Google Drive integration:', error);
      throw error;
    }
  }

  // Disconnect Google Drive integration
  static async disconnect(): Promise<void> {
    try {
      const { error } = await supabase
        .from('system_integrations')
        .update({
          status: 'disconnected',
          config: {},
          error_message: null,
          updated_at: new Date().toISOString()
        })
        .eq('type', 'google_drive');

      if (error) throw error;

      this.config = null;
    } catch (error) {
      console.error('Error disconnecting Google Drive:', error);
      throw error;
    }
  }
}

// Initialize Google Drive service on module load
GoogleDriveService.initialize();
