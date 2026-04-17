# Dashboard Filters Implementation - Complete

## Changes Applied

### Files Modified:

1. **src/pages/dashboard/Overview.jsx**
   - Added `FilterInputs` component
   - Integrated `useApiWithFilters` hook
   - Replaced hardcoded params with `getParams()`
   - Removed old custom filter UI

2. **src/pages/dashboard/ProductionOverview.jsx**
   - Added `FilterInputs` component
   - Integrated `useApiWithFilters` hook
   - Replaced hardcoded params with `getParams()`

3. **src/pages/dashboard/Formulas.jsx**
   - No changes needed (displays static formulas only)

## How It Works

All dashboard pages now use the global filter system:

```jsx
const { getParams } = useApiWithFilters();

const loadData = useCallback(async () => {
  const params = getParams(); // Includes page_size, log_date, pet
  const data = await productionApi.getReports(params);
}, [getParams]);
```

## Filter UI Location

The `<FilterInputs />` component appears at the top of each dashboard page with:
- **Date picker** - Filters by log_date
- **PET dropdown** - Filters by pet ID
- **Page size selector** - Controls pagination (10, 50, 100, 1000)

## Shared State

Filters are shared across all dashboard pages via `FilterContext`. Changing a filter on one page updates it everywhere.

## API Calls Affected

All these endpoints now automatically include filter parameters:
- `/production/reports/`
- `/production/stoppages/`
- `/core/pets/`
- `/production/shifts/`

Example API call:
```
GET /api/production/reports/?page_size=1000&log_date=2026-03-07&pet=1
```
