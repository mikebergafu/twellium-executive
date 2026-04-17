import React from 'react';
import { useNavigate } from 'react-router-dom';

const formatDuration = (mins) => {
    if (!mins || mins <= 0) return '0m';
    const h = Math.floor(mins / 60);
    const m = Math.round(mins % 60);
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
};

const DowntimeBreakdownList = ({ 
    downtimeCategories = [], 
    loading = false,
    showDetailsButton = true,
    detailsRoute = '/dashboard/production/stoppages'
}) => {
    const navigate = useNavigate();
    const totalDowntime = downtimeCategories.reduce((sum, d) => sum + d.value, 0);

    return (
        <div className="card flex-fill">
            <div className="card-header d-flex align-items-center justify-content-between">
                <div>
                    <h6 className="mb-0">Downtime Breakdown (Minutes)</h6>
                    <small className="text-muted">Impacts Availability = (Planned - Downtime) / Planned × 100</small>
                </div>
                {showDetailsButton && (
                    <button onClick={() => navigate(detailsRoute)} className="btn btn-primary btn-xs">
                        <i className="ti ti-external-link me-1"></i>Details
                    </button>
                )}
            </div>
            <div className="card-body">
                {loading ? (
                    <div className="text-center py-5">
                        <span className="spinner-border spinner-border-sm"></span>
                    </div>
                ) : downtimeCategories.length === 0 || totalDowntime === 0 ? (
                    <div className="text-center text-muted py-5">
                        <i className="ti ti-clock-pause fs-1 mb-3 d-block"></i>
                        <p className="mb-0">No downtime recorded</p>
                    </div>
                ) : (
                    <>
                        {/* Total Summary */}
                        <div className="alert alert-light border mb-4">
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <small className="text-muted d-block mb-1">Total Downtime</small>
                                    <h4 className="mb-0">{formatDuration(totalDowntime)}</h4>
                                </div>
                                <span className="avatar avatar-lg bg-soft-danger text-danger">
                                    <i className="ti ti-clock-pause fs-4"></i>
                                </span>
                            </div>
                        </div>

                        {/* Category Breakdown */}
                        <div className="d-flex flex-column gap-3">
                            {downtimeCategories.map(cat => {
                                const percentage = totalDowntime > 0 ? ((cat.value / totalDowntime) * 100).toFixed(1) : 0;
                                return (
                                    <div 
                                        key={cat.name} 
                                        className="border rounded p-3" 
                                        style={{
                                            transition: 'all 0.3s ease',
                                            cursor: 'pointer'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
                                        onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                                    >
                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                            <div className="d-flex align-items-center gap-2">
                                                <span className="avatar avatar-sm" style={{ backgroundColor: cat.color }}>
                                                    <i className={`ti ${cat.name === 'No Incidents Logged' ? 'ti-question-mark' : 'ti-alert-triangle'} text-white`}></i>
                                                </span>
                                                <span className="fw-semibold">{cat.name}</span>
                                            </div>
                                            <div className="text-end">
                                                <div className="fw-bold">{formatDuration(cat.value)}</div>
                                                <small className="text-muted">{percentage}%</small>
                                            </div>
                                        </div>
                                        <div className="progress" style={{ height: 8, backgroundColor: '#f3f4f6' }}>
                                            <div
                                                className="progress-bar"
                                                role="progressbar"
                                                style={{
                                                    width: `${percentage}%`,
                                                    backgroundColor: cat.color,
                                                    transition: 'width 0.8s ease'
                                                }}
                                                aria-valuenow={percentage}
                                                aria-valuemin="0"
                                                aria-valuemax="100"
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default DowntimeBreakdownList;
