# Downtime Breakdown Chart Component - Implementation Summary

## What Was Done

Created a reusable `DowntimeBreakdownChart` component and implemented it across the dashboard pages.

## Files Created/Modified

### 1. Created: `/src/components/charts/DowntimeBreakdownChart.jsx`
- Reusable component for displaying downtime breakdown by category
- Features:
  - Total downtime summary card
  - Category breakdown with progress bars
  - Color-coded categories with icons
  - Hover effects for better UX
  - Configurable details button
  - Loading state support
  - Empty state handling

### 2. Created: `/src/components/charts/index.js`
- Export file for easier imports of chart components

### 3. Modified: `/src/pages/dashboard/Overview.jsx`
- Imported `DowntimeBreakdownChart` component
- Replaced inline downtime breakdown UI with the reusable component
- Props passed:
  - `downtimeCategories`: Array of categories with name, value, and color
  - `loading`: Loading state
  - `showDetailsButton`: true
  - `detailsRoute`: '/dashboard/production/stoppages'

### 4. Modified: `/src/pages/dashboard/ProductionOverview.jsx`
- Imported `DowntimeBreakdownChart` component
- Added data transformation to convert `downtimeTypes` to `downtimeCategories` format
- Replaced the "Downtime by Type" donut chart section with the reusable component
- Props passed:
  - `downtimeCategories`: Transformed array with Mechanical and Planned categories
  - `loading`: Loading state
  - `showDetailsButton`: true
  - `detailsRoute`: '/dashboard/downtime'

## Component Props

```javascript
DowntimeBreakdownChart({
  downtimeCategories: [
    { name: string, value: number, color: string }
  ],
  loading: boolean,
  showDetailsButton: boolean,
  detailsRoute: string
})
```

## Benefits

1. **Code Reusability**: Single component used in multiple locations
2. **Consistency**: Same UI/UX across all downtime displays
3. **Maintainability**: Changes to downtime display only need to be made in one place
4. **Flexibility**: Configurable props allow customization per use case
5. **Clean Code**: Removed duplicate code from both dashboard pages

## Usage Example

```javascript
import DowntimeBreakdownChart from '../../components/charts/DowntimeBreakdownChart';

<DowntimeBreakdownChart 
  downtimeCategories={[
    { name: 'Mechanical Downtime', value: 120, color: '#ef4444' },
    { name: 'Planned Downtime', value: 60, color: '#3b82f6' }
  ]}
  loading={false}
  showDetailsButton={true}
  detailsRoute="/dashboard/production/stoppages"
/>
```
