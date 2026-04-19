import React, { useEffect, useState, useMemo } from 'react';
import { productionApi } from '../../api/production';

const clamp = (v) => Math.min(100, Math.max(0, v));

const fetchReportsWithMetrics = async (dateStr) => {
    const res = await productionApi.getReports({ start_date: dateStr, end_date: dateStr, page_size: 1000 });
    const reports = (Array.isArray(res.data) ? res.data : []).filter(r => !r.pet_name?.toLowerCase().includes('can'));
    const withMetrics = await Promise.all(reports.map(async (r) => {
        try {
            const m = await productionApi.getReportOeeMetrics(r.id);
            const md = m.data?.data || m.data || {};
            return { ...r, metrics: { availability: md.availability || 0, performance: md.efficiency || 0, quality: md.quality || 0, oee: md.oee || 0, details: md.details || {} } };
        } catch { return { ...r, metrics: null }; }
    }));
    return withMetrics.filter(r => r.metrics);
};

const YesterdayTodayComparison = () => {
    const [yesterdayReports, setYesterdayReports] = useState([]);
    const [todayReports, setTodayReports] = useState([]);
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
                    fetchReportsWithMetrics(fmt(yesterday)),
                    fetchReportsWithMetrics(fmt(today)),
                ]);
                setYesterdayReports(yData);
                setTodayReports(tData);
            } catch (e) { console.error('Comparison fetch error:', e); }
            finally { setLoading(false); }
        };
        fetchData();
    }, []);

    const data = useMemo(() => {
        const agg = (reports) => {
            if (!reports.length) return { efficiency: 0, availability: 0, quality: 0, performance: 0, production: 0, downtime: 0, lines: 0 };
            const totalPlanned = reports.reduce((s, r) => s + (r.metrics?.details?.planned_time_mins || 0), 0);
            const totalDT = reports.reduce((s, r) => s + (r.metrics?.details?.total_downtime_mins || 0), 0);
            const plannedDT = reports.reduce((s, r) => s + (r.metrics?.details?.planned_downtime_mins || 0), 0);
            const prod = reports.reduce((s, r) => s + (r.metrics?.details?.total_output_pcs || 0), 0);
            const avail = reports.reduce((s, r) => s + (r.metrics?.availability || 0), 0) / reports.length;
            const qual = reports.reduce((s, r) => s + (r.metrics?.quality || 0), 0) / reports.length;
            const op = totalPlanned - plannedDT;
            const perf = op > 0 ? ((totalPlanned - totalDT) / op) * 100 : 0;
            const eff = (avail / 100) * (clamp(perf) / 100) * (qual / 100) * 100;
            return { efficiency: clamp(eff), availability: clamp(avail), quality: clamp(qual), performance: clamp(perf), production: prod, downtime: Math.round(totalDT), lines: new Set(reports.map(r => r.pet_name).filter(Boolean)).size };
        };
        return { yesterday: agg(yesterdayReports), today: agg(todayReports) };
    }, [yesterdayReports, todayReports]);

    const Metric = ({ label, icon, todayVal, yesterdayVal, unit = '%', invertColor }) => {
        const diff = todayVal - yesterdayVal;
        const isUp = diff > 0;
        const good = invertColor ? !isUp : isUp;
        const color = diff === 0 ? '#64748b' : good ? '#16a34a' : '#dc2626';
        const bg = diff === 0 ? '#f1f5f9' : good ? '#f0fdf4' : '#fef2f2';
        const fmt = (v) => unit === '%' ? v.toFixed(1) + '%' : v.toLocaleString();
        const deltaLabel = unit === '%'
            ? `${Math.abs(diff).toFixed(1)}pp`
            : (yesterdayVal === 0 ? '—' : `${Math.abs(((todayVal - yesterdayVal) / yesterdayVal) * 100).toFixed(1)}%`);
        return (
            <div className="col">
                <div className="rounded-3 p-3 h-100" style={{ background: bg, border: `1px solid ${diff === 0 ? '#e2e8f0' : good ? '#bbf7d0' : '#fecaca'}` }}>
                    <div className="d-flex align-items-center mb-2">
                        <i className={`ti ${icon} me-2`} style={{ fontSize: '1.1rem', color: '#64748b' }}></i>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>{label}</span>
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{fmt(todayVal)}</div>
                    <div className="d-flex align-items-center mt-2 gap-2">
                        <span className="d-inline-flex align-items-center gap-1 rounded-pill px-2 py-1" style={{ background: '#fff', fontSize: '0.8rem', fontWeight: 700, color }}>
                            <i className={`ti ${isUp ? 'ti-arrow-up' : diff < 0 ? 'ti-arrow-down' : 'ti-minus'}`}></i>
                            {deltaLabel}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>vs yesterday ({fmt(yesterdayVal)})</span>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) return <div className="card mb-3"><div className="card-body text-center py-3"><div className="spinner-border text-primary" /></div></div>;
    if (!yesterdayReports.length && !todayReports.length) return null;

    return (
        <div className="card mb-3">
            <div className="card-header d-flex align-items-center justify-content-between py-2">
                <h6 className="mb-0 fw-bold">
                    <i className="ti ti-arrows-exchange me-2 text-primary"></i>Yesterday vs Today
                </h6>
                <span className="d-inline-flex align-items-center gap-1">
                    <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#22c55e', animation: 'livePulse 1.5s ease-in-out infinite' }}></span>
                    <span style={{ fontSize: '0.8rem', color: '#22c55e', fontWeight: 700 }}>LIVE</span>
                    <style>{`@keyframes livePulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.7)}}`}</style>
                </span>
            </div>
            <div className="card-body py-3">
                <div className="row g-3 row-cols-2 row-cols-lg-4 mb-3">
                    <Metric label="Efficiency" icon="ti-gauge" todayVal={data.today.efficiency} yesterdayVal={data.yesterday.efficiency} />
                    <Metric label="Output (Bottles)" icon="ti-bottle" todayVal={data.today.production} yesterdayVal={data.yesterday.production} unit="n" />
                    <Metric label="Downtime" icon="ti-clock-pause" todayVal={data.today.downtime} yesterdayVal={data.yesterday.downtime} unit="n" invertColor />
                    <Metric label="Active Lines" icon="ti-topology-star-3" todayVal={data.today.lines} yesterdayVal={data.yesterday.lines} unit="n" />
                </div>
                <div className="row g-3 row-cols-3">
                    <Metric label="Availability" icon="ti-clock-check" todayVal={data.today.availability} yesterdayVal={data.yesterday.availability} />
                    <Metric label="Quality" icon="ti-rosette-discount-check" todayVal={data.today.quality} yesterdayVal={data.yesterday.quality} />
                    <Metric label="Performance" icon="ti-activity" todayVal={data.today.performance} yesterdayVal={data.yesterday.performance} />
                </div>
            </div>
        </div>
    );
};

export default YesterdayTodayComparison;
