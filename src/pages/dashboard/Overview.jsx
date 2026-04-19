import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { productionApi } from '../../api/production';
import { useApiWithFilters } from '../../utils/useApiWithFilters';
import { SkeletonGauges } from '../../components/ui/Skeletons';
import YesterdayTodayComparison from '../../components/charts/YesterdayTodayComparison';

/* ── helpers ─────────────────────────────────────── */
const clamp = (v) => Math.min(100, Math.max(0, v));

/* ── Speed Gauge (admin-style semi-circle) ──────── */
const SpeedGauge = ({ value, color, size = 80 }) => {
    const pct = clamp(value);
    const cx = size / 2, cy = size / 2 + size * 0.04;
    const r = size * 0.35;
    const startA = (Math.PI * 4) / 5, endA = Math.PI / 5;
    const range = startA - endA;
    const needleA = startA - (range * pct) / 100;
    const p = (a, rad) => ({ x: cx + rad * Math.cos(a), y: cy - rad * Math.sin(a) });
    const arc = (s, e) => {
        const sp = p(s, r), ep = p(e, r);
        return `M ${sp.x} ${sp.y} A ${r} ${r} 0 ${Math.abs(s - e) > Math.PI ? 1 : 0} 1 ${ep.x} ${ep.y}`;
    };
    const sw = size * 0.065;
    const np = p(needleA, r - sw * 0.8);
    return (
        <svg width={size} height={size * 0.78} viewBox={`0 0 ${size} ${size * 0.78}`}>
            <path d={arc(startA, endA)} fill="none" stroke="#e5e7eb" strokeWidth={sw} strokeLinecap="round" />
            {pct > 0 && <path d={arc(startA, needleA)} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" />}
            {[0, 25, 50, 75, 100].map(t => {
                const a = startA - (range * t) / 100;
                const inner = p(a, r + sw * 0.5), outer = p(a, r + sw * 1);
                const lp = p(a, r + sw * 2);
                return <g key={t}>
                    <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="#9ca3af" strokeWidth={size * 0.012} strokeLinecap="round" />
                    <text x={lp.x} y={lp.y + 2} textAnchor="middle" fontSize={size * 0.07} fill="#6b7280" fontWeight="500">{t}</text>
                </g>;
            })}
            <line x1={cx} y1={cy} x2={np.x} y2={np.y} stroke="#374151" strokeWidth={size * 0.015} strokeLinecap="round" />
            <circle cx={cx} cy={cy} r={size * 0.025} fill="#374151" />
            <text x={cx} y={cy + size * 0.14} textAnchor="middle" fontSize={size * 0.14} fontWeight="700" fill="#111827">{pct.toFixed(1)}%</text>
        </svg>
    );
};

/* ── OEE Gauge (from twellium-admin) ─────────────── */
const OeeGauge = ({ value, label, calculation, rawValues }) => {
    const pct = clamp(value);
    const size = 200, cx = size / 2, cy = size / 2 + 20, r = 65;
    const startA = (Math.PI * 4) / 5, endA = Math.PI / 5, range = startA - endA;
    const needleA = startA - (range * pct) / 100;
    const p = (a) => ({ x: cx + r * Math.cos(a), y: cy - r * Math.sin(a) });
    const arc = (s, e) => { const sp = p(s), ep = p(e); return `M ${sp.x} ${sp.y} A ${r} ${r} 0 ${Math.abs(s-e)>Math.PI?1:0} 1 ${ep.x} ${ep.y}`; };
    const zones = [{ end: 60, color: '#ef4444' }, { end: 85, color: '#f59e0b' }, { end: 100, color: '#22c55e' }];
    return (
        <div className="d-flex flex-column align-items-center p-2 border rounded-3 shadow-sm" style={{ background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)' }}>
            <h6 className="mb-1 text-center fw-semibold">{label}</h6>
            <div title={calculation || ''} style={{ cursor: 'help' }}>
                <svg width={size} height={size * 0.75} viewBox={`0 0 ${size} ${size * 0.75}`}>
                    <defs><filter id={`sh-${label.replace(/\s/g,'')}`}><feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.2"/></filter></defs>
                    <path d={arc(startA, endA)} fill="none" stroke="#e5e7eb" strokeWidth="24" strokeLinecap="round" />
                    {zones.map((z, i) => { const prev = i === 0 ? 0 : zones[i-1].end; return <path key={i} d={arc(startA-(range*prev)/100, startA-(range*z.end)/100)} fill="none" stroke={z.color} strokeWidth="22" strokeLinecap="round" />; })}
                    {[0,20,40,60,80,100].map(t => { const a = startA-(range*t)/100, inner = p(a), outer = { x: cx+(r+8)*Math.cos(a), y: cy-(r+8)*Math.sin(a) }; return <line key={t} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="#9ca3af" strokeWidth={t%20===0?"2":"1"} strokeLinecap="round" />; })}
                    {[0,25,50,75,100].map(t => { const a = startA-(range*t)/100, pos = { x: cx+(r+20)*Math.cos(a), y: cy-(r+20)*Math.sin(a)+4 }; return <text key={t} x={pos.x} y={pos.y} textAnchor="middle" fontSize="11" fontWeight="600" fill="#6b7280">{t}</text>; })}
                    <g filter={`url(#sh-${label.replace(/\s/g,'')})`}>
                        <line x1={cx} y1={cy} x2={cx+(r-8)*Math.cos(needleA)} y2={cy-(r-8)*Math.sin(needleA)} stroke="#1f2937" strokeWidth="3" strokeLinecap="round" />
                        <circle cx={cx} cy={cy} r="6" fill="#1f2937" /><circle cx={cx} cy={cy} r="3" fill="#fff" />
                    </g>
                    <text x={cx} y={cy+30} textAnchor="middle" fontSize="26" fontWeight="700" fill="#111827">{pct.toFixed(1)}%</text>
                    <text x={cx} y={cy+48} textAnchor="middle" fontSize="13" fontWeight="600" fill="#6b7280">{label}</text>
                </svg>
            </div>
            {rawValues && (
                <div className="mt-3 text-center" style={{ fontSize: '11px', lineHeight: '1.4' }}>
                    {pct === 0 ? (<div className="badge bg-soft-warning text-warning px-2 py-1"><i className="ti ti-alert-circle me-1"></i>{rawValues.reason || 'No data'}</div>)
                    : (<div className="text-muted font-monospace">{rawValues.display}</div>)}
                </div>
            )}
        </div>
    );
};

/* ── component ───────────────────────────────────── */
const Overview = () => {
    const { getParams, filters } = useApiWithFilters();
    const [selectedPet, setSelectedPet] = useState('');
    const [selectedDate, setSelectedDate] = useState('');

    // Independent OEE gauges date filter (defaults to previous day)
    const [oeeDate, setOeeDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return d.toISOString().split('T')[0];
    });
    const [oeeReports, setOeeReports] = useState([]);
    const [oeeLoading, setOeeLoading] = useState(false);
    const [oeeShowDetail, setOeeShowDetail] = useState(false);

    /* Stale-while-revalidate: separate initial vs refresh state */
    const [initialLoading, setInitialLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const hasFetched = useRef(false);
    const abortRef = useRef(null);

    const [rawReports, setRawReports] = useState([]);
    const [rawPets, setRawPets] = useState([]);
    const [rawStoppages, setRawStoppages] = useState([]);
    const [allReports, setAllReports] = useState([]);
    const [hourlyReports, setHourlyReports] = useState([]);
    const [shiftOeeReports, setShiftOeeReports] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [currentShiftInfo, setCurrentShiftInfo] = useState(null);
    const [selectedShiftId, setSelectedShiftId] = useState(null);
    const [selectedLine, setSelectedLine] = useState(null);
    const [showReportsModal, setShowReportsModal] = useState(false);
    const [shiftLoading, setShiftLoading] = useState(false);
    const [shiftFilterDate, setShiftFilterDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [shiftComparisonData, setShiftComparisonData] = useState({});
    const [showShiftComparison, setShowShiftComparison] = useState(false);

    const loadData = useCallback(async () => {
        /* Cancel any in-flight request */
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        /* First load → full skeleton. Subsequent → subtle refresh indicator */
        if (hasFetched.current) {
            setRefreshing(true);
        } else {
            setInitialLoading(true);
        }
        setError(null);

        try {
            const params = getParams();
            const stoppageParams = getParams({}, true);
            
            const todayStr = new Date().toISOString().split('T')[0];
            
            // Fetch shifts from API
            const shiftsRes = await productionApi.getShifts();
            const shiftsData = Array.isArray(shiftsRes?.data) ? shiftsRes.data : [];
            setShifts(shiftsData);
            
            const [reportsRes, petsRes, stoppagesRes] = await Promise.all([
                productionApi.getReports({ ...params, start_date: todayStr, end_date: todayStr, page_size: 1000 }),
                productionApi.getPets(params),
                productionApi.getStoppages(stoppageParams),
            ]);

            if (controller.signal.aborted) return;

            const reportsList = (Array.isArray(reportsRes.data) ? reportsRes.data : []).filter(r => !r.pet_name?.toLowerCase().includes('can'));

            // Batch-fetch OEE metrics for each report
            const reportsWithMetrics = await Promise.all(reportsList.map(async (r) => {
                try {
                    const m = await productionApi.getReportOeeMetrics(r.id);
                    const md = m.data?.data || m.data || {};
                    return { ...r, metrics: { availability: md.availability || 0, performance: md.efficiency || 0, quality: md.quality || 0, oee: md.oee || 0, details: md.details || {} } };
                } catch { return { ...r, metrics: null }; }
            }));

            if (controller.signal.aborted) return;

            const sortByPet = (arr) => arr.sort((a, b) => {
                const aNum = parseInt(a.pet_name?.match(/(\d+)/)?.[0] || '999');
                const bNum = parseInt(b.pet_name?.match(/(\d+)/)?.[0] || '999');
                return aNum - bNum;
            });

            setRawReports(sortByPet(reportsWithMetrics));
            setRawPets((Array.isArray(petsRes.data) ? petsRes.data : []).filter(pet => !pet.pet_name?.toLowerCase().includes('can')));
            setRawStoppages((Array.isArray(stoppagesRes.data) ? stoppagesRes.data : []).filter(s => !(s.pet_name || s.line_name || '').toLowerCase().includes('can')));
            setAllReports(sortByPet(reportsWithMetrics));

            hasFetched.current = true;
        } catch (err) {
            if (err?.name === 'CanceledError' || err?.name === 'AbortError') return;
            setError('Failed to load dashboard data. Please try again.');
        } finally {
            if (!controller.signal.aborted) {
                setInitialLoading(false);
                setRefreshing(false);
            }
        }
    }, [filters]);

    // Fetch OEE data independently based on oeeDate
    useEffect(() => {
        if (!oeeDate) return;
        const fetchOeeData = async () => {
            setOeeLoading(true);
            try {
                const res = await productionApi.getReports({ start_date: oeeDate, end_date: oeeDate, page_size: 1000 });
                const reports = (Array.isArray(res.data) ? res.data : []).filter(r => !r.pet_name?.toLowerCase().includes('can'));
                const withMetrics = await Promise.all(reports.map(async (r) => {
                    try {
                        const m = await productionApi.getReportOeeMetrics(r.id);
                        const md = m.data?.data || m.data || {};
                        return { ...r, metrics: { availability: md.availability || 0, performance: md.efficiency || 0, quality: md.quality || 0, oee: md.oee || 0, details: md.details || {} } };
                    } catch { return { ...r, metrics: null }; }
                }));
                setOeeReports(withMetrics);
            } catch (e) {
                console.error('Error fetching OEE data:', e);
                setOeeReports([]);
            } finally {
                setOeeLoading(false);
            }
        };
        fetchOeeData();
    }, [oeeDate]);

    /* Load shift data separately */
    const loadShiftData = useCallback(async () => {
        if (!shifts.length) return;

        setShiftLoading(true);
        try {
            const now = new Date();
            const currentTime = now.toTimeString().slice(0, 5);
            let todayStr = now.toISOString().split('T')[0];
            
            // If before 6am, use previous day for shift data
            if (currentTime < '06:00') {
                const yesterday = new Date(now);
                yesterday.setDate(yesterday.getDate() - 1);
                todayStr = yesterday.toISOString().split('T')[0];
            }

            // Use shiftFilterDate if set, otherwise use calculated date
            const refDateStr = shiftFilterDate || todayStr;

            // Find which shift the current clock time falls in (for auto-selection)
            const currentShift = shifts.find(shift => {
                const start = shift.start_time?.slice(0, 5);
                const end = shift.end_time?.slice(0, 5);
                if (!start || !end) return false;
                if (start > end) {
                    return currentTime >= start || currentTime < end;
                }
                return currentTime >= start && currentTime < end;
            });

            const targetShift = selectedShiftId
                ? shifts.find(s => s.id === selectedShiftId)
                : (currentShift || shifts[0]);

            if (!targetShift) {
                setShiftLoading(false);
                return;
            }

            // Helper to find the other shift (fallback)
            const otherShift = shifts.find(s => s.id !== targetShift.id);

            setCurrentShiftInfo({
                id: targetShift.id,
                name: targetShift.name,
                start_time: targetShift.start_time,
                end_time: targetShift.end_time,
                lastUpdated: null
            });

            // Calculate shift date range based on shift times
            const shiftStart = targetShift.start_time?.slice(0, 5);
            const shiftEnd = targetShift.end_time?.slice(0, 5);
            
            let startDateTime, endDateTime;
            
            if (shiftStart && shiftEnd && shiftStart > shiftEnd) {
                // Night shift: crosses midnight (e.g., 18:00 to 06:00)
                // Start on refDateStr, end on next day
                const startDate = new Date(refDateStr + 'T' + shiftStart + ':00Z');
                const endDate = new Date(refDateStr + 'T' + shiftEnd + ':59Z');
                endDate.setDate(endDate.getDate() + 1);
                startDateTime = startDate.toISOString().replace(/\\.\\d{3}Z$/, 'Z');
                endDateTime = endDate.toISOString().replace(/\\.\\d{3}Z$/, 'Z');
            } else {
                // Day shift: same day
                startDateTime = `${refDateStr}T${shiftStart || '06:00'}:00Z`;
                endDateTime = `${refDateStr}T${shiftEnd || '18:00'}:59Z`;
            }

            const shiftParams = {
                start_datetime: startDateTime,
                end_datetime: endDateTime,
                shift: targetShift.id
            };

            // Include PET filter if selected
            if (filters.pet) {
                shiftParams.pet = filters.pet;
            }

            const [shiftReportsRes, shiftOeeRes] = await Promise.all([
                productionApi.getStoppagesSummary(shiftParams),
                productionApi.getReports({ start_date: refDateStr, end_date: refDateStr, page_size: 1000 })
            ]);

            // Fetch OEE metrics for each report matching this shift
            let shiftReportsList = (Array.isArray(shiftOeeRes.data) ? shiftOeeRes.data : []).filter(r => !r.pet_name?.toLowerCase().includes('can') && r.shift_name === targetShift.name);

            // If current shift has no data and user didn't manually select, fall back to previous shift
            if (shiftReportsList.length === 0 && !selectedShiftId && otherShift) {
                shiftReportsList = (Array.isArray(shiftOeeRes.data) ? shiftOeeRes.data : []).filter(r => !r.pet_name?.toLowerCase().includes('can') && r.shift_name === otherShift.name);
                if (shiftReportsList.length > 0) {
                    setCurrentShiftInfo(prev => ({ ...prev, id: otherShift.id, name: otherShift.name, start_time: otherShift.start_time, end_time: otherShift.end_time }));
                }
            }
            const oeeData = await Promise.all(shiftReportsList.map(async (r) => {
                try {
                    const m = await productionApi.getReportOeeMetrics(r.id);
                    const md = m.data?.data || m.data || {};
                    return { ...r, metrics: { availability: md.availability || 0, performance: md.efficiency || 0, quality: md.quality || 0, oee: md.oee || 0, details: md.details || {} } };
                } catch { return { ...r, metrics: null }; }
            }));
            setShiftOeeReports(oeeData.filter(r => r.metrics));
            
            // Handle nested response: response.data is already unwrapped
            const outerData = shiftReportsRes?.data || {};
            const stoppagesArray = outerData.data || outerData.results || [];
            const shiftReports = stoppagesArray.filter(r => !r.pet_name?.toLowerCase().includes('can'));
            
            const overallTotals = outerData.overall_totals || {};
            const stoppagesSummary = {
                total_production: overallTotals.bottles_produced || 0,
                total_downtime: overallTotals.downtime_minutes || 0,
                total_stoppages: outerData.count || 0,
                avg_efficiency: parseFloat(overallTotals.efficiency) || 0,
                downtime_breakdown: outerData.downtime_breakdown || {},
                top_stoppage_reasons: outerData.top_stoppage_reasons || [],
                shift_start_time: outerData.shift_start_time,
                shift_end_time: outerData.shift_end_time,
            };

            // Get the latest log_time from the reports
            const latestTime = shiftReports.reduce((latest, report) => {
                if (report.log_time) {
                    const time = new Date(report.log_date + 'T' + report.log_time);
                    return !latest || time > latest ? time : latest;
                }
                return latest;
            }, null);

            if (latestTime) {
                setCurrentShiftInfo(prev => ({
                    ...prev,
                    lastUpdated: latestTime.toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: true
                    })
                }));
            }

            const sortByPet = (arr) => arr.sort((a, b) => {
                const aNum = parseInt(a.pet_name?.match(/(\d+)/)?.[0] || '999');
                const bNum = parseInt(b.pet_name?.match(/(\d+)/)?.[0] || '999');
                return aNum - bNum;
            });

            setHourlyReports(sortByPet(shiftReports));
            
            // Store comparison data for shift comparison feature
            setShiftComparisonData(prev => ({
                ...prev,
                [`${refDateStr}_${targetShift.id}`]: {
                    date: refDateStr,
                    shift: targetShift,
                    reports: shiftReports,
                    summary: stoppagesSummary,
                    timestamp: new Date().toISOString()
                }
            }));
        } catch (err) {
            console.error('Failed to load shift data:', err);
        } finally {
            setShiftLoading(false);
        }
    }, [shifts, selectedShiftId, shiftFilterDate, filters]);

    /* Re-fetch whenever filters change */
    useEffect(() => {
        loadData();
        return () => { if (abortRef.current) abortRef.current.abort(); };
    }, [loadData]);
    
    /* Load shift data when shifts or selectedShiftId changes */
    useEffect(() => {
        loadShiftData();
    }, [loadShiftData]);

    /* PETs available for the selected date (derived from reports) */
    const availablePets = useMemo(() => {
        return rawPets;
    }, [rawPets]);

    /* ── Derived data (recomputed when filter or raw data changes) ── */
    const { stats, oee, oeeByLine, oeeDetailReports, downtimeCategories } = useMemo(() => {
        let reports = oeeReports.length > 0 ? oeeReports : rawReports;
        if (selectedPet) {
            reports = reports.filter(r => r.pet_name === selectedPet);
        }

        let stoppages = rawStoppages;
        if (selectedPet) {
            stoppages = stoppages.filter(s => (s.pet_name || s.line_name || '') === selectedPet);
        }

        /* Stats from reports (source of truth for downtime) */
        const totalDowntime = reports.reduce((s, r) => s + (r.metrics?.details?.total_downtime_mins || 0), 0);
        const mechDowntime = reports.reduce((s, r) => s + (r.metrics?.details?.mechanical_downtime_mins || 0), 0);
        const plannedDowntime = reports.reduce((s, r) => s + (r.metrics?.details?.planned_downtime_mins || 0), 0);

        const totalProduced = reports.reduce((s, r) => s + (r.metrics?.details?.total_output_pcs || 0), 0);
        const activeLines = selectedPet ? 1 : new Set(reports.map(r => r.pet_name).filter(Boolean)).size;

        const stats = {
            activeLines,
            shiftsStarted: reports.length,
            totalDowntime: Math.round(totalDowntime),
            mechDowntime: Math.round(mechDowntime),
            plannedDowntime: Math.round(plannedDowntime),
            stoppagesToday: stoppages.length,
            recentReports: reports.length,
            totalProduced,
        };

        /* Global OEE from API */
        const totalPlannedMins = reports.reduce((s, r) => s + (r.metrics?.details?.planned_time_mins || 0), 0);
        const totalRejects = reports.reduce((s, r) => s + (r.metrics?.details?.rejects_pcs || 0), 0);

        const availability = reports.length > 0 ? reports.reduce((s, r) => s + (r.metrics?.availability || 0), 0) / reports.length : 0;
        const performance = reports.length > 0 ? reports.reduce((s, r) => s + (r.metrics?.performance || 0), 0) / reports.length : 0;
        const quality = reports.length > 0 ? reports.reduce((s, r) => s + (r.metrics?.quality || 0), 0) / reports.length : 0;
        const oeeValue = reports.length > 0 ? (clamp(availability) / 100) * (clamp(performance) / 100) * (clamp(quality) / 100) * 100 : 0;

        const oee = {
            availability: clamp(availability),
            quality: clamp(quality),
            performance: clamp(performance),
            oee: clamp(oeeValue),
            rawValues: {
                plannedMins: totalPlannedMins,
                totalDowntimeMins: totalDowntime,
                mechDowntimeMins: mechDowntime,
                plannedDowntimeMins: plannedDowntime,
                totalProduction: totalProduced,
                fillerRejects: totalRejects,
            }
        };

        /* OEE by Line from API */
        const lineMap = {};
        reports.forEach(r => {
            const name = r.pet_name;
            if (!lineMap[name]) {
                lineMap[name] = { name, reports: 0, availability: 0, quality: 0, performance: 0, oee: 0, production: 0, dates: [], plannedMins: 0, totalDowntimeMins: 0, plannedDowntimeMins: 0 };
            }
            lineMap[name].reports += 1;
            lineMap[name].availability += r.metrics?.availability || 0;
            lineMap[name].quality += r.metrics?.quality || 0;
            lineMap[name].performance += r.metrics?.performance || 0;
            lineMap[name].oee += r.metrics?.oee || 0;
            lineMap[name].production += r.metrics?.details?.total_output_pcs || 0;
            lineMap[name].plannedMins += r.metrics?.details?.planned_time_mins || 0;
            lineMap[name].totalDowntimeMins += r.metrics?.details?.total_downtime_mins || 0;
            lineMap[name].plannedDowntimeMins += r.metrics?.details?.planned_downtime_mins || 0;
            if (r.report_code) lineMap[name].dates.push({ code: r.report_code, shift: r.shift_name });
        });

        const oeeByLine = Object.values(lineMap).map(l => {
            // Pick the entry with the most recent date from report_codes (format: PR-YYYY-MM-DD-SHIFT)
            const latest = l.dates.reduce((best, entry) => {
                const match = entry.code.match(/PR-(\d{4}-\d{2}-\d{2})/);
                if (!match) return best;
                return !best || match[1] > best.date ? { date: match[1], shift: entry.shift } : best;
            }, null);
            return {
                name: l.name,
                reports: l.reports,
                availability: clamp(l.availability / l.reports),
                quality: clamp(l.quality / l.reports),
                performance: clamp((l.plannedMins - l.plannedDowntimeMins) > 0 ? ((l.plannedMins - l.totalDowntimeMins) / (l.plannedMins - l.plannedDowntimeMins)) * 100 : 0),
                oee: clamp(l.oee / l.reports),
                production: l.production,
                date: latest?.date || null,
                shift: latest?.shift || null,
            };
        }).sort((a, b) => {
            const aNum = parseInt(a.name?.match(/(\d+)/)?.[0] || '999');
            const bNum = parseInt(b.name?.match(/(\d+)/)?.[0] || '999');
            return aNum - bNum;
        });

        /* If a specific PET is selected, use its OEE */
        let displayOee = oee;
        if (selectedPet && oeeByLine.length > 0) {
            const selectedLineOee = oeeByLine[0];
            const selectedReports = reports.filter(r => r.pet_name === selectedPet);
            const linePlannedMins = selectedReports.reduce((s, r) => s + (r.metrics?.details?.planned_time_mins || 0), 0);
            const lineDowntime = selectedReports.reduce((s, r) => s + (r.metrics?.details?.total_downtime_mins || 0), 0);
            const lineMechDowntime = selectedReports.reduce((s, r) => s + (r.metrics?.details?.mechanical_downtime_mins || 0), 0);
            const linePlannedDowntime = selectedReports.reduce((s, r) => s + (r.metrics?.details?.planned_downtime_mins || 0), 0);
            const lineProduced = selectedReports.reduce((s, r) => s + (r.metrics?.details?.total_output_pcs || 0), 0);
            const lineRejects = selectedReports.reduce((s, r) => s + (r.metrics?.details?.rejects_pcs || 0), 0);

            displayOee = {
                availability: selectedLineOee.availability,
                quality: selectedLineOee.quality,
                performance: selectedLineOee.performance,
                oee: selectedLineOee.oee,
                rawValues: {
                    plannedMins: linePlannedMins,
                    totalDowntimeMins: lineDowntime,
                    mechDowntimeMins: lineMechDowntime,
                    plannedDowntimeMins: linePlannedDowntime,
                    totalProduction: lineProduced,
                    fillerRejects: lineRejects,
                }
            };
        }

        /* Downtime breakdown from stoppages incidents */
        const incidentMap = {};
        stoppages.forEach(stoppage => {
            (stoppage.incidents || []).forEach(incident => {
                const category = incident.downtime_category_name || 'Uncategorized';
                const duration = parseFloat(incident.incident_duration || 0);
                
                if (!incidentMap[category]) {
                    incidentMap[category] = 0;
                }
                incidentMap[category] += duration;
            });
        });

        const categoryColors = {
            'Mechanical Downtime': '#ef4444',
            'Planned Downtime': '#3b82f6',
            'Electrical': '#f59e0b',
            'Quality': '#8b5cf6',
            'Material': '#10b981',
            'Other': '#6b7280',
        };

        const downtimeCategories = Object.entries(incidentMap)
            .map(([name, value]) => ({
                name,
                value: Math.round(value),
                color: categoryColors[name] || categoryColors['Other']
            }))
            .filter(d => d.value > 0)
            .sort((a, b) => b.value - a.value);

        // Individual report rows for detail view
        const oeeDetailReports = reports.map(r => {
            const match = r.report_code?.match(/PR-(\d{4}-\d{2}-\d{2})/);
            return {
                name: r.pet_name,
                report_code: r.report_code || '-',
                date: match ? match[1] : r.log_date || '-',
                shift: r.shift_name || '-',
                availability: clamp(r.metrics?.availability || 0),
                quality: clamp(r.metrics?.quality || 0),
                performance: clamp((() => { const pt = r.metrics?.details?.planned_time_mins || 0; const td = r.metrics?.details?.total_downtime_mins || 0; const pd = r.metrics?.details?.planned_downtime_mins || 0; const op = pt - pd; return op > 0 ? ((pt - td) / op) * 100 : 0; })()),
                oee: clamp(r.metrics?.oee || 0),
                production: r.metrics?.details?.total_output_pcs || 0,
            };
        }).sort((a, b) => {
            const aNum = parseInt(a.name?.match(/(\d+)/)?.[0] || '999');
            const bNum = parseInt(b.name?.match(/(\d+)/)?.[0] || '999');
            return aNum - bNum || a.shift.localeCompare(b.shift);
        });

        return { stats, oee: displayOee, oeeByLine, oeeDetailReports, downtimeCategories };
    }, [oeeReports, rawReports, rawPets, rawStoppages, selectedPet, selectedDate]);

    /* Hourly OEE by Line for per-PET gauges */
    const hourlyOeeByLine = useMemo(() => {
        // Compute shift duration in minutes from currentShiftInfo
        let shiftMins = 0;
        if (currentShiftInfo?.start_time && currentShiftInfo?.end_time) {
            const [sh, sm] = currentShiftInfo.start_time.slice(0, 5).split(':').map(Number);
            const [eh, em] = currentShiftInfo.end_time.slice(0, 5).split(':').map(Number);
            shiftMins = (eh * 60 + em) - (sh * 60 + sm);
            if (shiftMins <= 0) shiftMins += 24 * 60; // crosses midnight
        }

        // Build OEE metrics lookup from shiftOeeReports (has planned_time, downtime, planned_downtime)
        const oeeByPet = {};
        shiftOeeReports.forEach(r => {
            const name = r.pet_name?.toLowerCase();
            if (!name) return;
            if (!oeeByPet[name]) oeeByPet[name] = { plannedTime: 0, totalDowntime: 0, plannedDowntime: 0, mechDowntime: 0 };
            oeeByPet[name].plannedTime += r.metrics?.details?.planned_time_mins || 0;
            oeeByPet[name].totalDowntime += r.metrics?.details?.total_downtime_mins || 0;
            oeeByPet[name].plannedDowntime += r.metrics?.details?.planned_downtime_mins || 0;
            oeeByPet[name].mechDowntime += r.metrics?.details?.mechanical_downtime_mins || 0;
        });

        const lineMap = {};
        
        // Start with all available PETs from rawPets
        rawPets.forEach(pet => {
            lineMap[pet.pet_name] = { 
                name: pet.pet_name, 
                reports: 0, 
                oee: 0, 
                production: 0, 
                downtime: 0,
                plannedDowntime: 0,
                plannedTimeMins: 0,
                efficiency: 0
            };
        });
        
        // Add data from hourly reports (from stoppages summary endpoint)
        hourlyReports.forEach(r => {
            const name = r.pet_name;
            // Create entry if it doesn't exist (for cases where rawPets is empty)
            if (!lineMap[name]) {
                lineMap[name] = { 
                    name: name, 
                    reports: 0, 
                    oee: 0, 
                    production: 0, 
                    downtime: 0,
                    plannedDowntime: 0,
                    plannedTimeMins: 0,
                    efficiency: 0
                };
            }
            
            if (lineMap[name]) {
                lineMap[name].reports += 1;
                // Use efficiency from API response (convert string to number), fallback to OEE from metrics
                const efficiency = parseFloat(r.efficiency) || r.metrics?.oee || 0;
                lineMap[name].oee += efficiency;
                lineMap[name].production += r.bottles_produced || r.total_bottles_produced || r.metrics?.details?.total_output_pcs || 0;
                lineMap[name].downtime += r.downtime_minutes || r.metrics?.details?.total_downtime_mins || 0;
                lineMap[name].plannedDowntime += r.planned_downtime_minutes || r.metrics?.details?.planned_downtime_mins || 0;
                lineMap[name].plannedTimeMins += r.metrics?.details?.planned_time_mins || 0;
                
                // Track last updated time
                if (r.log_time) {
                    const time = new Date(r.log_date + 'T' + r.log_time);
                    if (!lineMap[name].lastUpdated || time > lineMap[name].lastUpdated) {
                        lineMap[name].lastUpdated = time;
                    }
                }
            }
        });

        // Also populate from reports data (shiftOeeReports) for production/downtime when stoppages summary is empty
        shiftOeeReports.forEach(r => {
            const name = r.pet_name;
            if (!name) return;
            if (!lineMap[name]) {
                lineMap[name] = { name, reports: 0, oee: 0, production: 0, downtime: 0, plannedDowntime: 0, plannedTimeMins: 0, efficiency: 0 };
            }
            const l = lineMap[name];
            if (l.reports === 0) {
                // Only fill from reports if stoppages didn't provide data
                l.reports = 1;
                l.production = r.total_bottles_produced || r.metrics?.details?.total_output_pcs || 0;
                l.downtime = r.total_downtime_minutes || r.metrics?.details?.total_downtime_mins || 0;
                l.plannedDowntime = r.metrics?.details?.planned_downtime_mins || 0;
                l.plannedTimeMins = r.metrics?.details?.planned_time_mins || 0;
                l.oee = r.metrics?.oee || 0;
            }
        });

        // Compute elapsed time since shift start
        let elapsedMins = shiftMins;
        if (currentShiftInfo?.start_time && shiftFilterDate) {
            const start = new Date(`${shiftFilterDate}T${currentShiftInfo.start_time.slice(0,5)}:00`);
            const now = new Date();
            const elapsed = Math.round((now - start) / 60000);
            if (elapsed > 0 && elapsed < shiftMins) elapsedMins = elapsed;
        }

        return Object.values(lineMap).map(l => {
            // Performance uses elapsed time instead of full planned time
            const oee = oeeByPet[l.name?.toLowerCase()];
            const stoppages = rawStoppages.filter(s => s.pet_name === l.name && (s.report_code || '').toUpperCase().includes(currentShiftInfo?.name?.toUpperCase())).length;
            const actualTime = stoppages * 60;
            const totalDT = oee?.totalDowntime > 0 ? oee.totalDowntime : l.downtime;
            const perf = actualTime > 0 ? ((actualTime - totalDT) / actualTime) * 100 : 0;
            const plannedTime = oee?.plannedTime > 0 ? oee.plannedTime : (l.plannedTimeMins > 0 ? l.plannedTimeMins : shiftMins * l.reports);
            return {
            name: l.name,
            reports: l.reports,
            oee: l.reports > 0 ? clamp(l.oee / l.reports) : 0,
            performance: clamp(perf),
            perfRaw: { plannedTime, totalDowntime: totalDT, mechDowntime: oee?.mechDowntime || 0 },
            production: l.production,
            downtime: l.downtime,
            stoppageCount: rawStoppages.filter(s => s.pet_name === l.name && (s.report_code || '').toUpperCase().includes(currentShiftInfo?.name?.toUpperCase())).length,
            lastUpdated: l.lastUpdated ? l.lastUpdated.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            }) : null,
            };
        }).sort((a, b) => {
            const aNum = parseInt(a.name?.match(/(\d+)/)?.[0] || '999');
            const bNum = parseInt(b.name?.match(/(\d+)/)?.[0] || '999');
            return aNum - bNum;
        });
    }, [hourlyReports, rawPets, rawStoppages, currentShiftInfo, shiftOeeReports, shiftFilterDate]);

    const gaugeColor = (v) => v >= 85 ? '#22c55e' : v >= 60 ? '#f59e0b' : '#ef4444';
    const isLoading = initialLoading || refreshing;

    const formatN = (n) => (n ?? 0).toLocaleString();
    const activeDateLabel = new Date(oeeDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    const shiftDateLabel = new Date(shiftFilterDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const runningLinesCount = hourlyOeeByLine.filter(line => line.reports > 0 && line.production > 0).length;
    return (
        <div style={{ background: '#e9eff6', minHeight: '100vh', padding: '10px 14px' }}>
            {/* ── Top Bar ─────────────────────────── */}
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2 pb-2" style={{ borderBottom: '1px solid #d7deea' }}>
                <div className="d-flex align-items-center gap-3">
                    <img src="/logo.jpeg" alt="Logo" style={{ height: 42, borderRadius: 8 }} />
                    <div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b' }}>Executive Summary Dashboard</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                    </div>
                </div>
                <div className="d-flex flex-wrap align-items-center gap-2">
                    {isLoading && <span className="spinner-border spinner-border-sm text-primary" />}
                    {currentShiftInfo?.lastUpdated && (
                        <span className="px-2 py-1 rounded-pill" style={{ fontSize: '0.75rem', background: '#fff', color: '#475569' }}>
                            <i className="ti ti-clock me-1"></i>{currentShiftInfo.lastUpdated}
                        </span>
                    )}
                    <button className="btn btn-sm btn-light border-0 shadow-sm" onClick={loadData} disabled={refreshing} title="Refresh data" style={{ borderRadius: '50%', width: 36, height: 36, padding: 0 }}>
                        <i className={`ti ti-refresh${refreshing ? ' spin' : ''}`}></i>
                    </button>
                    <button className="btn btn-sm btn-light border-0 shadow-sm" style={{ borderRadius: '50%', width: 36, height: 36, padding: 0 }}
                        onClick={() => {
                            if (document.fullscreenElement) document.exitFullscreen();
                            else document.documentElement.requestFullscreen();
                        }}
                        title={document.fullscreenElement ? 'Exit Fullscreen' : 'Fullscreen'}>
                        <i className={`ti ti-${document.fullscreenElement ? 'arrows-minimize' : 'arrows-maximize'}`}></i>
                    </button>
                </div>
            </div>

            {/* ── Error ───────────────────────────── */}
            {error && (
                <div className="alert alert-danger d-flex align-items-center mb-3 rounded-3 border-0 shadow-sm">
                    <i className="ti ti-alert-circle fs-5 me-2"></i>
                    <div className="flex-grow-1">{error}</div>
                    <button className="btn btn-sm btn-outline-danger ms-2" onClick={loadData}><i className="ti ti-refresh me-1"></i>Retry</button>
                </div>
            )}

            {/* ── Executive Strip ─────────────────── */}
            <div className="rounded-3 p-2 mb-2" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)', boxShadow: '0 10px 30px rgba(15,23,42,0.25)' }}>
                <div className="row g-2 align-items-stretch">
                    <div className="col-auto">
                        <div className="h-100 rounded-3 p-3 d-flex align-items-center justify-content-between" style={{ background: 'rgba(255,255,255,0.12)' }}>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Overall Equipment Effectiveness</div>
                                <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>{oee.oee.toFixed(1)}%</div>
                                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)' }}>Yesterday</div>
                            </div>
                            <div className="text-end">
                                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.78)' }}>Running Lines</div>
                                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>{runningLinesCount}/{hourlyOeeByLine.length}</div>
                            </div>
                        </div>
                    </div>
                    {[
                        { label: 'Stoppages Today', value: rawStoppages.length, icon: 'ti-alert-triangle', onClick: () => setShowReportsModal(true) },
                        { label: 'Production Time', value: `${(oee.rawValues?.plannedMins ? (oee.rawValues.plannedMins / 60).toFixed(1) : '0')}h`, icon: 'ti-clock-hour-4' },
                        { label: 'Pallets', value: formatN(stats.totalProduced ? Math.round(stats.totalProduced / 2880) : 0), icon: 'ti-package' },
                        { label: 'Packs', value: formatN(stats.totalProduced ? Math.round(stats.totalProduced / 24) : 0), icon: 'ti-packages' },
                        { label: 'Bottles', value: formatN(stats.totalProduced), icon: 'ti-bottle' },
                    ].map(kpi => (
                        <div key={kpi.label} className="col">
                            <div className="h-100 d-flex align-items-center gap-2 p-2 rounded-3" style={{ background: 'rgba(255,255,255,0.12)', cursor: kpi.onClick ? 'pointer' : 'default' }}
                                onClick={kpi.onClick}>
                                <i className={`ti ${kpi.icon}`} style={{ fontSize: '1.5rem', color: 'rgba(255,255,255,0.72)' }}></i>
                                <div>
                                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.72)', fontWeight: 600 }}>{kpi.label}</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{kpi.value}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── OEE Gauges ─────────────────────── */}
            <div className="card mb-2">
                <div className="card-header d-flex align-items-center justify-content-between flex-wrap gap-1 py-1">
                    <h6 className="mb-0">
                        Overall Equipment Effectiveness (Efficiency)
                        <span className="badge bg-soft-info text-info ms-2 fs-11">
                            <i className="ti ti-calendar me-1"></i>{oeeDate}
                        </span>
                        <span className="badge bg-soft-primary text-primary ms-2 fs-11">
                            <i className="ti ti-file-text me-1"></i>{rawStoppages.length} stoppage{rawStoppages.length !== 1 ? 's' : ''} today
                        </span>
                    </h6>
                    <div className="d-flex align-items-center gap-2">
                        <input type="date" className="form-control form-control-sm" value={oeeDate}
                            onChange={(e) => setOeeDate(e.target.value)}
                            max={new Date(Date.now() - 86400000).toISOString().split('T')[0]}
                            style={{ width: 'auto' }} />
                        <button className="btn btn-sm btn-outline-primary" onClick={() => setShowReportsModal(true)}>
                            <i className="ti ti-alert-triangle me-1"></i>View Stoppages
                        </button>
                    </div>
                </div>
                <div className="card-body py-2">
                    {oeeLoading ? (
                        <div className="text-center py-3"><div className="spinner-border text-primary" role="status" /></div>
                    ) : (
                    <div className="row g-2">
                        <div className="col-lg-4 col-sm-6 d-flex justify-content-center">
                            <OeeGauge value={oee.availability} label="Availability"
                                calculation={oee.rawValues ? `(${Number(oee.rawValues.plannedMins||0).toFixed(0)} - ${Number(oee.rawValues.totalDowntimeMins||0).toFixed(0)}) / (${Number(oee.rawValues.plannedMins||0).toFixed(0)} - ${Number(oee.rawValues.mechDowntimeMins||0).toFixed(0)}) × 100 = ${oee.availability.toFixed(1)}%` : ''}
                                rawValues={oee.rawValues ? { display: `(${Number(oee.rawValues.plannedMins||0).toFixed(0)} - ${Number(oee.rawValues.totalDowntimeMins||0).toFixed(0)}) / (${Number(oee.rawValues.plannedMins||0).toFixed(0)} - ${Number(oee.rawValues.mechDowntimeMins||0).toFixed(0)}) × 100`, reason: oee.availability === 0 ? (oee.rawValues.plannedMins === 0 ? 'Planned Time = 0' : 'Availability = 0%') : null } : null} />
                        </div>
                        <div className="col-lg-4 col-sm-6 d-flex justify-content-center">
                            <OeeGauge value={oee.quality} label="Quality"
                                calculation={oee.rawValues ? `(${Number(oee.rawValues.totalProduction||0).toLocaleString()} - ${Number(oee.rawValues.fillerRejects||0).toLocaleString()}) / ${Number(oee.rawValues.totalProduction||0).toLocaleString()} × 100 = ${oee.quality.toFixed(1)}%` : ''}
                                rawValues={oee.rawValues ? { display: `(${Number(oee.rawValues.totalProduction||0).toLocaleString()} - ${Number(oee.rawValues.fillerRejects||0).toLocaleString()}) / ${Number(oee.rawValues.totalProduction||0).toLocaleString()} × 100`, reason: oee.quality === 0 ? (oee.rawValues.totalProduction === 0 ? 'Total Production = 0' : 'Quality = 0%') : null } : null} />
                        </div>
                        <div className="col-lg-4 col-sm-6 d-flex justify-content-center">
                            <OeeGauge value={oee.performance} label="Performance"
                                calculation={oee.rawValues ? `(${Number(oee.rawValues.plannedMins||0).toFixed(0)} - ${Number(oee.rawValues.totalDowntimeMins||0).toFixed(0)}) / (${Number(oee.rawValues.plannedMins||0).toFixed(0)} - ${Number(oee.rawValues.plannedDowntimeMins||0).toFixed(0)}) × 100 = ${oee.performance.toFixed(1)}%` : ''}
                                rawValues={oee.rawValues ? { display: `(${Number(oee.rawValues.plannedMins||0).toFixed(0)} - ${Number(oee.rawValues.totalDowntimeMins||0).toFixed(0)}) / (${Number(oee.rawValues.plannedMins||0).toFixed(0)} - ${Number(oee.rawValues.plannedDowntimeMins||0).toFixed(0)}) × 100`, reason: oee.performance === 0 ? 'Operational Time = 0' : null } : null} />
                        </div>
                    </div>
                    )}
                </div>
            </div>

            {/* ── Yesterday vs Today Comparison ──── */}
            <YesterdayTodayComparison />

            {/* ── Shift + Production Lines ────────── */}
            <div className="rounded-3 px-2 py-1" style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            {/* ── Shift Label ─────────────────────── */}
            <div className="d-flex align-items-center justify-content-between mb-1 flex-wrap gap-1">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                    <h6 className="mb-0 fw-bold" style={{ fontSize: '1.05rem' }}>Shift Production Metrics</h6>
                    {currentShiftInfo && (
                        <span className="badge bg-primary" style={{ fontSize: '0.75rem' }}>{currentShiftInfo.name}</span>
                    )}
                    {currentShiftInfo?.lastUpdated && (
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>| Last Updated: {currentShiftInfo.lastUpdated}</span>
                    )}
                    {currentShiftInfo?.start_time && currentShiftInfo?.end_time && (
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            | Shift: {shiftDateLabel} {currentShiftInfo.start_time.slice(0,5)} - {currentShiftInfo.end_time.slice(0,5)}
                        </span>
                    )}
                </div>
                <div className="d-flex align-items-center gap-2">
                    <input
                        type="date"
                        className="form-control form-control-sm border-0 shadow-sm"
                        value={shiftFilterDate}
                        onChange={(e) => setShiftFilterDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        style={{ width: '150px', background: '#f8fafc' }}
                    />
                    <div className="btn-group btn-group-sm">
                        {shifts.sort((a, b) => a.name === 'DAY' ? -1 : b.name === 'DAY' ? 1 : 0).map(shift => (
                            <button key={shift.id}
                                className={`btn ${currentShiftInfo?.id === shift.id ? 'btn-primary' : 'btn-outline-secondary'}`}
                                onClick={() => setSelectedShiftId(shift.id)}>
                                {shift.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Production Line Cards Grid ──────── */}
            {isLoading ? <SkeletonGauges count={6} /> : (
            <div className="row g-2">
                {/* Individual line cards */}
                {hourlyOeeByLine.map((line) => {
                    const eff = line.reports > 0 ? line.performance : 0;
                    const isRunning = line.reports > 0 && line.production > 0;
                    const borderColor = eff >= 85 ? '#4caf50' : eff >= 60 ? '#ff9800' : eff > 0 ? '#f44336' : '#e0e0e0';
                    return (
                        <div key={line.name} className="col-6 col-md-4 col-xl-2">
                            <div className="rounded-3 p-1 h-100 text-center" style={{ background: `${borderColor}06`, borderLeft: `5px solid ${borderColor}`, boxShadow: '0 2px 4px rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
                                onClick={() => setSelectedLine(line)}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; }}>
                                <SpeedGauge value={eff} color={borderColor} size={140} />
                                <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>{line.name}</div>
                                <span className="px-2 py-0 rounded-pill d-inline-block mb-1" style={{
                                    fontSize: '0.6rem', fontWeight: 600,
                                    background: isRunning ? '#e8f5e9' : '#ffebee',
                                    color: isRunning ? '#2e7d32' : '#c62828'
                                }}>
                                    {isRunning ? 'Running' : 'Stopped'}
                                </span>
                                <div style={{ fontSize: '0.7rem', color: '#555', fontWeight: 600 }}>
                                    <i className="ti ti-bottle me-1"></i>{formatN(Math.round(line.production))}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: 600 }}>
                                    <i className="ti ti-clock-pause me-1"></i>{formatN(Math.round(line.downtime))}m
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#e65100', fontWeight: 600 }}>
                                    <i className="ti ti-alert-triangle me-1"></i>{line.stoppageCount} Hour{line.stoppageCount !== 1 ? 's' : ''} submitted
                                </div>
                                <div style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: 2 }}>tap for details</div>
                            </div>
                        </div>
                    );
                })}
            </div>
            )}
            </div>

            {/* ── PET Details Modal ───────────────── */}
            {selectedLine && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={() => setSelectedLine(null)}>
                    <div className="rounded-4 p-4" style={{ background: '#fff', width: 440, maxWidth: '92vw', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}
                        onClick={e => e.stopPropagation()}>
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <h5 className="mb-0 fw-bold">{selectedLine.name}</h5>
                            <button className="btn btn-sm btn-light" onClick={() => setSelectedLine(null)} style={{ borderRadius: '50%', width: 32, height: 32, padding: 0 }}>
                                <i className="ti ti-x"></i>
                            </button>
                        </div>
                        <div className="d-flex align-items-center gap-2 mb-3">
                            <span className="px-2 py-1 rounded-pill" style={{
                                fontSize: '0.75rem', fontWeight: 600,
                                background: selectedLine.production > 0 ? '#e8f5e9' : '#ffebee',
                                color: selectedLine.production > 0 ? '#2e7d32' : '#c62828'
                            }}>
                                {selectedLine.production > 0 ? 'Running' : 'Stopped'}
                            </span>
                            {selectedLine.lastUpdated && (
                                <span style={{ fontSize: '0.75rem', color: '#888' }}>Updated {selectedLine.lastUpdated}</span>
                            )}
                        </div>
                        {/* Gauge row */}
                        <div className="d-flex justify-content-around mb-3">
                            {[
                                { label: 'Performance', value: selectedLine.performance },
                            ].map(m => {
                                const c = gaugeColor(m.value);
                                return (
                                <div key={m.label} className="text-center">
                                    <SpeedGauge value={m.value} color={c} size={100} />
                                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#555' }}>{m.label}</div>
                                </div>
                                );
                            })}
                        </div>
                        {/* Performance formula */}
                        <div className="rounded-3 p-2 mb-3" style={{ background: '#f8fafc', fontSize: '0.75rem', color: '#64748b' }}>
                            <div className="fw-bold mb-1" style={{ color: '#334155' }}>Performance Formula</div>
                            <div className="font-monospace" style={{ fontSize: '0.7rem' }}>
                                (Hours × 60 − Total Downtime) / (Hours × 60) × 100
                            </div>
                            <div className="font-monospace mt-1" style={{ fontSize: '0.7rem', color: '#1565c0' }}>
                                ({(() => {
                                    const time = selectedLine.stoppageCount * 60;
                                    const td = Math.round(selectedLine.perfRaw?.totalDowntime || 0);
                                    return `${selectedLine.stoppageCount} × 60 − ${td}) / (${time}) × 100 = ${selectedLine.performance.toFixed(1)}%`;
                                })()}
                            </div>
                        </div>
                        {/* Detail rows */}
                        {[
                            { label: 'Time (Hours × 60)', value: `${selectedLine.stoppageCount * 60} min (${selectedLine.stoppageCount} hour${selectedLine.stoppageCount !== 1 ? 's' : ''} submitted)`, color: '#2e7d32' },
                            { label: 'Bottles Produced', value: formatN(Math.round(selectedLine.production)), color: '#1565c0' },
                            { label: 'Downtime', value: `${Math.round(selectedLine.downtime)} min`, color: selectedLine.downtime > 30 ? '#f44336' : '#4caf50' },
                            { label: 'Planned Time', value: `${Math.round(selectedLine.perfRaw?.plannedTime || 0)} min`, color: '#555' },
                            { label: 'Total Downtime', value: `${Math.round(selectedLine.perfRaw?.totalDowntime || 0)} min`, color: '#555' },
                            { label: 'Mechanical Downtime', value: `${Math.round(selectedLine.perfRaw?.mechDowntime || 0)} min`, color: '#d97706' },
                            { label: 'Reports', value: selectedLine.reports, color: '#555' },
                        ].map(row => (
                            <div key={row.label} className="d-flex justify-content-between align-items-center py-2" style={{ borderBottom: '1px solid #f0f0f0' }}>
                                <span style={{ fontSize: '0.85rem', color: '#666' }}>{row.label}</span>
                                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: row.color }}>{row.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Reports Modal ────────────────────── */}
            {showReportsModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={() => setShowReportsModal(false)}>
                    <div className="rounded-4 p-4" style={{ background: '#fff', width: 600, maxWidth: '95vw', maxHeight: '80vh', overflow: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}
                        onClick={e => e.stopPropagation()}>
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <h5 className="mb-0 fw-bold"><i className="ti ti-alert-triangle me-2 text-warning"></i>Stoppage Reports ({rawStoppages.length})</h5>
                            <button className="btn btn-sm btn-light" onClick={() => setShowReportsModal(false)} style={{ borderRadius: '50%', width: 32, height: 32, padding: 0 }}>
                                <i className="ti ti-x"></i>
                            </button>
                        </div>
                        {rawStoppages.length === 0 ? (
                            <div className="text-center py-4 text-muted">No stoppages reported today</div>
                        ) : (
                            <table className="table table-sm table-hover mb-0" style={{ fontSize: '0.8rem' }}>
                                <thead>
                                    <tr style={{ color: '#64748b' }}>
                                        <th>PET Line</th>
                                        <th>Hour</th>
                                        <th>Time</th>
                                        <th>Duration</th>
                                        <th>Downtime (min)</th>
                                        <th>Category</th>
                                        <th>Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rawStoppages.map(s => (
                                        <tr key={s.id}>
                                            <td className="fw-bold">{s.pet_name}</td>
                                            <td>Hour {s.hour_index ?? '—'}</td>
                                            <td>{s.start_time || s.log_time || '—'}</td>
                                            <td>{s.duration ? `${s.duration}m` : '—'}</td>
                                            <td style={{ color: '#dc2626', fontWeight: 600 }}>{s.downtime_minutes || 0}</td>
                                            <td>{s.incidents?.[0]?.downtime_category_name || s.incidents?.[0]?.sub_downtime_category_name || '—'}</td>
                                            <td style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.incidents?.[0]?.incident_description || s.comments || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {/* Floating Refresh Button */}
            <button
                onClick={loadData}
                disabled={refreshing}
                style={{ position: 'fixed', bottom: 24, right: 24, width: 50, height: 50, borderRadius: '50%', border: 'none', background: '#1d4ed8', color: '#fff', boxShadow: '0 4px 14px rgba(29,78,216,0.4)', cursor: 'pointer', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={e => e.currentTarget.style.transform = ''}
                title="Refresh data"
            >
                <i className={`ti ti-refresh fs-4${refreshing ? ' spin' : ''}`}></i>
                <style>{`.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </button>
        </div>
    );
};

export default Overview;
