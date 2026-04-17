import React from 'react';

/**
 * Simple Corporate Gauge Chart
 * Clean, professional semi-circle gauge for enterprise dashboards
 */
const CorporateGaugeChart = ({ 
    value, 
    label,
    size = 160,
    lastUpdated = null,
    rawValues = null
}) => {
    const pct = Math.min(100, Math.max(0, value));
    const cx = size / 2;
    const cy = size / 2 + 5;
    const r = 50;
    const startAngle = (Math.PI * 4) / 5;
    const endAngle = Math.PI / 5;
    const range = startAngle - endAngle;
    const needleAngle = startAngle - (range * pct) / 100;

    const polarToCartesian = (angle, radius) => ({
        x: cx + radius * Math.cos(angle),
        y: cy - radius * Math.sin(angle)
    });

    const createArc = (start, end, radius) => {
        const startPoint = polarToCartesian(start, radius);
        const endPoint = polarToCartesian(end, radius);
        const largeArc = Math.abs(start - end) > Math.PI ? 1 : 0;
        return `M ${startPoint.x} ${startPoint.y} A ${radius} ${radius} 0 ${largeArc} 1 ${endPoint.x} ${endPoint.y}`;
    };

    // Simple color based on value
    const getValueColor = (v) => {
        if (v >= 85) return '#16a34a';
        if (v >= 60) return '#d97706';
        return '#dc2626';
    };

    const valueColor = getValueColor(pct);

    return (
        <div className="card border h-100">
            <div className="card-body text-center p-2">
                <h6 className="mb-2 fw-semibold" style={{ fontSize: '0.8rem', color: '#374151' }}>
                    {label}
                </h6>
                
                <svg width={size} height={size * 0.75} viewBox={`0 0 ${size} ${size * 0.75}`}>
                    {/* Background track */}
                    <path 
                        d={createArc(startAngle, endAngle, r)} 
                        fill="none" 
                        stroke="#e5e7eb" 
                        strokeWidth="10" 
                        strokeLinecap="round"
                    />

                    {/* Value arc */}
                    <path 
                        d={createArc(startAngle, needleAngle, r)} 
                        fill="none" 
                        stroke={valueColor} 
                        strokeWidth="10" 
                        strokeLinecap="round"
                    />

                    {/* Tick marks */}
                    {[0, 25, 50, 75, 100].map(tick => {
                        const angle = startAngle - (range * tick) / 100;
                        const inner = polarToCartesian(angle, r + 6);
                        const outer = polarToCartesian(angle, r + 10);
                        
                        return (
                            <line 
                                key={tick} 
                                x1={inner.x} y1={inner.y} 
                                x2={outer.x} y2={outer.y}
                                stroke="#9ca3af" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                            />
                        );
                    })}

                    {/* Tick labels */}
                    {[0, 25, 50, 75, 100].map(tick => {
                        const angle = startAngle - (range * tick) / 100;
                        const pos = polarToCartesian(angle, r + 18);
                        return (
                            <text 
                                key={tick} 
                                x={pos.x} 
                                y={pos.y + 3} 
                                textAnchor="middle" 
                                fontSize="9" 
                                fill="#6b7280"
                                fontWeight="500"
                            >
                                {tick}
                            </text>
                        );
                    })}

                    {/* Needle */}
                    <line 
                        x1={cx} y1={cy} 
                        x2={cx + (r - 8) * Math.cos(needleAngle)} 
                        y2={cy - (r - 8) * Math.sin(needleAngle)}
                        stroke="#374151" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                    />
                    <circle cx={cx} cy={cy} r="4" fill="#374151" />

                    {/* Value display */}
                    <text 
                        x={cx} 
                        y={cy + 20} 
                        textAnchor="middle" 
                        fontSize="18" 
                        fontWeight="700" 
                        fill="#111827"
                    >
                        {pct.toFixed(1)}%
                    </text>
                </svg>

                {/* Status indicator */}
                <div className="mt-1">
                    {pct >= 85 ? (
                        <span className="badge bg-success bg-opacity-10 text-success px-2 py-1" style={{ fontSize: '0.65rem' }}>
                            On Target
                        </span>
                    ) : pct >= 60 ? (
                        <span className="badge bg-warning bg-opacity-10 text-warning px-2 py-1" style={{ fontSize: '0.65rem' }}>
                            Acceptable
                        </span>
                    ) : (
                        <span className="badge bg-danger bg-opacity-10 text-danger px-2 py-1" style={{ fontSize: '0.65rem' }}>
                            Below Target
                        </span>
                    )}
                </div>
                
                {/* Raw values */}
                {rawValues && (
                    <div className="mt-2 text-start" style={{ fontSize: '0.65rem', color: '#6b7280', lineHeight: 1.6 }}>
                        <div><strong>Planned:</strong> {Number(rawValues.plannedTime || 0).toFixed(0)} min</div>
                        <div><strong>Total DT:</strong> {Number(rawValues.totalDowntime || 0).toFixed(0)} min</div>
                        <div><strong>Planned DT:</strong> {Number(rawValues.plannedDowntime || 0).toFixed(0)} min</div>
                    </div>
                )}
                
                {/* Last updated */}
                {lastUpdated && (
                    <div className="text-muted mt-2" style={{ fontSize: '0.65rem' }}>
                        <i className="ti ti-clock me-1"></i>
                        {lastUpdated}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CorporateGaugeChart;
