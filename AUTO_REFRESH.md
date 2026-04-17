# Auto-Refresh Feature

## Overview
The auto-refresh feature allows users to enable/disable automatic page refreshing and configure the refresh interval.

## Components

### RefreshContext
- Location: `src/context/RefreshContext.js`
- Provides global state for refresh settings
- Persists settings to localStorage

### RefreshSettings
- Location: `src/components/ui/RefreshSettings.jsx`
- UI component in the TopBar for managing refresh settings
- Allows users to:
  - Enable/disable auto-refresh
  - Select refresh interval (10s, 30s, 1m, 2m, 5m)

### useAutoRefresh Hook
- Location: `src/utils/useAutoRefresh.js`
- Custom hook to add auto-refresh to any component
- Respects user's refresh settings

## Usage

### In a Component

```javascript
import { useAutoRefresh } from '../utils/useAutoRefresh';

const MyComponent = () => {
    const fetchData = useCallback(async () => {
        // Your data fetching logic
    }, []);

    // Initial load
    useEffect(() => { fetchData(); }, [fetchData]);
    
    // Auto-refresh based on user settings
    useAutoRefresh(fetchData, [fetchData]);

    return <div>...</div>;
};
```

## Example Implementation

See `src/pages/dashboard/Overview.jsx` for a complete example.

## Settings Location

Users can access refresh settings via the refresh icon button in the TopBar (next to the theme toggle).
