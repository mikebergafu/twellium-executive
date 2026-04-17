import React, { useState, useMemo, lazy, Suspense, useEffect } from 'react';
import { useFilters } from '../../context/FilterContext';
import { productionApi } from '../../api/production';

const ReactApexChart = lazy(() => import('react-apexcharts'));

const ProductionSummary = ({ reports = [], loading = false, pets = [] }) => {
    const { filters } = useFilters();
    const [period, setPeriod] = useState('week');
    const [localStartDate, setLocalStartDate] = useState(() => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const sunday = new Date(today);
        sunday.setDate(today.getDate() - dayOfWeek);
        return sunday.toISOString().split('T')[0];
    });
    const [localEndDate, setLocalEndDate] = useState(() => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const sunday = new Date(today);
        sunday.setDate(today.getDate() - dayOfWeek);
        const saturday = new Date(sunday);
        saturday.setDate(sunday.getDate() + 6);
        return saturday.toISOString().split('T')[0];
    });
    const [useLocalDates, setUseLocalDates] = useState(true);
    const [periodReports, setPeriodReports] = useState([]);
    const [periodLoading, setPeriodLoading] = useState(false);

    // Fetch data when week/month period is selected
    useEffect(() => {
        if (useLocalDates && localStartDate && localEndDate) {
            const fetchPeriodData = async () => {
                setPeriodLoading(true);
                try {
                    const params = {
                        start_date: localStartDate,
                        end_date: localEndDate,
                        page_size: 1000
                    };
                    
                    const response = await productionApi.getOeeSummary(params);
                    const data = response?.data?.data || response?.data?.results || response?.data || [];
                    setPeriodReports(data.filter(r => !r.pet_name?.toLowerCase().includes('can')));
                } catch (error) {
                    console.error('Error fetching period data:', error);
                    setPeriodReports([]);
                } finally {
                    setPeriodLoading(false);
                }
            };
            fetchPeriodData();
        }
    }, [useLocalDates, localStartDate, localEndDate]);

    // Use local dates if week/month clicked, otherwise global filters
    const singleDate = useLocalDates ? '' : (filters.log_date || '');
    const startDate = useLocalDates ? localStartDate : (filters.start_date || '');
    const endDate = useLocalDates ? localEndDate : (filters.end_date || '');
    const useRange = !!startDate || !!endDate;
    const selectedPet = filters.pet || '';
    
    // Use period reports when week/month is active, otherwise use passed reports
    const activeReports = useLocalDates ? periodReports : reports;
    const activeLoading = useLocalDates ? periodLoading : loading;

    const chartData = useMemo(() => {
        let filtered = activeReports;

        // Filter by date - use global filters
        if (useRange) {
            if (startDate) filtered = filtered.filter(r => {
                const reportDate = r.production_date || r.log_date || '';
                return reportDate >= startDate;
            });
            if (endDate) filtered = filtered.filter(r => {
                const reportDate = r.production_date || r.log_date || '';
                return reportDate <= endDate;
            });
        } else if (singleDate) {
            filtered = filtered.filter(r => {
                const reportDate = r.production_date || r.log_date || '';
                return reportDate === singleDate;
            });
        }

        // Filter by PET - use pet_name for comparison
        if (selectedPet) {
            const selectedPetName = pets.find(p => p.id === parseInt(selectedPet))?.pet_name;
            if (selectedPetName) {
                filtered = filtered.filter(r => r.pet_name === selectedPetName);
            }
        }

        // Generate date range
        let dates = [];
        let grouped = {};

        if (period === 'month') {
            // Use local dates for month range
            const firstDay = new Date(localStartDate || new Date());
            const lastDay = new Date(localEndDate || new Date());
            for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
                dates.push(new Date(d).toISOString().split('T')[0]);
            }
        } else {
            // Use local dates for week range
            const firstDay = new Date(localStartDate || new Date());
            const lastDay = new Date(localEndDate || new Date());
            for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
                dates.push(new Date(d).toISOString().split('T')[0]);
            }
        }

        // Dates from today onward should not plot values
        const today = new Date().toISOString().split('T')[0];

        // Group by date
        filtered.forEach(r => {
            const date = r.production_date || r.log_date || '';
            if (!grouped[date]) grouped[date] = {};

            const petName = (r.pet_name || 'Unknown').replace(/\b\w/g, c => c.toUpperCase());
            if (!grouped[date][petName]) {
                grouped[date][petName] = { oee: 0, count: 0 };
            }
            grouped[date][petName].oee += r.metrics?.oee || parseFloat(r.efficiency) || r.oee || 0;
            grouped[date][petName].count += 1;
        });

        // Define all PETs from Pet 1 to Pet 6
        const allPets = ['Pet 1', 'Pet 2', 'Pet 3', 'Pet 4', 'Pet 5', 'Pet 6'];

        const series = allPets.map(pet => ({
            name: pet,
            data: dates.map(date => {
                if (date >= today) return null;
                const data = grouped[date]?.[pet];
                return data ? parseFloat((data.oee / data.count).toFixed(1)) : 0;
            })
        }));

        return { dates, series };
    }, [activeReports, period, useRange, singleDate, startDate, endDate, selectedPet, pets]);

    const summary = useMemo(() => {
        let filtered = activeReports;

        // Filter by date - use global filters
        if (useRange) {
            if (startDate) filtered = filtered.filter(r => {
                const reportDate = r.production_date || r.log_date || '';
                return reportDate >= startDate;
            });
            if (endDate) filtered = filtered.filter(r => {
                const reportDate = r.production_date || r.log_date || '';
                return reportDate <= endDate;
            });
        } else if (singleDate) {
            filtered = filtered.filter(r => {
                const reportDate = r.production_date || r.log_date || '';
                return reportDate === singleDate;
            });
        }

        // Filter by PET - use pet_name for comparison
        if (selectedPet) {
            const selectedPetName = pets.find(p => p.id === parseInt(selectedPet))?.pet_name;
            if (selectedPetName) {
                filtered = filtered.filter(r => r.pet_name === selectedPetName);
            }
        }

        const totalProduction = filtered.reduce((s, r) => s + (r.total_bottles_produced || r.bottles_produced || r.metrics?.details?.total_output_pcs || 0), 0);
        const avgOee = filtered.length > 0
            ? filtered.reduce((s, r) => s + (r.metrics?.oee || parseFloat(r.efficiency) || r.oee || 0), 0) / filtered.length
            : 0;
        const totalDowntime = filtered.reduce((s, r) => s + (r.metrics?.details?.total_downtime_mins || r.downtime_minutes || r.total_downtime_mins || 0), 0);
        const plannedDowntime = filtered.reduce((s, r) => s + (r.metrics?.details?.planned_downtime_mins || 0), 0);
        const mechDowntime = filtered.reduce((s, r) => s + (r.metrics?.details?.mechanical_downtime_mins || 0), 0);
        const totalPlannedMins = filtered.reduce((s, r) => s + (r.metrics?.details?.planned_time_mins || 0), 0);
        const avgRuntime = filtered.length > 0
            ? filtered.reduce((s, r) => s + (r.metrics?.details?.total_runtime_mins || r.runtime_minutes || 0), 0) / filtered.length
            : 0;
        const opTime = totalPlannedMins - plannedDowntime;
        const avgPerformance = opTime > 0 ? ((totalPlannedMins - totalDowntime) / opTime) * 100 : 0;
        const avgAvailability = filtered.length > 0
            ? filtered.reduce((s, r) => s + (r.metrics?.availability || r.availability || 0), 0) / filtered.length
            : 0;
        const avgQuality = filtered.length > 0
            ? filtered.reduce((s, r) => s + (r.metrics?.quality || r.quality || 0), 0) / filtered.length
            : 0;
        const targetMet = filtered.filter(r => (r.metrics?.oee || r.oee || 0) >= 85).length;

        return { 
            totalProduction, 
            avgOee, 
            totalDowntime,
            plannedDowntime,
            mechDowntime,
            reports: filtered.length,
            avgRuntime,
            avgPerformance,
            avgAvailability,
            avgQuality,
            targetMet
        };
    }, [activeReports, useRange, singleDate, startDate, endDate, selectedPet, pets]);

    const hasActiveFilter = !!(singleDate || startDate || endDate || selectedPet);

    return (
        <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent border-0 pt-3 pb-0">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                    <div>
                        <h6 className="mb-0 fw-semibold">Production Summary</h6>
                        <small className="text-muted">Efficiency trends and multi-line comparison</small>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <div className="btn-group">
                            <button
                                className={`btn btn-sm ${period === 'week' ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => {
                                    setPeriod('week');
                                    const today = new Date();
                                    const dayOfWeek = today.getDay();
                                    const sunday = new Date(today);
                                    sunday.setDate(today.getDate() - dayOfWeek);
                                    const saturday = new Date(sunday);
                                    saturday.setDate(sunday.getDate() + 6);
                                    setLocalStartDate(sunday.toISOString().split('T')[0]);
                                    setLocalEndDate(saturday.toISOString().split('T')[0]);
                                    setUseLocalDates(true);
                                }}
                            >
                                <i className="ti ti-calendar-week me-1"></i>Week
                            </button>
                            <button
                                className={`btn btn-sm ${period === 'month' ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => {
                                    setPeriod('month');
                                    const today = new Date();
                                    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                                    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                                    setLocalStartDate(firstDay.toISOString().split('T')[0]);
                                    setLocalEndDate(lastDay.toISOString().split('T')[0]);
                                    setUseLocalDates(true);
                                }}
                            >
                                <i className="ti ti-calendar-month me-1"></i>Month
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Dedicated Date Filter */}
                <div className="row g-2 mb-3">
                    <div className="col-md-4">
                        <label className="form-label fs-12 mb-1">Start Date</label>
                        <input
                            type="date"
                            className="form-control form-control-sm"
                            value={localStartDate}
                            onChange={(e) => {
                                setLocalStartDate(e.target.value);
                                setUseLocalDates(true);
                            }}
                        />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label fs-12 mb-1">End Date</label>
                        <input
                            type="date"
                            className="form-control form-control-sm"
                            value={localEndDate}
                            onChange={(e) => {
                                setLocalEndDate(e.target.value);
                                setUseLocalDates(true);
                            }}
                        />
                    </div>
                    <div className="col-md-4 d-flex align-items-end">
                        <button
                            className="btn btn-sm btn-outline-secondary w-100"
                            onClick={() => {
                                const today = new Date().toISOString().split('T')[0];
                                setLocalStartDate(today);
                                setLocalEndDate(today);
                                setUseLocalDates(true);
                            }}
                        >
                            <i className="ti ti-calendar-event me-1"></i>Today
                        </button>
                    </div>
                </div>
                
                {/* Active Filters Display */}
                <div className="d-flex align-items-center gap-2 flex-wrap">
                    <span className="badge bg-soft-info text-info">
                        <i className="ti ti-calendar me-1"></i>
                        {localStartDate} - {localEndDate}
                    </span>
                    {selectedPet && (
                        <span className="badge bg-soft-primary text-primary">
                            <i className="ti ti-building-factory-2 me-1"></i>
                            {pets.find(p => p.id === parseInt(selectedPet))?.pet_name || 'Selected PET'}
                        </span>
                    )}
                    <span className="badge bg-soft-secondary text-secondary">
                        {activeReports.length} reports loaded
                    </span>
                </div>
            </div>
            <div className="card-body">

                {/* Summary Stats */}
                <div className="row row-cols-1 row-cols-sm-2 row-cols-md-4 g-2 mb-2">
                    <div className="col">
                        <div className="card production-summary-stat-card border-0 shadow-sm bg-soft-primary h-100">
                            <div className="card-body text-center py-2 px-2">
                                <div className="d-flex align-items-center justify-content-center mb-2">
                                    <div className="bg-primary rounded-circle p-2">
                                        <i className="ti ti-bottle text-white fs-5"></i>
                                    </div>
                                </div>
                                <small className="text-muted d-block fs-11 text-uppercase fw-semibold mb-1">Total Production</small>
                                <h6 className="mb-0 text-primary fw-bold">{summary.totalProduction.toLocaleString()}</h6>
                                <small className="text-muted fs-11">bottles</small>
                            </div>
                        </div>
                    </div>
                    <div className="col">
                        <div className="card production-summary-stat-card border-0 shadow-sm bg-soft-success h-100">
                            <div className="card-body text-center py-2 px-2">
                                <div className="d-flex align-items-center justify-content-center mb-2">
                                    <div className="bg-success rounded-circle p-2">
                                        <i className="ti ti-chart-pie text-white fs-5"></i>
                                    </div>
                                </div>
                                <small className="text-muted d-block fs-11 text-uppercase fw-semibold mb-1">Avg Efficiency</small>
                                <h6 className="mb-0 text-success fw-bold">{summary.avgOee.toFixed(1)}%</h6>
                                <small className="text-muted fs-11">efficiency</small>
                            </div>
                        </div>
                    </div>
                    <div className="col">
                        <div className="card production-summary-stat-card border-0 shadow-sm bg-soft-danger h-100">
                            <div className="card-body text-center py-2 px-2">
                                <div className="d-flex align-items-center justify-content-center mb-2">
                                    <div className="bg-danger rounded-circle p-2">
                                        <i className="ti ti-clock-pause text-white fs-5"></i>
                                    </div>
                                </div>
                                <small className="text-muted d-block fs-11 text-uppercase fw-semibold mb-1">Total Downtime</small>
                                <h6 className="mb-0 text-danger fw-bold">{Math.round(summary.totalDowntime)}m</h6>
                                <small className="text-muted fs-11">{Math.round(summary.totalDowntime / 60)}h {Math.round(summary.totalDowntime % 60)}m</small>
                            </div>
                        </div>
                    </div>
                    <div className="col">
                        <div className="card production-summary-stat-card border-0 shadow-sm bg-soft-info h-100">
                            <div className="card-body text-center py-2 px-2">
                                <div className="d-flex align-items-center justify-content-center mb-2">
                                    <div className="bg-info rounded-circle p-2">
                                        <i className="ti ti-file-analytics text-white fs-5"></i>
                                    </div>
                                </div>
                                <small className="text-muted d-block fs-11 text-uppercase fw-semibold mb-1">Reports</small>
                                <h6 className="mb-0 text-info fw-bold">{summary.reports}</h6>
                                <small className="text-muted fs-11">in period</small>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="row row-cols-1 row-cols-sm-2 row-cols-md-5 g-2 mb-4">
                    <div className="col">
                        <div className="card production-summary-stat-card border-0 shadow-sm bg-soft-purple h-100">
                            <div className="card-body text-center py-2 px-2">
                                <div className="d-flex align-items-center justify-content-center mb-2">
                                    <div className="rounded-circle p-2" style={{backgroundColor: '#8b5cf6'}}>
                                        <i className="ti ti-gauge-filled text-white fs-5"></i>
                                    </div>
                                </div>
                                <small className="text-muted d-block fs-11 text-uppercase fw-semibold mb-1">Performance</small>
                                <h6 className="mb-0 fw-bold" style={{color: '#8b5cf6'}}>{summary.avgPerformance.toFixed(1)}%</h6>
                                <small className="text-muted fs-11">rate</small>
                            </div>
                        </div>
                    </div>
                    <div className="col">
                        <div className="card production-summary-stat-card border-0 shadow-sm bg-soft-teal h-100">
                            <div className="card-body text-center py-2 px-2">
                                <div className="d-flex align-items-center justify-content-center mb-2">
                                    <div className="rounded-circle p-2" style={{backgroundColor: '#06b6d4'}}>
                                        <i className="ti ti-activity text-white fs-5"></i>
                                    </div>
                                </div>
                                <small className="text-muted d-block fs-11 text-uppercase fw-semibold mb-1">Availability</small>
                                <h6 className="mb-0 fw-bold" style={{color: '#06b6d4'}}>{summary.avgAvailability.toFixed(1)}%</h6>
                                <small className="text-muted fs-11">uptime</small>
                            </div>
                        </div>
                    </div>
                    <div className="col">
                        <div className="card production-summary-stat-card border-0 shadow-sm bg-soft-indigo h-100">
                            <div className="card-body text-center py-2 px-2">
                                <div className="d-flex align-items-center justify-content-center mb-2">
                                    <div className="rounded-circle p-2" style={{backgroundColor: '#4f46e5'}}>
                                        <i className="ti ti-award text-white fs-5"></i>
                                    </div>
                                </div>
                                <small className="text-muted d-block fs-11 text-uppercase fw-semibold mb-1">Quality</small>
                                <h6 className="mb-0 fw-bold" style={{color: '#4f46e5'}}>{summary.avgQuality.toFixed(1)}%</h6>
                                <small className="text-muted fs-11">rate</small>
                            </div>
                        </div>
                    </div>
                    <div className="col">
                        <div className="card production-summary-stat-card border-0 shadow-sm bg-soft-warning h-100">
                            <div className="card-body text-center py-2 px-2">
                                <div className="d-flex align-items-center justify-content-center mb-2">
                                    <div className="bg-warning rounded-circle p-2">
                                        <i className="ti ti-calendar-time text-white fs-5"></i>
                                    </div>
                                </div>
                                <small className="text-muted d-block fs-11 text-uppercase fw-semibold mb-1">Planned Downtime</small>
                                <h6 className="mb-0 text-warning fw-bold">{Math.round(summary.plannedDowntime)}m</h6>
                                <small className="text-muted fs-11">{Math.round(summary.plannedDowntime / 60)}h {Math.round(summary.plannedDowntime % 60)}m</small>
                            </div>
                        </div>
                    </div>
                    <div className="col">
                        <div className="card production-summary-stat-card border-0 shadow-sm bg-soft-secondary h-100">
                            <div className="card-body text-center py-2 px-2">
                                <div className="d-flex align-items-center justify-content-center mb-2">
                                    <div className="bg-secondary rounded-circle p-2">
                                        <i className="ti ti-tool text-white fs-5"></i>
                                    </div>
                                </div>
                                <small className="text-muted d-block fs-11 text-uppercase fw-semibold mb-1">Mech Downtime</small>
                                <h6 className="mb-0 text-secondary fw-bold">{Math.round(summary.mechDowntime)}m</h6>
                                <small className="text-muted fs-11">{Math.round(summary.mechDowntime / 60)}h {Math.round(summary.mechDowntime % 60)}m</small>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chart */}
                {activeLoading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : chartData.series.length === 0 || chartData.dates.length === 0 ? (
                    <div className="text-center text-muted py-5">
                        <i className="ti ti-chart-line fs-1 mb-3 d-block"></i>
                        <p className="mb-0">No data available for the selected period</p>
                        <small>Try adjusting the date filters or period selection</small>
                    </div>
                ) : (
                    <Suspense fallback={
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    }>
                        <div className="border rounded p-3 bg-soft-light">
                            <ReactApexChart
                                options={{
                                    chart: {
                                        type: 'line',
                                        height: 350,
                                        toolbar: { show: false },
                                        zoom: { enabled: false },
                                        animations: { enabled: true, easing: 'easeinout', speed: 800 }
                                    },
                                    stroke: { curve: 'smooth', width: 3 },
                                    xaxis: {
                                        categories: chartData.dates,
                                        labels: { 
                                            rotate: -45, 
                                            style: { fontSize: 11 },
                                            formatter: (val) => {
                                                if (period === 'week') {
                                                    const d = new Date(val);
                                                    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
                                                    return `${d.getMonth() + 1}/${d.getDate()}\n${day}`;
                                                }
                                                return val;
                                            }
                                        },
                                        tooltip: { enabled: false },
                                        axisBorder: { show: false },
                                        axisTicks: { show: false }
                                    },
                                    yaxis: {
                                        title: { text: 'OEE (%)', style: { fontSize: 11, color: '#6c757d' } },
                                        min: 0,
                                        max: 100,
                                        labels: { 
                                            formatter: (val) => val ? val.toFixed(0) + '%' : '0%',
                                            style: { fontSize: 11 }
                                        }
                                    },
                                    markers: { size: 5, hover: { size: 7 }, strokeColors: '#fff', strokeWidth: 2 },
                                    legend: { 
                                        position: 'top', 
                                        horizontalAlign: 'right',
                                        fontSize: '12px',
                                        markers: { radius: 5 }
                                    },
                                    tooltip: {
                                        shared: true,
                                        intersect: false,
                                        theme: 'light',
                                        style: { fontSize: '12px' },
                                        y: { formatter: (val) => val ? `${val.toFixed(1)}%` : 'N/A' },
                                        x: { formatter: (val) => val }
                                    },
                                    grid: { 
                                        borderColor: '#e9ecef',
                                        strokeDashArray: 4,
                                        xaxis: { lines: { show: true } },
                                        yaxis: { lines: { show: true } }
                                    },
                                    colors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'],
                                    dataLabels: {
                                        enabled: hasActiveFilter,
                                        formatter: (val) => val > 0 ? `${val}%` : '',
                                        style: { fontSize: '10px', fontWeight: 600, colors: ['#374151'] },
                                        background: { enabled: true, borderRadius: 3, padding: 3, foreColor: '#fff', borderWidth: 0, dropShadow: { enabled: false } },
                                        offsetY: -6
                                    },
                                    theme: { mode: 'light' }
                                }}
                                series={chartData.series}
                                type="line"
                                height={350}
                            />
                        </div>
                    </Suspense>
                )}
            </div>
        </div>
    );
};

export default ProductionSummary;
