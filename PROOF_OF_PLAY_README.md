# Proof-of-Play Feature Documentation

## Overview

The Proof-of-Play feature provides detailed reporting and analytics for ad campaign plays across the ezkioskads.com platform. This feature allows clients to track exactly when, where, and how long their ads were played on specific screens, providing transparency and accountability for advertising spend.

## Features Implemented

### 1. Proof-of-Play Service (`src/services/proofOfPlayService.ts`)

A comprehensive service that handles all Proof-of-Play data operations:

- **Data Retrieval**: Fetches play records with advanced filtering options
- **CSV Export**: Exports data in the exact format shown in the provided CSV structure
- **Summary Statistics**: Provides aggregated metrics for quick insights
- **Filter Options**: Supports filtering by date range, campaign, screen, asset, and account

#### Key Methods:
- `getProofOfPlayRecords()` - Retrieve filtered play records
- `exportProofOfPlayToCSV()` - Export data to CSV format
- `getProofOfPlaySummary()` - Get summary statistics
- `getAvailableCampaigns()` - Get campaigns for filtering
- `getAvailableScreens()` - Get screens/kiosks for filtering
- `getAvailableAssets()` - Get media assets for filtering

### 2. Proof-of-Play Page (`src/pages/ProofOfPlayPage.tsx`)

A comprehensive dashboard page that displays Proof-of-Play data:

#### Features:
- **Summary Cards**: Display key metrics (Total Plays, Unique Screens, Unique Assets, Average Duration)
- **Advanced Filtering**: Date range, campaign, screen, and asset filters
- **Search Functionality**: Real-time search across screen names, asset names, and tags
- **Data Table**: Detailed table showing all Proof-of-Play records with the exact CSV structure
- **CSV Export**: One-click export functionality
- **Responsive Design**: Works on desktop and mobile devices

#### CSV Structure (Matches Provided Image):
- Report Date UTC
- Account ID
- Screen UUID
- Screen Name
- Screen Tags
- Asset ID
- Asset Name
- Asset Tags
- Start Time UTC
- Device Local Time
- Duration

### 3. Navigation Integration

- **Client Portal Route**: Added `/client/proof-of-play` route
- **Navigation Menu**: Added "Proof-of-Play" link in the client sidebar
- **Analytics Integration**: Added link from Analytics page to Proof-of-Play reports

### 4. Data Structure

The Proof-of-Play records include all the fields from the provided CSV structure:

```typescript
interface ProofOfPlayRecord {
  reportDateUTC: string;        // YYYY-MM-DD format
  accountId: string;           // User/Account ID
  screenUUID: string;          // Unique screen identifier
  screenName: string;          // Human-readable screen name
  screenTags: string;          // Screen categorization tags
  assetId: string;             // Media asset identifier
  assetName: string;           // Media file name
  assetTags: string;           // Asset categorization tags
  startTimeUTC: string;        // ISO timestamp of play start
  deviceLocalTime: string;     // Local device time
  duration: number;            // Play duration in seconds
}
```

## Usage

### Accessing Proof-of-Play Reports

1. **From Navigation**: Click "Proof-of-Play" in the client portal sidebar
2. **From Analytics**: Click "View Proof-of-Play Reports" button on the Analytics page
3. **Direct URL**: Navigate to `/client/proof-of-play`

### Filtering Data

1. Click the "Filters" button to open the filter panel
2. Set date range using the date pickers
3. Select specific campaigns, screens, or assets from dropdowns
4. Click "Apply Filters" to update the data
5. Use the search box for real-time text filtering

### Exporting Data

1. Apply any desired filters
2. Click the "Export CSV" button
3. The file will be downloaded with the filename format: `proof-of-play-{start-date}-to-{end-date}.csv`

## Technical Implementation

### Database Integration

The service integrates with the existing Supabase database structure:
- Uses `analytics_events` table for play tracking
- Joins with `campaigns`, `media_assets`, and `kiosks` tables
- Filters by `event_type = 'play'` to get only play events

### Performance Considerations

- Efficient database queries with proper indexing
- Client-side filtering for search functionality
- Pagination support for large datasets
- Lazy loading of filter options

### Error Handling

- Comprehensive error handling for all service methods
- User-friendly error messages via notification system
- Graceful fallbacks for missing data

## Future Enhancements

### Potential Improvements

1. **Real-time Updates**: WebSocket integration for live data updates
2. **Advanced Analytics**: Charts and graphs for play patterns
3. **Scheduled Reports**: Automated email reports
4. **API Integration**: REST API endpoints for external access
5. **Data Visualization**: Interactive charts and heatmaps
6. **Audit Trail**: Track who accessed what data when

### Additional Metrics

1. **Play Quality Metrics**: Buffer time, quality changes
2. **Geographic Analytics**: Location-based play patterns
3. **Time-based Analytics**: Peak play times, day-of-week patterns
4. **Device Analytics**: Performance across different device types

## Security Considerations

- User authentication required for all access
- Account-based data filtering (users only see their own data)
- Secure CSV export with proper file handling
- Input validation and sanitization

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design for mobile and tablet devices
- Progressive enhancement for older browsers

## Dependencies

- React 18+
- TypeScript
- Supabase client
- Lucide React icons
- Tailwind CSS
- React Router

## Testing

The feature should be tested with:
- Various date ranges
- Different filter combinations
- Large datasets
- Export functionality
- Mobile responsiveness
- Error scenarios

## Support

For technical support or feature requests related to Proof-of-Play functionality, please contact the development team or create an issue in the project repository.
