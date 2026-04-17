import React from 'react';

/**
 * Simple Corporate Stat Card
 * Clean, professional design for enterprise dashboards
 */
const CorporateStatCard = ({ 
    title, 
    value, 
    unit, 
    icon, 
    trend = null,
    subtitle = null,
    lastUpdated = null
}) => {
    return (
        <div className="card h-100 border">
            <div className="card-body">
                <div className="d-flex align-items-start justify-content-between mb-3">
                    <div className="d-flex align-items-center justify-content-center rounded" 
                        style={{ 
                            width: '40px', 
                            height: '40px',
                            backgroundColor: 'rgba(37, 99, 235, 0.1)'
                        }}
                    >
                        <i className={`ti ti-${icon} text-primary fs-5`}></i>
                    </div>
                    {trend !== null && (
                        <div className={`d-flex align-items-center gap-1 ${trend >= 0 ? 'text-success' : 'text-danger'}`} 
                            style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                            {trend >= 0 ? (
                                <i className="ti ti-arrow-up-right"></i>
                            ) : (
                                <i className="ti ti-arrow-down-right"></i>
                            )}
                            {Math.abs(trend)}%
                        </div>
                    )}
                </div>
                
                <div>
                    <p className="text-muted text-uppercase mb-1" 
                        style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.5px' }}>
                        {title}
                    </p>
                    <div className="d-flex align-items-baseline gap-2">
                        <h4 className="mb-0 fw-bold" style={{ fontSize: '1.5rem', color: '#1f2937' }}>
                            {typeof value === 'number' ? value.toLocaleString() : value}
                        </h4>
                        {unit && <span className="text-muted" style={{ fontSize: '0.875rem' }}>{unit}</span>}
                    </div>
                    {subtitle && (
                        <p className="text-muted mb-0 mt-2" style={{ fontSize: '0.75rem' }}>
                            {subtitle}
                        </p>
                    )}
                    {lastUpdated && (
                        <p className="text-muted mb-0 mt-2" style={{ fontSize: '0.65rem' }}>
                            <i className="ti ti-clock me-1"></i>
                            {lastUpdated}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CorporateStatCard;
