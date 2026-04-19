import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactApexChart from 'react-apexcharts';
import { productionApi } from '../../api/production';

const formatDuration = (mins) => {
    if (!mins || mins <= 0) return '0m';
    const h = Math.floor(mins / 60);
    const m = Math.round(mins % 60);
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
};

const CATEGORY_COLORS = {
    'Mechanical Downtime': '#ef4444',
    'Planned Downtime': '#3b82f6',
    'Electrical': '#f59e0b',
    'Quality': '#8b5cf6',
    'Material': '#10b981',
    'Other': '#6b7280',
};

const StoppageIncidentsChart = () => {
    const navigate = useNavigate();
    const [useRange, setUseRange] = useState(false);
    const [singleDate, setSingleDate] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedPet, setSelectedPet] = useState('');
    const [selectedSubCategory, setSelectedSubCategory] = useState('');
    const [stoppages, setStoppages] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchStoppages = async () => {
            setLoading(true);
            try {
                const params = {};
                if (useRange) {
                    if (startDate) params.start_date = startDate;
                    if (endDate) params.end_date = endDate;
                } else if (singleDate) {
                    params.log_date = singleDate;
                }
                
                const res = await productionApi.getStoppages(params);
                const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
                const filtered = (Array.isArray(data) ? data : []).filter(s => !(s.pet_name || s.line_name || '').toLowerCase().includes('can'));
                setStoppages(filtered);
            } catch (err) {
                console.error('Failed to fetch stoppages:', err);
                setStoppages([]);
            } finally {
                setLoading(false);
            }
        };

        fetchStoppages();
    }, [useRange, singleDate, startDate, endDate]);

    const availablePets = useMemo(() => {
        const pets = [...new Set(stoppages.map(s => s.pet_name || s.line_name).filter(Boolean))];
        return pets.sort((a, b) => {
            const aNum = parseInt(a.match(/(\d+)/)?.[0] || '999');
            const bNum = parseInt(b.match(/(\d+)/)?.[0] || '999');
            return aNum - bNum;
        });
    }, [stoppages]);

    const availableSubCategories = useMemo(() => {
        const subCats = new Set();
        stoppages.forEach(stoppage => {
            (stoppage.incidents || []).forEach(incident => {
                const subCat = incident.sub_downtime_category_name;
                if (subCat) subCats.add(subCat);
            });
        });
        return Array.from(subCats).sort();
    }, [stoppages]);

    const filteredStoppages = useMemo(() => {
        let filtered = stoppages;
        
        if (selectedPet) {
            filtered = filtered.filter(s => (s.pet_name || s.line_name) === selectedPet);
        }
        
        if (selectedSubCategory) {
            filtered = filtered.map(stoppage => ({
                ...stoppage,
                incidents: (stoppage.incidents || []).filter(
                    incident => incident.sub_downtime_category_name === selectedSubCategory
                )
            })).filter(s => s.incidents.length > 0);
        }
        
        return filtered;
    }, [stoppages, selectedPet, selectedSubCategory]);

    const chartData = useMemo(() => {
        const incidentMap = {};

        filteredStoppages.forEach(stoppage => {
            (stoppage.incidents || []).forEach(incident => {
                const subCategory = incident.sub_downtime_category_name || 'Uncategorized';
                const description = incident.incident_description || 'No Description';
                const key = `${subCategory} - ${description}`;
                const duration = parseFloat(incident.incident_duration || 0);

                if (!incidentMap[key]) {
                    incidentMap[key] = {
                        label: key,
                        subCategory,
                        description,
                        count: 0,
                        totalDuration: 0
                    };
                }

                incidentMap[key].count += 1;
                incidentMap[key].totalDuration += duration;
            });
        });

        return Object.values(incidentMap)
            .sort((a, b) => b.totalDuration - a.totalDuration)
            .slice(0, 10);
    }, [filteredStoppages]);

    const chartOptions = useMemo(() => ({
        chart: {
            type: 'bar',
            height: 800,
            toolbar: { show: false }
        },
        grid: {
            yaxis: { lines: { show: true } },
            xaxis: { lines: { show: false } }
        },
        plotOptions: {
            bar: {
                horizontal: true,
                barHeight: '85%',
                borderRadius: 4,
                colors: {
                    backgroundBarColors: ['#f8f9fa', '#ffffff'],
                    backgroundBarOpacity: 1,
                }
            }
        },
        dataLabels: {
            enabled: true,
            style: { fontSize: '10px', colors: ['#fff'] }
        },
        stroke: { show: true, width: 1, colors: ['#fff'] },
        xaxis: {
            categories: chartData.map(d => d.label),
            labels: { style: { fontSize: '11px' } }
        },
        yaxis: {
            labels: { 
                style: { fontSize: '10px' },
                maxWidth: 200,
                formatter: (val) => {
                    if (!val || typeof val !== 'string') return val;
                    const words = val.split(' ');
                    if (words.length <= 1) return val;
                    const chunkSize = Math.ceil(val.length / 4);
                    const lines = [];
                    let current = '';
                    for (const word of words) {
                        if (current.length + word.length + 1 > chunkSize && lines.length < 3) {
                            lines.push(current.trim());
                            current = word;
                        } else {
                            current += (current ? ' ' : '') + word;
                        }
                    }
                    if (current) lines.push(current.trim());
                    return lines;
                }
            }
        },
        fill: { opacity: 1 },
        tooltip: {
            y: {
                formatter: (val, opts) => {
                    const seriesIndex = opts?.seriesIndex ?? 1;
                    return seriesIndex === 0 ? `${val} incidents` : `${formatDuration(val)}`;
                }
            }
        },
        legend: {
            position: 'top',
            horizontalAlign: 'right',
            fontSize: '12px'
        },
        colors: ['#3b82f6', '#ef4444']
    }), [chartData]);

    const series = useMemo(() => [
        {
            name: 'Incident Count',
            data: chartData.map(d => d.count)
        },
        {
            name: 'Total Duration (min)',
            data: chartData.map(d => Math.round(d.totalDuration))
        }
    ], [chartData]);

    const totalIncidents = chartData.reduce((sum, d) => sum + d.count, 0);
    const totalDuration = chartData.reduce((sum, d) => sum + d.totalDuration, 0);
    
    const dailyRate = useMemo(() => {
        if (!useRange || !startDate || !endDate) return null;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        return days > 0 ? (totalIncidents / days).toFixed(1) : 0;
    }, [useRange, startDate, endDate, totalIncidents]);

    return (
        <div className="card">
            <div className="card-header">
                <div className="d-flex align-items-center justify-content-between">
                    <div>
                        <h6 className="mb-0">Stoppage Incidents by Category</h6>
                        <small className="text-muted">Incident count and total duration by downtime category</small>
                    </div>
                    <button onClick={() => navigate('/dashboard/production/stoppages')} className="btn btn-primary btn-xs">
                        <i className="ti ti-external-link me-1"></i>View All
                    </button>
                </div>
                
                <div className="row mt-3 align-items-end">
                    <div className="col-md-4">
                        <div className="d-flex align-items-center gap-2 mb-2">
                            <label className="form-label mb-0 small">Date</label>
                            <div className="form-check form-switch">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={useRange}
                                    onChange={(e) => {
                                        setUseRange(e.target.checked);
                                        if (e.target.checked) setSingleDate('');
                                        else { setStartDate(''); setEndDate(''); }
                                    }}
                                />
                                <label className="form-check-label small">Range</label>
                            </div>
                        </div>
                        {!useRange ? (
                            <input
                                type="date"
                                className="form-control form-control-sm"
                                value={singleDate}
                                onChange={(e) => setSingleDate(e.target.value)}
                            />
                        ) : (
                            <div className="d-flex gap-2">
                                <input
                                    type="date"
                                    className="form-control form-control-sm"
                                    placeholder="Start"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                                <input
                                    type="date"
                                    className="form-control form-control-sm"
                                    placeholder="End"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        )}
                    </div>
                    <div className="col-md-3">
                        <label className="form-label small">PET</label>
                        <select
                            className="form-select form-select-sm"
                            value={selectedPet}
                            onChange={(e) => setSelectedPet(e.target.value)}
                        >
                            <option value="">All</option>
                            {availablePets.map(pet => (
                                <option key={pet} value={pet}>{pet}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-3">
                        <label className="form-label small">Subcategory</label>
                        <select
                            className="form-select form-select-sm"
                            value={selectedSubCategory}
                            onChange={(e) => setSelectedSubCategory(e.target.value)}
                        >
                            <option value="">All</option>
                            {availableSubCategories.map(subCat => (
                                <option key={subCat} value={subCat}>{subCat}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-2">
                        <label className="form-label small">Quick Select</label>
                        <div className="btn-group btn-group-sm w-100">
                            <button 
                                className="btn btn-outline-primary"
                                onClick={() => {
                                    const end = new Date().toISOString().split('T')[0];
                                    const start = new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0];
                                    setUseRange(true);
                                    setStartDate(start);
                                    setEndDate(end);
                                    setSingleDate('');
                                }}
                            >
                                Week
                            </button>
                            <button 
                                className="btn btn-outline-primary"
                                onClick={() => {
                                    const end = new Date().toISOString().split('T')[0];
                                    const start = new Date(Date.now() - 29 * 86400000).toISOString().split('T')[0];
                                    setUseRange(true);
                                    setStartDate(start);
                                    setEndDate(end);
                                    setSingleDate('');
                                }}
                            >
                                Month
                            </button>
                        </div>
                    </div>
                </div>
                
                {(singleDate || startDate || endDate || selectedPet || selectedSubCategory) && (
                    <div className="alert alert-info d-flex align-items-center mt-3 mb-0">
                        <i className="ti ti-filter fs-5 me-2"></i>
                        <div className="flex-grow-1">
                            <strong>Active Filters:</strong>
                            {singleDate && <span className="ms-2">Date: {singleDate}</span>}
                            {startDate && <span className="ms-2">From: {startDate}</span>}
                            {endDate && <span className="ms-2">To: {endDate}</span>}
                            {selectedPet && <span className="ms-2">• PET: {selectedPet}</span>}
                            {selectedSubCategory && <span className="ms-2">• Subcategory: {selectedSubCategory}</span>}
                        </div>
                        <button 
                            className="btn btn-sm btn-outline-info"
                            onClick={() => {
                                setSingleDate('');
                                setStartDate('');
                                setEndDate('');
                                setSelectedPet('');
                                setSelectedSubCategory('');
                                setUseRange(false);
                            }}
                        >
                            Clear
                        </button>
                    </div>
                )}
            </div>
            <div className="card-body">
                {loading ? (
                    <div className="text-center py-5">
                        <span className="spinner-border spinner-border-sm"></span>
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="text-center text-muted py-5">
                        <i className="ti ti-alert-circle fs-1 mb-3 d-block"></i>
                        <p className="mb-0">No incident data available</p>
                        <small className="d-block mt-2">Total stoppages: {stoppages.length} | Filtered: {filteredStoppages.length}</small>
                    </div>
                ) : (
                    <>
                        <div className="row mb-3">
                            <div className="col-4">
                                <div className="border rounded p-3 text-center">
                                    <small className="text-muted d-block mb-1">Total Incidents</small>
                                    <h4 className="mb-0 text-primary">{totalIncidents}</h4>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="border rounded p-3 text-center">
                                    <small className="text-muted d-block mb-1">Total Duration</small>
                                    <h4 className="mb-0 text-danger">{formatDuration(totalDuration)}</h4>
                                </div>
                            </div>
                            {dailyRate && (
                                <div className="col-4">
                                    <div className="border rounded p-3 text-center">
                                        <small className="text-muted d-block mb-1">Daily Rate</small>
                                        <h4 className="mb-0 text-info">{dailyRate}</h4>
                                        <small className="text-muted">incidents/day</small>
                                    </div>
                                </div>
                            )}
                        </div>
                        <ReactApexChart options={chartOptions} series={series} type="bar" height={700} />
                    </>
                )}
            </div>
        </div>
    );
};

export default StoppageIncidentsChart;
