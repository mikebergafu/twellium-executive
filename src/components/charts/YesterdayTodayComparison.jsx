import React, { useEffect, useState } from 'react';
import { productionApi } from '../../api/production';

const YesterdayTodayComparison = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await productionApi.getTodayYesterdayComparison();
                const d = res.data;
                setData(d);
            } catch (e) { console.error('Comparison fetch error:', e); }
            finally { setLoading(false); }
        };
        fetchData();
    }, []);

    const Metric = ({ label, sublabel, icon, todayVal, yesterdayVal, unit = '%', suffix = '', invertColor, hideComparison, hideTodayIfZero }) => {
        const diff = todayVal - yesterdayVal;
        const isUp = diff > 0;
        const good = invertColor ? !isUp : isUp;
        const color = diff === 0 ? '#64748b' : good ? '#16a34a' : '#dc2626';
        const bg = diff === 0 ? '#f1f5f9' : good ? '#f0fdf4' : '#fef2f2';
        const fmt = (v) => (unit === '%' ? v.toFixed(2) + '%' : v.toLocaleString()) + suffix;
        const deltaLabel = unit === '%'
            ? `${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`
            : (yesterdayVal === 0 ? '—' : `${Math.abs(((todayVal - yesterdayVal) / yesterdayVal) * 100).toFixed(1)}%`);
        return (
            <div style={{ flex: '1 1 0', minWidth: 0 }}>
                <div className="rounded-3 px-2 py-2 h-100" style={{ background: bg, border: `1px solid ${diff === 0 ? '#e2e8f0' : good ? '#bbf7d0' : '#fecaca'}` }}>
                    <div className="d-flex align-items-center mb-1">
                        <i className={`ti ${icon} me-1`} style={{ fontSize: '0.9rem', color: '#64748b' }}></i>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>{label}</span>
                        {sublabel && <span style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 500, marginLeft: 4 }}>{sublabel}</span>}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600 }}>Yesterday</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#475569', lineHeight: 1 }}>{fmt(yesterdayVal)}</div>
                    {!(hideTodayIfZero && todayVal === 0) && <>
                    <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600, marginTop: 4 }}>Today</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{fmt(todayVal)}</div>
                    </>}
                    {!hideComparison && (
                        <div className="d-flex align-items-center mt-1 gap-1">
                            <span className="d-inline-flex align-items-center gap-1 rounded-pill px-1 py-0" style={{ background: '#fff', fontSize: '0.7rem', fontWeight: 700, color }}>
                                <i className={`ti ${isUp ? 'ti-arrow-up' : diff < 0 ? 'ti-arrow-down' : 'ti-minus'}`}></i>
                                {deltaLabel}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const fmtLabel = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    if (loading) return <div className="card mb-3"><div className="card-body text-center py-3"><div className="spinner-border text-primary" /></div></div>;
    if (!data) return null;

    const t = data.today || {};
    const y = data.yesterday || {};

    return (
        <div className="card mb-3">
            <div className="card-header d-flex align-items-center justify-content-between py-2">
                <h6 className="mb-0 fw-bold">
                    <i className="ti ti-arrows-exchange me-2 text-primary"></i>Yesterday vs Today
                    <span className="ms-2 fw-normal" style={{ fontSize: '0.8rem', color: '#64748b' }}>{fmtLabel(yesterday)} / {fmtLabel(today)}</span>
                </h6>
                <span className="d-inline-flex align-items-center gap-1">
                    <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#22c55e', animation: 'livePulse 1.5s ease-in-out infinite' }}></span>
                    <span style={{ fontSize: '0.8rem', color: '#22c55e', fontWeight: 700 }}>LIVE</span>
                    <style>{`@keyframes livePulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.7)}}`}</style>
                </span>
            </div>
            <div className="card-body py-3">
                <div className="d-flex flex-nowrap gap-2" style={{ overflowX: 'auto' }}>
                    <Metric label="OEE" sublabel="Weighted Avg." icon="ti-gauge" todayVal={t.oee || 0} yesterdayVal={y.oee || 0} />
                    <Metric label="Output" icon="ti-bottle" todayVal={t.total_output || 0} yesterdayVal={y.total_output || 0} unit="n" hideComparison hideTodayIfZero />
                    <Metric label="Downtime" icon="ti-clock-pause" todayVal={t.downtime || 0} yesterdayVal={y.downtime || 0} unit="n" suffix=" min" invertColor hideComparison />
                    <Metric label="Availability" sublabel="Weighted" icon="ti-clock-check" todayVal={t.availability_weighted_avg || 0} yesterdayVal={y.availability_weighted_avg || 0} />
                    <Metric label="Quality" sublabel="Weighted" icon="ti-rosette-discount-check" todayVal={t.quality_weighted_avg || 0} yesterdayVal={y.quality_weighted_avg || 0} />
                    <Metric label="Performance" sublabel="Weighted" icon="ti-activity" todayVal={t.efficiency_weighted_avg || 0} yesterdayVal={y.efficiency_weighted_avg || 0} />
                </div>
            </div>
        </div>
    );
};

export default YesterdayTodayComparison;
