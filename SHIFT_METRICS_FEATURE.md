# Shift Production Metrics Feature - Implementation Summary

## Overview
The Shift Production Metrics feature has been successfully implemented at `/dashboard` (Overview page). This feature displays comprehensive production metrics for the current shift with real-time data from the stoppages summary API endpoint.

## API Endpoint Used
```
https://api.twellium-api.com/api/production/stoppages/stoppages_summary/
```

### Parameters:
- `start_datetime`: Start of the time range (ISO 8601 format)
- `end_datetime`: End of the time range (ISO 8601 format)
- `shift`: Shift ID (e.g., 10 for DAY shift)
- `pet`: PET line ID (optional filter, e.g., 11)

## Features Implemented

### 1. **Shift Selection & Filtering**
- Automatic detection of current shift based on system time
- Manual shift selection (DAY/NIGHT buttons)
- Date picker to view historical shift data
- PET line filtering support
- "All Shifts" button to navigate to detailed view

### 2. **Summary Statistics Cards**
Four key metrics displayed at the top:
- **Total Production**: Aggregate bottles produced across all PET lines
- **Total Downtime**: Sum of downtime with color-coded status (green ≤60min, red >60min)
- **Average OEE**: Mean OEE percentage across all lines with performance indicators
- **Best Performer**: PET line with highest OEE

### 3. **Shift Stoppages Summary**
Additional metrics from the API:
- **Total Stoppages**: Count of stoppage incidents
- **Avg Efficiency**: Average efficiency percentage
- **Top Stoppage Reasons**: Top 5 stoppage categories with duration

### 4. **Per-PET Metrics**
Three detailed sections for each PET line:

#### a. Production Output by PET
- Individual production counts per PET line
- Displayed using `CorporateStatCard` component
- Shows bottle icon and formatted numbers

#### b. Downtime by PET
- Downtime minutes per PET line
- Status indicator: "Within Target" (≤30min) or "Exceeds Target" (>30min)
- Clock icon with formatted duration

#### c. OEE Efficiency by PET
- Individual OEE gauge charts per PET line
- Visual gauge with color-coded performance zones:
  - Green: ≥85% (Excellent)
  - Yellow: 60-84% (Acceptable)
  - Red: <60% (Needs improvement)

### 5. **Shift Comparison Feature**
- Toggle button to show/hide comparison table
- Stores historical shift data for comparison
- Table displays up to 10 recent shifts with:
  - Date and shift name
  - Total production
  - Total downtime
  - Average OEE
  - Total stoppages
  - Average efficiency
- Current shift highlighted in blue

### 6. **Real-time Updates**
- "Last Updated" timestamp showing latest data refresh
- Shift time display (e.g., "06:00 - 18:00")
- Auto-refresh capability with loading states

## Technical Implementation

### State Management
```javascript
const [hourlyReports, setHourlyReports] = useState([]);
const [shifts, setShifts] = useState([]);
const [currentShiftInfo, setCurrentShiftInfo] = useState(null);
const [selectedShiftId, setSelectedShiftId] = useState(null);
const [shiftFilterDate, setShiftFilterDate] = useState('');
const [shiftComparisonData, setShiftComparisonData] = useState({});
const [showShiftComparison, setShowShiftComparison] = useState(false);
```

### API Integration
```javascript
// Fetch shift data
const shiftParams = {
    start_datetime: shiftStart.toISOString().replace(/\.\d{3}Z$/, 'Z'),
    end_datetime: shiftEnd.toISOString().replace(/\.\d{3}Z$/, 'Z'),
    shift: targetShift.id
};

if (filters.pet) {
    shiftParams.pet = filters.pet;
}

const shiftReportsRes = await productionApi.getStoppagesSummary(shiftParams);
```

### Data Processing
```javascript
// Extract comprehensive summary data
const summaryData = shiftReportsRes?.data || {};
const overallTotals = summaryData.overall_totals || {};
const stoppagesSummary = {
    total_production: overallTotals.bottles_produced || 0,
    total_downtime: overallTotals.downtime_minutes || 0,
    total_stoppages: summaryData.total_stoppages || 0,
    avg_efficiency: overallTotals.efficiency || summaryData.avg_efficiency || 0,
    downtime_breakdown: summaryData.downtime_breakdown || {},
    top_stoppage_reasons: summaryData.top_stoppage_reasons || [],
};
```

## UI Components Used

1. **CorporateStatCard**: Displays production output and downtime metrics
2. **CorporateGaugeChart**: Shows OEE efficiency gauges
3. **Bootstrap Cards**: Container for the entire section
4. **Bootstrap Tables**: Shift comparison table
5. **Bootstrap Badges**: Shift names and status indicators
6. **Tabler Icons**: Visual indicators (clock, bottle, chart, etc.)

## File Locations

- **Main Component**: `/src/pages/dashboard/Overview.jsx`
- **API Methods**: `/src/api/production.js` (line 48: `getStoppagesSummary`)
- **UI Components**: 
  - `/src/components/production/CorporateStatCard.jsx`
  - `/src/components/charts/CorporateGaugeChart.jsx`

## Key Features

✅ Real-time shift data display
✅ Automatic shift detection
✅ Manual shift selection
✅ Historical data viewing
✅ PET line filtering
✅ Comprehensive metrics (production, downtime, OEE, stoppages)
✅ Visual performance indicators
✅ Shift comparison capability
✅ Responsive design
✅ Loading states and error handling
✅ Data caching for comparison

## Usage Example

1. Navigate to `/dashboard`
2. The "Shift Production Metrics" section appears below the page header
3. Current shift is automatically selected based on system time
4. Use date picker to view historical data
5. Click shift buttons (DAY/NIGHT) to switch between shifts
6. Click "Compare" to view shift comparison table
7. Click "All Shifts" to navigate to detailed production view

## API Response Structure Expected

```json
{
  "data": [
    {
      "pet_name": "PET 11",
      "total_bottles_produced": 50000,
      "metrics": {
        "oee": 85.5,
        "details": {
          "total_downtime_mins": 45,
          "total_output_pcs": 50000
        }
      }
    }
  ],
  "overall_totals": {
    "bottles_produced": 200000,
    "downtime_minutes": 180,
    "efficiency": 87.2
  },
  "total_stoppages": 12,
  "avg_efficiency": 87.2,
  "top_stoppage_reasons": [
    {
      "category": "Mechanical Downtime",
      "duration": 90
    }
  ]
}
```

## Recent Updates

- Fixed parameter name from `pet_id` to `pet` to match API specification
- Added ISO timestamp formatting to remove milliseconds
- Implemented comprehensive stoppages summary display
- Added shift comparison feature
- Enhanced visual indicators and status badges

## Notes

- The feature filters out CAN lines automatically
- PET lines are sorted numerically (PET 11, PET 12, etc.)
- Time range is fixed to 00:00:00 - 23:59:59 for the selected date
- Data is cached for comparison purposes
- Loading states prevent multiple simultaneous API calls
