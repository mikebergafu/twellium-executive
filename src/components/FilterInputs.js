import React, { useEffect, useState } from 'react';
import { useFilters } from '../context/FilterContext';
import { productionApi } from '../api/production';

const FilterInputs = ({ showPageSize = false }) => {
  const { filters, updateFilters } = useFilters();
  const [pets, setPets] = useState([]);
  const [useRange, setUseRange] = useState(false);

  useEffect(() => {
    productionApi.getPets({ page_size: 1000 })
      .then(res => setPets((res.data.data || []).filter(pet => !pet.pet_name?.toLowerCase().includes('can'))))
      .catch(err => console.error('Failed to load pets:', err));
  }, []);

  const handleRangeToggle = (checked) => {
    setUseRange(checked);
    if (checked) {
      updateFilters({ log_date: null });
    } else {
      updateFilters({ start_date: null, end_date: null });
    }
  };

  return (
    <div className="card mb-3">
        <div className="card-body">
            <div className="row align-items-end">
      <div className={showPageSize ? "col-md-3" : "col-md-4"}>
        <div className="d-flex align-items-center gap-2 mb-2">
          <label className="form-label mb-0 fw-semibold">Date Filter</label>
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              checked={useRange}
              onChange={(e) => handleRangeToggle(e.target.checked)}
            />
            <label className="form-check-label small ms-1">Range</label>
          </div>
        </div>
        {!useRange ? (
          <input
            type="date"
            className="form-control"
            value={filters.log_date || ''}
            onChange={(e) => updateFilters({ log_date: e.target.value })}
          />
        ) : (
          <div className="d-flex gap-2">
            <input
              type="date"
              className="form-control"
              placeholder="Start"
              value={filters.start_date || ''}
              onChange={(e) => updateFilters({ start_date: e.target.value })}
            />
            <input
              type="date"
              className="form-control"
              placeholder="End"
              value={filters.end_date || ''}
              onChange={(e) => updateFilters({ end_date: e.target.value })}
            />
          </div>
        )}
      </div>
      <div className={showPageSize ? "col-md-3" : "col-md-4"}>
        <label className="form-label fw-semibold">PET Line</label>
        <select
          className="form-select"
          value={filters.pet || ''}
          onChange={(e) => updateFilters({ pet: e.target.value || null })}
        >
          <option value="">All PET Lines</option>
          {pets.filter(pet => !pet.pet_name?.toLowerCase().includes('can')).sort((a, b) => {
            const aNum = parseInt(a.pet_name?.match(/(\d+)/)?.[0] || '999');
            const bNum = parseInt(b.pet_name?.match(/(\d+)/)?.[0] || '999');
            return aNum - bNum;
          }).map(pet => (
            <option key={pet.id} value={pet.id}>{pet.pet_name}</option>
          ))}
        </select>
      </div>
      {showPageSize && (
        <div className="col-md-3">
          <label className="form-label fw-semibold">Page Size</label>
          <select
            className="form-select"
            value={filters.page_size}
            onChange={(e) => updateFilters({ page_size: e.target.value })}
          >
            <option value="10">10</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="1000">1000</option>
          </select>
        </div>
      )}
            </div>
        </div>
    </div>
  );
};

export default FilterInputs;
