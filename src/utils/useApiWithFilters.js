import { useCallback } from 'react';
import { useFilters } from '../context/FilterContext';
import { buildFilterParams } from './filterParams';

export const useApiWithFilters = () => {
  const { filters } = useFilters();
  
  const getParams = useCallback((additionalParams = {}, forStoppages = false) => {
    return { ...buildFilterParams(filters, forStoppages), ...additionalParams };
  }, [filters]);

  return { getParams, filters };
};
