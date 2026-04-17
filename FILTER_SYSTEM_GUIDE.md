# Filter System Implementation

## Overview
This system provides a centralized way to manage and apply filters (page_size, log_date, pet) across all API endpoints in your application.

## Files Created

1. **src/utils/filterParams.js** - Filter utilities and defaults
2. **src/context/FilterContext.js** - Global filter state management
3. **src/components/FilterInputs.js** - Reusable filter UI component
4. **src/utils/useApiWithFilters.js** - Custom hook for API calls with filters
5. **src/pages/ExampleFilterUsage.jsx** - Example implementation

## How to Use

### 1. Add FilterInputs Component to Your Page

```jsx
import FilterInputs from '../components/FilterInputs';

const YourPage = () => {
  return (
    <Container>
      <FilterInputs />
      {/* Your page content */}
    </Container>
  );
};
```

### 2. Use Filters in API Calls

```jsx
import { useApiWithFilters } from '../utils/useApiWithFilters';
import { productionApi } from '../api/production';

const YourComponent = () => {
  const { getParams } = useApiWithFilters();
  const [data, setData] = useState([]);

  useEffect(() => {
    // Automatically includes page_size, log_date, and pet
    productionApi.getReports(getParams())
      .then(res => setData(res.data.data))
      .catch(err => console.error(err));
  }, [getParams()]);

  return <div>{/* Render data */}</div>;
};
```

### 3. Add Additional Parameters

```jsx
// Combine filters with additional params
const params = getParams({ status: 'active', line: 1 });
productionApi.getReports(params);
// Results in: ?page_size=1000&log_date=2026-03-07&pet=1&status=active&line=1
```

### 4. Access Current Filter Values

```jsx
import { useFilters } from '../context/FilterContext';

const YourComponent = () => {
  const { filters, updateFilters } = useFilters();
  
  console.log(filters.log_date); // Current date
  console.log(filters.pet); // Current pet ID
  
  // Manually update filters
  updateFilters({ pet: 5 });
};
```

## Default Values

- **page_size**: 1000
- **log_date**: Today's date (YYYY-MM-DD)
- **pet**: null (all pets)

## Customization

### Modify Default Filters

Edit `src/utils/filterParams.js`:

```js
export const DEFAULT_FILTERS = {
  page_size: 500, // Change default page size
  log_date: '2026-03-07', // Set specific date
  pet: 1 // Set default pet
};
```

### Add More Filter Fields

1. Update `DEFAULT_FILTERS` in `filterParams.js`
2. Update `buildFilterParams()` function
3. Add input fields to `FilterInputs.js` component

Example:
```js
// filterParams.js
export const DEFAULT_FILTERS = {
  page_size: 1000,
  log_date: new Date().toISOString().split('T')[0],
  pet: null,
  shift: null // New filter
};

export const buildFilterParams = (filters = {}) => {
  const params = {};
  if (filters.page_size) params.page_size = filters.page_size;
  if (filters.log_date) params.log_date = filters.log_date;
  if (filters.pet) params.pet = filters.pet;
  if (filters.shift) params.shift = filters.shift; // New filter
  return params;
};
```

## Integration with Existing Pages

To add filters to existing pages:

1. Import and add `<FilterInputs />` component
2. Replace direct API calls with `useApiWithFilters` hook
3. Update `useEffect` dependencies to trigger reload on filter change

### Before:
```jsx
useEffect(() => {
  productionApi.getReports({ page_size: 1000 })
    .then(res => setData(res.data.data));
}, []);
```

### After:
```jsx
const { getParams } = useApiWithFilters();

useEffect(() => {
  productionApi.getReports(getParams())
    .then(res => setData(res.data.data));
}, [getParams()]);
```

## Notes

- Filters are shared across all components using the FilterContext
- Changing a filter in one component updates it everywhere
- The FilterInputs component automatically loads PET options from the API
- All filter parameters are optional and only included if they have values
