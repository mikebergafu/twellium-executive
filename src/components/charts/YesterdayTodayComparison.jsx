import React, { useEffect, useState, useMemo } from 'react';
import { productionApi } from '../../api/production';

const clamp = (v) => Math.min(100, Math.max(0, v));

const fetchDayData = async (dateStr) => {
    const res = await productionApi.getOeeSummary({ production_date: dateStr });
    return (Array.isArray(res.data) ? res.data : (res.data?.results || []))
        .filter(r => !r.pet_name?.toLowerCase().includes('can'));
};

const YesterdayTodayComparison = () => {
    const [yesterdayData, setYesterdayData] = useState([]);
    const [todayData, setTodayData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const today = new Date();
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                const fmt = (d) => d.toISOString().split('T')[0];
                const [yData, tData] = await Promise.all([
                    fetchDayData(fmt(yesterday)),
                    fetchDayData(fmt(today)),
                ]);
                setYesterdayData(yData);
                setTodayData(tData);
            } catch (e) { console.error('Comparison fetch error:', e); }
            finally { setLoading(false); }
        };
        fetchData();
    }, []);

    const data = useMemo(() => {
        const agg = (reports, includeAll = false) => {
            if (!reports.length) return { efficiency: 0, availability: 0, quality: 0, performance: 0, production: 0, downtime: 0, lines: 0 };
            const active = includeAll ? reports : reports.filter(r => (r.total_bottles_produced || 0) > 0);
            const n = active.length || 1;
            const availability = active.reduce((s, r) => s + (parseFloat(r.metrics?.availability) || 0), 0) / n;
            const performance = active.reduce((s, r) => s + (parseFloat(r.metrics?.efficiency) || 0), 0) / n;
            const quality = active.reduce((s, r) => s + (parseFloat(r.metrics?.quality) || 0), 0) / n;
            const oee = active.reduce((s, r) => s + (parseFloat(r.metrics?.oee) || 0), 0) / n;
            const production = reports.reduce((s, r) => s + (r.total_bottles_produced || 0), 0);
            const downtime = reports.reduce((s, r) => s + (r.metrics?.details?.total_downtime_mins || 0), 0);
            const lines = new Set(reports.map(r => r.pet_name).filter(Boolean)).size;
            return { efficiency: clamp(oee), availability: clamp(availability), quality: clamp(quality), performance: clamp(performance), production, downtime: Math.round(downtime), lines };
        };
        const todayAgg = agg(todayData, true);
        todayAgg.quality = 100;
        todayAgg.efficiency = clamp((todayAgg.availability + todayAgg.performance + todayAgg.quality) / 3);
        return { yesterday: agg(yesterdayData), today: todayAgg };
    }, [yesterdayData, todayData]);

    const Metric = ({ label, sublabel, icon, todayVal, yesterdayVal, unit = '%', suffix = '', invertColor, hideComparison, hideTodayIfZero }) => {
        const diff = todayVal - yesterdayVal;
        const isUp = diff > 0;
        const good = invertColor ? !isUp : isUp;
        const color = diff === 0 ? '#64748b' : good ? '#16a34a' : '#dc2626';
        const bg = diff === 0 ? '#f1f5f9' : good ? '#f0fdf4' : '#fef2f2';
        const fmt = (v) => (unit === '%' ? v.toFixed(1) + '%' : v.toLocaleString()) + suffix;
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
    if (!yesterdayData.length && !todayData.length) return null;

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
                    <Metric label="OEE" sublabel="Weighted Avg." icon="ti-gauge" todayVal={data.today.efficiency} yesterdayVal={data.yesterday.efficiency} />
                    <Metric label="Output" icon="ti-bottle" todayVal={data.today.production} yesterdayVal={data.yesterday.production} unit="n" hideComparison hideTodayIfZero />
                    <Metric label="Downtime" icon="ti-clock-pause" todayVal={data.today.downtime} yesterdayVal={data.yesterday.downtime} unit="n" suffix=" min" invertColor hideComparison />
                    <Metric label="Availability" icon="ti-clock-check" todayVal={data.today.availability} yesterdayVal={data.yesterday.availability} />
                    <Metric label="Quality" icon="ti-rosette-discount-check" todayVal={data.today.quality} yesterdayVal={data.yesterday.quality} />
                    <Metric label="Performance" icon="ti-activity" todayVal={data.today.performance} yesterdayVal={data.yesterday.performance} />
                </div>
            </div>
        </div>
    );
};

export default YesterdayTodayComparison;
