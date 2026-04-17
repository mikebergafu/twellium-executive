# OEE to Performance Terminology Changes

## Summary
All occurrences of "OEE" (Overall Equipment Effectiveness) have been changed to "Performance" throughout the application.

## Files Modified

### Components
- `src/components/layout/Sidebar.jsx` - Menu item renamed from "OEE Analytics" to "Performance Analytics"
- `src/components/production/ProductionSummary.jsx` - Display labels and variable names updated

### Pages - Dashboard
- `src/pages/dashboard/Overview.jsx` - All OEE references, variables, and display text updated
- `src/pages/dashboard/ProductionOverview.jsx` - Variable names and display text updated
- `src/pages/dashboard/Formulas.jsx` - Formula descriptions updated

### Pages - Production
- `src/pages/production/ProductionList.jsx` - Comments and variable names updated
- `src/pages/production/ReportDetails.jsx` - Component names and calculations updated
- `src/pages/production/ShiftMetricsByCode.jsx` - Display labels updated

### Pages - Reports
- `src/pages/reports/OeeAnalytics.jsx` - Page title, labels, and all display text updated
- `src/pages/reports/ProductionAnalytics.jsx` - Display text and variable names updated
- `src/pages/reports/ProductionReports.jsx` - Display labels updated

## Changes Made

### Display Text
- "OEE" → "Performance"
- "Avg OEE" → "Avg Performance"
- "Average OEE" → "Average Performance"
- "OEE Analytics" → "Performance Analytics"
- "OEE (%)" → "Performance (%)"
- "OEE Score" → "Performance Score"
- "OEE Target" → "Performance Target"
- "OEE Trend" → "Performance Trend"
- "OEE Distribution" → "Performance Distribution"
- "OEE Breakdown" → "Performance Breakdown"
- "OEE Efficiency" → "Performance Efficiency"
- "OEE Gauges" → "Performance Gauges"

### Variable Names
- `avgOee` → `avgPerformance`
- `oeeValue` → `performanceValue`
- `displayOee` → `displayPerformance`
- `oeeByLine` → `performanceByLine`
- `hourlyOeeByLine` → `hourlyPerformanceByLine`
- `oeeSummary` → `performanceSummary`
- `oeeParams` → `performanceParams`
- `oeeData` → `performanceData`
- `dailyOeeData` → `dailyPerformanceData`
- `oeeDistribution` → `performanceDistribution`
- `oeeStatus` → `performanceStatus`

### Constants
- `OEE_TARGET` → `PERFORMANCE_TARGET`

### Chart IDs
- `oee-trend-chart` → `performance-trend-chart`
- `oee-distribution-chart` → `performance-distribution-chart`
- `oee-breakdown-chart` → `performance-breakdown-chart`
- `oee-radar-chart` → `performance-radar-chart`

### Component Names
- `OEECircularGauge` → `PerformanceCircularGauge`

## Notes
- API method names (e.g., `getOeeSummary`) and API endpoints remain unchanged to maintain backend compatibility
- Object property names from API responses (e.g., `metrics.oee`) remain unchanged
- File names like `OeeAnalytics.jsx` and routes like `/oee-analytics` remain unchanged to avoid breaking routing

## Testing Recommendations
1. Verify all pages load correctly
2. Check that charts and gauges display properly
3. Ensure data fetching still works with unchanged API methods
4. Test export functionality (Excel/PDF) with new terminology
5. Verify menu navigation works correctly
