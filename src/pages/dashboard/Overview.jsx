import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { productionApi } from '../../api/production';
import { useApiWithFilters } from '../../utils/useApiWithFilters';
import { SkeletonGauges } from '../../components/ui/Skeletons';
import YesterdayTodayComparison from '../../components/charts/YesterdayTodayComparison';

/* ── helpers ─────────────────────────────────────── */
const clamp = (v) => Math.min(100, Math.max(0, v));

/* ── Dual OEE-style Gauge (two needles: CO₂ blue, Syrup purple) ── */
const DualGauge = ({ co2Pct, syrupPct, label, size = 200 }) => {
    const cx = size/2, cy = size/2+size*0.1, r = size*0.325;
    const startA = (Math.PI*4)/5, endA = Math.PI/5, range = startA-endA;
    const p = (a, rad=r) => ({ x: cx+rad*Math.cos(a), y: cy-rad*Math.sin(a) });
    const arc = (s,e,rad=r) => { const sp=p(s,rad),ep=p(e,rad); return `M ${sp.x} ${sp.y} A ${rad} ${rad} 0 ${Math.abs(s-e)>Math.PI?1:0} 1 ${ep.x} ${ep.y}`; };
    const co2A = startA-(range*clamp(co2Pct))/100;
    const syrupA = startA-(range*clamp(syrupPct))/100;
    const sw = size*0.12;
    const id = label.replace(/\s/g,'');
    return (
        <div className="d-flex flex-column align-items-center p-2 border rounded-3 shadow-sm" style={{background:'linear-gradient(135deg,#fff 0%,#f8f9fa 100%)'}}>
            <h6 className="mb-1 text-center fw-semibold" style={{fontSize:size*0.1}}>{label}</h6>
            <svg width={size} height={size*0.75} viewBox={`0 0 ${size} ${size*0.75}`}>
                <defs><filter id={`sh-${id}`}><feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.2"/></filter></defs>
                <path d={arc(startA,endA)} fill="none" stroke="#e5e7eb" strokeWidth={sw} strokeLinecap="round"/>
                {/* CO₂ arc fill */}
                {co2Pct>0&&<path d={arc(startA,co2A)} fill="none" stroke="#bae6fd" strokeWidth={sw*0.45} strokeLinecap="round"/>}
                {/* Syrup arc fill */}
                {syrupPct>0&&<path d={arc(startA,syrupA)} fill="none" stroke="#ede9fe" strokeWidth={sw*0.45} strokeLinecap="round" opacity={0.7}/>}
                {[0,25,50,75,100].map(t => { const a=startA-(range*t)/100, pos={x:cx+(r+size*0.1)*Math.cos(a),y:cy-(r+size*0.1)*Math.sin(a)+2}; return <text key={t} x={pos.x} y={pos.y} textAnchor="middle" fontSize={size*0.07} fontWeight="600" fill="#6b7280">{t}</text>; })}
                <g filter={`url(#sh-${id})`}>
                    {/* CO₂ needle — blue */}
                    <line x1={cx} y1={cy} x2={cx+(r-size*0.04)*Math.cos(co2A)} y2={cy-(r-size*0.04)*Math.sin(co2A)} stroke="#0ea5e9" strokeWidth={size*0.018} strokeLinecap="round"/>
                    {/* Syrup needle — purple, slightly shorter */}
                    <line x1={cx} y1={cy} x2={cx+(r-size*0.1)*Math.cos(syrupA)} y2={cy-(r-size*0.1)*Math.sin(syrupA)} stroke="#8b5cf6" strokeWidth={size*0.018} strokeLinecap="round"/>
                    <circle cx={cx} cy={cy} r={size*0.03} fill="#1f2937"/><circle cx={cx} cy={cy} r={size*0.015} fill="#fff"/>
                </g>
                <text x={cx} y={cy+size*0.15} textAnchor="middle" fontSize={size*0.095} fontWeight="700" fill="#0ea5e9">{co2Pct.toFixed(0)}</text>
                <text x={cx} y={cy+size*0.24} textAnchor="middle" fontSize={size*0.095} fontWeight="700" fill="#8b5cf6">{syrupPct.toFixed(0)}</text>
            </svg>
            <div className="d-flex gap-2 mt-1">
                <span style={{fontSize:'0.8rem',fontWeight:700,color:'#0ea5e9'}}>● CO₂ {co2Pct.toFixed(1)}</span>
                <span style={{fontSize:'0.8rem',fontWeight:700,color:'#8b5cf6'}}>● Syrup {syrupPct.toFixed(1)}</span>
            </div>
        </div>
    );
};


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
const ALL_PET_NAMES = ['Pet 1', 'Pet 2', 'Pet 3', 'Pet 4', 'Pet 5', 'Pet 6'];
const normPet = (name) => { const num = name?.match(/(\d+)/)?.[0]; return num ? `Pet ${num}` : name; };

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
    const [modalFilterPet, setModalFilterPet] = useState('');
    const [modalFilterDate, setModalFilterDate] = useState('');
    const [shiftLoading, setShiftLoading] = useState(false);
    const [shiftFilterDate, setShiftFilterDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [shiftComparisonData, setShiftComparisonData] = useState({});
    const [showShiftComparison, setShowShiftComparison] = useState(false);
    const [sliderMode, setSliderMode] = useState(() => localStorage.getItem('sliderMode') === 'true');
    const [sliderIndex, setSliderIndex] = useState(0);
    const [sliderSeconds, setSliderSeconds] = useState(() => Number(localStorage.getItem('sliderSeconds')) || 10);
    const sliderTimerRef = useRef(null);

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
                productionApi.getOeeSummary({ production_date: todayStr }),
                productionApi.getPets(params),
                productionApi.getStoppages(stoppageParams),
            ]);

            if (controller.signal.aborted) return;

            const reportsList = (Array.isArray(reportsRes.data) ? reportsRes.data : (reportsRes.data?.results || []))
                .filter(r => !r.pet_name?.toLowerCase().includes('can'))
                .map(r => ({
                    ...r,
                    metrics: {
                        availability: parseFloat(r.metrics?.availability) || 0,
                        performance: parseFloat(r.metrics?.efficiency) || 0,
                        quality: parseFloat(r.metrics?.quality) || 0,
                        oee: parseFloat(r.metrics?.oee) || 0,
                        details: r.metrics?.details || {},
                    }
                }));

            if (controller.signal.aborted) return;

            const sortByPet = (arr) => arr.sort((a, b) => {
                const aNum = parseInt(a.pet_name?.match(/(\d+)/)?.[0] || '999');
                const bNum = parseInt(b.pet_name?.match(/(\d+)/)?.[0] || '999');
                return aNum - bNum;
            });

            setRawReports(sortByPet(reportsList));
            setRawPets((Array.isArray(petsRes.data) ? petsRes.data : []).filter(pet => !pet.pet_name?.toLowerCase().includes('can')));
            setRawStoppages((Array.isArray(stoppagesRes.data) ? stoppagesRes.data : []).filter(s => !(s.pet_name || s.line_name || '').toLowerCase().includes('can')));
            setAllReports(sortByPet(reportsList));

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
                const res = await productionApi.getOeeSummary({ production_date: oeeDate });
                const rows = (Array.isArray(res.data) ? res.data : (res.data?.results || []))
                    .filter(r => !r.pet_name?.toLowerCase().includes('can'));
                // Map oee_summary keys into the metrics shape consumed downstream (efficiency → performance)
                setOeeReports(rows.map(r => ({
                    ...r,
                    metrics: {
                        availability: parseFloat(r.metrics?.availability) || 0,
                        performance: parseFloat(r.metrics?.efficiency) || 0,
                        quality: parseFloat(r.metrics?.quality) || 0,
                        oee: parseFloat(r.metrics?.oee) || 0,
                        details: r.metrics?.details || {},
                    }
                })));
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
                production_date: refDateStr
            };

            // Include PET filter if selected
            if (filters.pet) {
                shiftParams.pet = filters.pet;
            }

            const [shiftReportsRes, oeeSummaryRes] = await Promise.all([
                productionApi.getStoppagesSummary(shiftParams),
                productionApi.getOeeSummary({ production_date: refDateStr })
            ]);

            // Use oee_summary data — array of per-line summaries
            const oeeSummaryRaw = Array.isArray(oeeSummaryRes.data) ? oeeSummaryRes.data : (oeeSummaryRes.data?.results || []);
            let oeeSummaryList = oeeSummaryRaw.filter(r => !r.pet_name?.toLowerCase().includes('can') && r.shift_name === targetShift.name);

            // If current shift has no data and user didn't manually select, fall back to other shift
            if (oeeSummaryList.length === 0 && !selectedShiftId && otherShift) {
                oeeSummaryList = oeeSummaryRaw.filter(r => !r.pet_name?.toLowerCase().includes('can') && r.shift_name === otherShift.name);
                if (oeeSummaryList.length > 0) {
                    setCurrentShiftInfo(prev => ({ ...prev, id: otherShift.id, name: otherShift.name, start_time: otherShift.start_time, end_time: otherShift.end_time }));
                }
            }
            setShiftOeeReports(oeeSummaryList);
            
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
        const interval = setInterval(loadData, 30 * 60 * 1000);
        return () => { clearInterval(interval); if (abortRef.current) abortRef.current.abort(); };
    }, [loadData]);
    
    /* Load shift data when shifts or selectedShiftId changes */
    useEffect(() => {
        loadShiftData();
    }, [loadShiftData]);

    /* Slider auto-advance */
    const SLIDER_PANELS = 8;
    useEffect(() => {
        if (!sliderMode) { clearInterval(sliderTimerRef.current); return; }
        sliderTimerRef.current = setInterval(() => setSliderIndex(i => (i + 1) % SLIDER_PANELS), sliderSeconds * 1000);
        return () => clearInterval(sliderTimerRef.current);
    }, [sliderMode, sliderSeconds]);

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

        /* Stats from reports + stoppages */
        const reportDowntime = reports.reduce((s, r) => s + (r.metrics?.details?.total_downtime_mins || 0), 0);
        const reportProduced = reports.reduce((s, r) => s + (r.metrics?.details?.total_output_pcs || 0), 0);

        // Stoppages have real-time production data
        const stoppageDowntime = stoppages.reduce((s, r) => s + (r.downtime_minutes || 0), 0);
        const stoppageProduced = stoppages.reduce((s, r) => s + (r.bottles_produced || 0), 0);

        const totalDowntime = reportDowntime || stoppageDowntime;
        const mechDowntime = reports.reduce((s, r) => s + (r.metrics?.details?.mechanical_downtime_mins || 0), 0) || stoppageDowntime;
        const plannedDowntime = reports.reduce((s, r) => s + (r.metrics?.details?.planned_downtime_mins || 0), 0);
        const totalProduced = reportProduced || stoppageProduced;
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

        /* Global OEE — use report metrics if available, otherwise derive from stoppages */
        const totalPlannedMins = reports.reduce((s, r) => s + (r.metrics?.details?.planned_time_mins || 0), 0);
        const totalRejects = reports.reduce((s, r) => s + (r.metrics?.details?.rejects_pcs || 0), 0);

        const reportAvail = reports.length > 0 ? reports.reduce((s, r) => s + (r.metrics?.availability || 0), 0) / reports.length : 0;
        const reportPerf = reports.length > 0 ? reports.reduce((s, r) => s + (r.metrics?.performance || 0), 0) / reports.length : 0;
        const reportQual = reports.length > 0 ? reports.reduce((s, r) => s + (r.metrics?.quality || 0), 0) / reports.length : 0;

        // Fallback: compute from stoppages when report metrics are 0
        const stoppageEff = stoppages.length > 0 ? stoppages.reduce((s, r) => s + (parseFloat(r.efficiency) || 0), 0) / stoppages.length : 0;
        const stoppageTime = stoppages.length * 60;
        const stoppagePerf = stoppageTime > 0 ? ((stoppageTime - stoppageDowntime) / stoppageTime) * 100 : 0;

        const availability = reportAvail || stoppageEff;
        const performance = reportPerf || stoppagePerf;
        const quality = reportQual || 0;
        const oeeValue = (availability > 0 || performance > 0) ? (clamp(availability) / 100) * (clamp(performance) / 100) * (clamp(quality) / 100) * 100 : 0;

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
                performance: clamp(l.performance / l.reports),
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
                const sub = incident.sub_downtime_category_name || null;
                const duration = parseFloat(incident.incident_duration || 0);
                
                if (!incidentMap[category]) {
                    incidentMap[category] = { total: 0, subs: {} };
                }
                incidentMap[category].total += duration;
                if (sub) {
                    incidentMap[category].subs[sub] = (incidentMap[category].subs[sub] || 0) + duration;
                }
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
            .map(([name, val]) => ({
                name,
                value: Math.round(val.total),
                color: categoryColors[name] || categoryColors['Other'],
                subs: Object.entries(val.subs)
                    .map(([sname, sv]) => ({ name: sname, value: Math.round(sv) }))
                    .sort((a, b) => b.value - a.value)
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
                performance: clamp(r.metrics?.performance || 0),
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
        // Build line map from oee_summary data (shiftOeeReports)
        const lineMap = {};

        // Seed with all known PETs
        rawPets.forEach(pet => {
            lineMap[pet.pet_name] = { name: pet.pet_name, reports: 0, efficiency: 0, production: 0, downtime: 0, plannedDowntime: 0, plannedTimeMins: 0, totalDowntime: 0, mechDowntime: 0 };
        });

        // Populate from oee_summary response (keys: metrics.availability, metrics.efficiency, metrics.quality, metrics.oee)
        shiftOeeReports.forEach(r => {
            const name = r.pet_name;
            if (!name) return;
            if (!lineMap[name]) lineMap[name] = { name, reports: 0, efficiency: 0, production: 0, downtime: 0, plannedDowntime: 0, plannedTimeMins: 0, totalDowntime: 0, mechDowntime: 0 };
            const l = lineMap[name];
            l.reports += 1;
            l.efficiency += parseFloat(r.metrics?.efficiency) || 0;
            l.production += r.total_bottles_produced || 0;
            l.downtime += r.metrics?.details?.total_downtime_mins || 0;
            l.plannedDowntime += r.metrics?.details?.planned_downtime_mins || 0;
            l.plannedTimeMins += r.metrics?.details?.planned_time_mins || 0;
            l.totalDowntime += r.metrics?.details?.total_downtime_mins || 0;
            l.mechDowntime += r.metrics?.details?.mechanical_downtime_mins || 0;
        });

        // Supplement from hourlyReports (stoppages summary) for lines missing in oee_summary
        hourlyReports.forEach(r => {
            const name = r.pet_name;
            if (!name) return;
            if (!lineMap[name]) lineMap[name] = { name, reports: 0, efficiency: 0, production: 0, downtime: 0, plannedDowntime: 0, plannedTimeMins: 0, totalDowntime: 0, mechDowntime: 0 };
            const l = lineMap[name];
            if (l.reports === 0) {
                l.reports = 1;
                l.efficiency = parseFloat(r.efficiency) || 0;
                l.production = r.bottles_produced || 0;
                l.downtime = r.downtime_minutes || 0;
            }
        });

        return Object.values(lineMap).map(l => {
            const stoppages = rawStoppages.filter(s => s.pet_name === l.name && (s.report_code || '').toUpperCase().includes(currentShiftInfo?.name?.toUpperCase())).length;
            const eff = l.reports > 0 ? l.efficiency / l.reports : 0;
            return {
                name: l.name,
                reports: l.reports,
                oee: clamp(eff),
                performance: clamp(eff),
                perfRaw: { plannedTime: l.plannedTimeMins, totalDowntime: l.totalDowntime || l.downtime, plannedDowntime: l.plannedDowntime, mechDowntime: l.mechDowntime },
                production: l.production,
                downtime: l.downtime,
                stoppageCount: stoppages,
                lastUpdated: null,
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
                    <div className="d-flex align-items-center gap-1 px-2 py-1 rounded-3 shadow-sm" style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
                        <i className="ti ti-calendar" style={{ color: '#64748b', fontSize: '0.9rem' }}></i>
                        <input
                            type="date"
                            className="form-control form-control-sm border-0 p-0"
                            value={oeeDate}
                            onChange={(e) => { setOeeDate(e.target.value); setShiftFilterDate(e.target.value); }}
                            max={new Date().toISOString().split('T')[0]}
                            style={{ width: 130, fontSize: '0.8rem', background: 'transparent', boxShadow: 'none' }}
                            title="Select dashboard date"
                        />
                    </div>
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
                            {(() => {
                                const active = oeeByLine.filter(l => l.reports > 0);
                                const sorted = active.length ? [...active].sort((a, b) => a.oee - b.oee) : [];
                                const low = sorted[0], high = sorted[sorted.length - 1];
                                const sameLine = high && low && high.name === low.name;
                                return <>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Overall Equipment Effectiveness <span style={{ color: 'rgba(255,255,255,0.5)' }}>— Yesterday</span></div>
                                    {high ? (
                                        <>
                                            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#4ade80', lineHeight: 1.1 }}>▲ {high.oee.toFixed(1)}%</div>
                                            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>{sameLine ? `${high.name} (only line)` : `Highest — ${high.name}`}</div>
                                        </>
                                    ) : (
                                        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>0.0%</div>
                                    )}
                                </div>
                                <div className="text-end">
                                    {low && !sameLine ? (
                                        <>
                                            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f87171', lineHeight: 1.1 }}>▼ {low.oee.toFixed(1)}%</div>
                                            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>Lowest — {low.name}</div>
                                        </>
                                    ) : null}
                                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.78)', marginTop: 4 }}>Running Lines</div>
                                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>{runningLinesCount}/{hourlyOeeByLine.length}</div>
                                </div>
                                </>;
                            })()}
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

            {/* ── Yesterday vs Today Comparison ──── */}
            <YesterdayTodayComparison />

            {/* ── Shift Production Metrics ─────────── */}
            <div className="rounded-3 px-2 py-1 mb-2" style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
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
                                <span className="px-2 py-0 rounded-pill d-inline-block mb-1" style={{ fontSize: '0.6rem', fontWeight: 600, background: isRunning ? '#e8f5e9' : '#ffebee', color: isRunning ? '#2e7d32' : '#c62828' }}>
                                    {isRunning ? 'Running' : 'Stopped'}
                                </span>
                                <div style={{ fontSize: '0.7rem', color: '#555', fontWeight: 600 }}><i className="ti ti-bottle me-1"></i>{formatN(Math.round(line.production))}</div>
                                <div style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: 600 }}><i className="ti ti-clock-pause me-1"></i>{formatN(Math.round(line.downtime))}m</div>
                                <div style={{ fontSize: '0.7rem', color: '#e65100', fontWeight: 600 }}><i className="ti ti-alert-triangle me-1"></i>{line.stoppageCount} Hour{line.stoppageCount !== 1 ? 's' : ''} submitted</div>
                                <div style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: 2 }}>tap for details</div>
                            </div>
                        </div>
                    );
                })}
            </div>
            )}
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
                            max={new Date().toISOString().split('T')[0]}
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

            {/* ── Slider Mode Toggle ──────────────── */}
            <div className="d-flex align-items-center justify-content-end gap-2 mb-2">
                {sliderMode && (
                    <div className="d-flex align-items-center gap-1">
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Interval:</span>
                        {[10, 20, 30].map(s => (
                            <button key={s} onClick={() => { setSliderSeconds(s); localStorage.setItem('sliderSeconds', s); }}
                                className={`btn btn-xs px-2 py-0 ${sliderSeconds === s ? 'btn-primary' : 'btn-outline-secondary'}`}
                                style={{ fontSize: '0.72rem', borderRadius: 4 }}>{s}s</button>
                        ))}
                        <div className="d-flex gap-1 ms-1">
                            {Array.from({ length: SLIDER_PANELS }).map((_, i) => (
                                <button key={i} onClick={() => setSliderIndex(i)} style={{ width: 8, height: 8, borderRadius: '50%', border: 'none', padding: 0, background: i === sliderIndex ? '#1d4ed8' : '#cbd5e1', cursor: 'pointer' }} />
                            ))}
                        </div>
                    </div>
                )}
                <div className="d-flex align-items-center gap-2 px-2 py-1 rounded-3 shadow-sm" style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
                    <i className="ti ti-slideshow" style={{ color: '#64748b', fontSize: '0.9rem' }}></i>
                    <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>Slider</span>
                    <div className="form-check form-switch mb-0 ms-1">
                        <input className="form-check-input" type="checkbox" checked={sliderMode} onChange={e => { setSliderMode(e.target.checked); setSliderIndex(0); localStorage.setItem('sliderMode', e.target.checked); }} style={{ cursor: 'pointer' }} />
                    </div>
                </div>
            </div>

            {/* ── Slider Panels ───────────────────── */}
            {sliderMode ? (
                <div style={{ position: 'relative', overflow: 'hidden' }}>
                    <style>{`
                        @keyframes slideIn { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
                        .slide-panel { animation: slideIn 0.4s ease; }
                    `}</style>
                    {/* Progress bar */}
                    <div style={{ height: 3, background: '#e2e8f0', borderRadius: 2, marginBottom: 8, overflow: 'hidden' }}>
                        <div key={sliderIndex} style={{ height: '100%', background: '#1d4ed8', borderRadius: 2, animation: `slideProgress ${sliderSeconds}s linear forwards` }} />
                        <style>{`@keyframes slideProgress { from { width: 0% } to { width: 100% } }`}</style>
                    </div>
                    <div className="slide-panel" key={sliderIndex}>
                        {sliderIndex === 0 && (() => {
                            const petMap = {};
                            rawStoppages.forEach(s => {
                                const name = s.pet_name; if (!name) return;
                                if (!petMap[name]) petMap[name] = { name, total: 0, downtime: 0, runTime: 0, stoppageCount: 0 };
                                petMap[name].total += 1; petMap[name].downtime += s.downtime_minutes || 0;
                                petMap[name].runTime += 60 - (s.downtime_minutes || 0); petMap[name].stoppageCount += (s.incidents?.length || 0);
                            });
                            const pets = Object.values(petMap).sort((a, b) => parseInt(a.name?.match(/(\d+)/)?.[0]||'999') - parseInt(b.name?.match(/(\d+)/)?.[0]||'999'));
                            if (!pets.length) return <div className="text-center text-muted py-4">No stoppage data</div>;
                            return (
                                <div className="card mb-2">
                                    <div className="card-header py-2 d-flex align-items-center gap-2"><i className="ti ti-table text-warning"></i><h6 className="mb-0 fw-bold">Stoppages per PET Line</h6><span className="badge bg-soft-warning text-warning ms-1">{activeDateLabel}</span></div>
                                    <div className="card-body p-2">
                                        <div className="d-flex gap-2">
                                            {pets.map(p => {
                                                const dtPct = p.total*60>0 ? (p.downtime/(p.total*60))*100 : 0;
                                                const color = dtPct>20?'#dc2626':dtPct>10?'#d97706':'#16a34a';
                                                return (
                                                    <div key={p.name} style={{flex:1}}>
                                                        <div className="rounded-3 p-2 h-100" style={{background:'#f8fafc',border:`1px solid ${color}40`,borderLeft:`4px solid ${color}`}}>
                                                            <div className="fw-bold mb-2" style={{fontSize:'0.8rem',color:'#1e293b'}}>{p.name}</div>
                                                            {[
                                                                {label:'Hours',value:p.total,icon:'ti-clock',color:'#64748b'},
                                                                {label:'Run Time',value:`${Math.round(p.runTime)} min`,icon:'ti-player-play',color:'#16a34a'},
                                                                {label:'Downtime',value:`${Math.round(p.downtime)} min`,icon:'ti-clock-pause',color:'#dc2626'},
                                                                {label:'Incidents',value:p.stoppageCount,icon:'ti-alert-triangle',color:'#d97706'},
                                                                {label:'DT %',value:`${dtPct.toFixed(1)}%`,icon:'ti-percentage',color},
                                                            ].map(s => (
                                                                <div key={s.label} className="d-flex align-items-center gap-1 mb-1">
                                                                    <i className={`ti ${s.icon}`} style={{color:s.color,fontSize:'0.85rem',width:16}}></i>
                                                                    <span style={{fontSize:'0.7rem',color:'#64748b',flex:1}}>{s.label}</span>
                                                                    <span style={{fontSize:'0.75rem',fontWeight:700,color:s.color}}>{s.value}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                        {sliderIndex === 1 && (() => {
                            const CO2=0.006,SYRUP=0.25,MAT=28,ELEC=2.5,WATER=1.8;
                            const petMap = {};
                            ALL_PET_NAMES.forEach(n => { petMap[n] = { name: n, bottles: 0, runMins: 0 }; });
                            rawStoppages.forEach(r => {
                                const n = normPet(r.pet_name); if (!n) return;
                                if (!petMap[n]) petMap[n] = { name: n, bottles: 0, runMins: 0 };
                                petMap[n].bottles += r.bottles_produced || 0;
                                petMap[n].runMins += 60 - (r.downtime_minutes || 0);
                            });
                            const pets = Object.values(petMap).sort((a,b) => parseInt(a.name?.match(/(\d+)/)?.[0]||'999') - parseInt(b.name?.match(/(\d+)/)?.[0]||'999'));
                            if (!pets.length) return <div className="text-center text-muted py-4">No data</div>;
                            const isWater = (name) => /pet\s*5/i.test(name);
                            const stats = (p) => [
                                {label:'Bottles',value:p.bottles.toLocaleString(),icon:'ti-bottle',color:'#1d4ed8',raw:p.bottles},
                                {label:'Electricity',value:`${(p.runMins*ELEC).toFixed(0)} kWh`,icon:'ti-bolt',color:'#eab308',raw:p.runMins*ELEC},
                                {label:'Water',value:`${(p.bottles*WATER).toFixed(0)} L`,icon:'ti-droplets',color:'#06b6d4',raw:p.bottles*WATER},
                            ].filter(s => s.raw > 0);
                            return (
                                <div className="card mb-2">
                                    <div className="card-header py-2 d-flex align-items-center gap-2"><i className="ti ti-leaf text-success"></i><h6 className="mb-0 fw-bold">Resource Consumption</h6><span className="badge bg-soft-success text-success ms-1">{activeDateLabel}</span><span className="badge bg-soft-secondary text-secondary ms-1"><i className="ti ti-info-circle me-1"></i>Estimates</span></div>
                                    <div className="card-body p-2">
                                        <div className="d-flex gap-2">
                                            {pets.map(p => (
                                                <div key={p.name} style={{flex:1}}>
                                                    <div className="rounded-3 p-2 h-100" style={{background:'#f8fafc',border:'1px solid #e2e8f0'}}>
                                                        <div className="fw-bold mb-2" style={{fontSize:'0.8rem',color:'#1e293b'}}>{p.name}</div>
                                                        {stats(p).map(s => (
                                                            <div key={s.label} className="d-flex align-items-center gap-1 mb-1">
                                                                <i className={`ti ${s.icon}`} style={{color:s.color,fontSize:'0.85rem',width:16}}></i>
                                                                <span style={{fontSize:'0.7rem',color:'#64748b',flex:1}}>{s.label}</span>
                                                                <span style={{fontSize:'0.75rem',fontWeight:700,color:'#0f172a'}}>{s.value}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                        {sliderIndex === 3 && (() => {
                            const CO2=0.006,SYRUP=0.25,MAT=28,ELEC=2.5,WATER=1.8;
                            const petMap = {};
                            ALL_PET_NAMES.forEach(n => { petMap[n] = { name: n, bottles: 0, runMins: 0 }; });
                            rawStoppages.forEach(r => {
                                const n = normPet(r.pet_name); if (!n) return;
                                if (!petMap[n]) petMap[n] = { name: n, bottles: 0, runMins: 0 };
                                petMap[n].bottles += r.bottles_produced || 0;
                                petMap[n].runMins += 60 - (r.downtime_minutes || 0);
                            });
                            const pets = Object.values(petMap).sort((a,b) => parseInt(a.name?.match(/(\d+)/)?.[0]||'999') - parseInt(b.name?.match(/(\d+)/)?.[0]||'999'));
                            if (!pets.length) return <div className="text-center text-muted py-4">No data</div>;
                            const isWater = (name) => /pet\s*5/i.test(name);
                            const allMaterials = [
                                {label:'Bottles',unit:'',fn:p=>p.bottles,color:'#1d4ed8'},
                                {label:'Electricity',unit:'kWh',fn:p=>p.runMins*ELEC,color:'#eab308'},
                                {label:'Water',unit:'L',fn:p=>p.bottles*WATER,color:'#06b6d4'},
                            ];
                            return (
                                <div className="card mb-2">
                                    <div className="card-header py-2 d-flex align-items-center gap-2"><i className="ti ti-chart-donut text-primary"></i><h6 className="mb-0 fw-bold">Resource Consumption by PET</h6><span className="badge bg-soft-primary text-primary ms-1">{activeDateLabel}</span></div>
                                    <div className="card-body p-2">
                                        <div className="d-flex flex-nowrap justify-content-around gap-2" style={{overflowX:'auto'}}>
                                            {pets.map(p => {
                                                const materials = allMaterials.filter(m => !(m.skipWater && isWater(p.name)));
                                                const data = materials.map(m => ({name:m.label, value:parseFloat(m.fn(p).toFixed(2)), fill:m.color, unit:m.unit})).filter(d => d.value > 0);
                                                return (
                                                    <div key={p.name} style={{flexShrink:0,display:'flex',flexDirection:'column',alignItems:'center'}}>
                                                        <div style={{fontSize:'0.72rem',fontWeight:700,color:'#1e293b',marginBottom:4}}>{p.name}</div>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <div className="d-flex flex-column gap-1">
                                                                {data.map(d => (
                                                                    <div key={d.name} className="d-flex align-items-center gap-1">
                                                                        <span style={{width:8,height:8,borderRadius:'50%',background:d.fill,flexShrink:0,display:'inline-block'}}></span>
                                                                        <span style={{fontSize:'0.62rem',color:'#334155',fontWeight:600,whiteSpace:'nowrap'}}>{d.name}</span>
                                                                        <span style={{fontSize:'0.62rem',color:'#64748b',whiteSpace:'nowrap'}}>{d.value.toLocaleString()}{d.unit?` ${d.unit}`:''}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <PieChart width={120} height={120}>
                                                                <Pie data={data} cx={55} cy={55} innerRadius={28} outerRadius={50} dataKey="value" paddingAngle={2}>
                                                                    {data.map((d,i) => <Cell key={i} fill={d.fill} />)}
                                                                </Pie>
                                                                <Tooltip formatter={(v,n,props) => [`${Number(v).toLocaleString()}${props.payload.unit?` ${props.payload.unit}`:''}`, n]} contentStyle={{fontSize:'0.7rem',padding:'2px 6px'}} />
                                                            </PieChart>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                        {sliderIndex === 4 && (() => {
                            const CO2=0.006, SYRUP=0.25;
                            const petMap = {};
                            ALL_PET_NAMES.forEach(n => { petMap[n] = { name: n, bottles: 0 }; });
                            rawStoppages.forEach(r => {
                                const n = normPet(r.pet_name); if (!n) return;
                                if (!petMap[n]) petMap[n] = { name: n, bottles: 0 };
                                petMap[n].bottles += r.bottles_produced || 0;
                            });
                            const pets = Object.values(petMap).filter(p => !/pet\s*5/i.test(p.name)).sort((a,b) => parseInt(a.name?.match(/(\d+)/)?.[0]||'999') - parseInt(b.name?.match(/(\d+)/)?.[0]||'999'));
                            if (!pets.length) return <div className="text-center text-muted py-4">No data</div>;
                            const totalBottles = pets.reduce((s,p)=>s+p.bottles,0);
                            return (
                                <div className="card mb-2">
                                    <div className="card-header py-2 d-flex align-items-center gap-2">
                                        <i className="ti ti-flask text-info"></i>
                                        <h6 className="mb-0 fw-bold">CO₂ &amp; Syrup Yield</h6>
                                        <span className="badge bg-soft-info text-info ms-1">{activeDateLabel}</span>
                                        <span className="badge bg-soft-secondary text-secondary ms-auto">Total: {totalBottles.toLocaleString()} bottles</span>
                                    </div>
                                    <div className="card-body p-2">
                                        <div className="d-flex gap-2">
                                            {pets.map(p => {
                                                const co2 = (p.bottles * CO2).toFixed(1);
                                                const syrup = (p.bottles * SYRUP / 1000).toFixed(1);
                                                const co2Pct = totalBottles > 0 ? ((p.bottles / totalBottles) * 100).toFixed(1) : 0;
                                                const syrupPct = co2Pct; // same denominator (bottles)
                                                return (
                                                    <div key={p.name} style={{flex:1}}>
                                                        <div className="rounded-3 p-2 h-100" style={{background:'#f0f9ff',border:'1px solid #bae6fd'}}>
                                                            <div className="fw-bold mb-2" style={{fontSize:'0.8rem',color:'#0c4a6e'}}>{p.name}</div>
                                                            <div className="mb-2">
                                                                <div className="d-flex align-items-center gap-1 mb-1">
                                                                    <i className="ti ti-cloud" style={{color:'#0ea5e9',fontSize:'0.85rem',width:16}}></i>
                                                                    <span style={{fontSize:'0.7rem',color:'#64748b',flex:1}}>CO₂ Yield</span>
                                                                    <span style={{fontSize:'0.8rem',fontWeight:800,color:'#0ea5e9'}}>{co2Pct}%</span>
                                                                </div>
                                                                <div style={{height:6,background:'#e0f2fe',borderRadius:3,overflow:'hidden'}}>
                                                                    <div style={{width:`${co2Pct}%`,height:'100%',background:'#0ea5e9',borderRadius:3}} />
                                                                </div>
                                                                <div style={{fontSize:'0.65rem',color:'#94a3b8',textAlign:'right'}}>{co2} kg</div>
                                                            </div>
                                                            <div>
                                                                <div className="d-flex align-items-center gap-1 mb-1">
                                                                    <i className="ti ti-droplet" style={{color:'#8b5cf6',fontSize:'0.85rem',width:16}}></i>
                                                                    <span style={{fontSize:'0.7rem',color:'#64748b',flex:1}}>Syrup Yield</span>
                                                                    <span style={{fontSize:'0.8rem',fontWeight:800,color:'#8b5cf6'}}>{syrupPct}%</span>
                                                                </div>
                                                                <div style={{height:6,background:'#ede9fe',borderRadius:3,overflow:'hidden'}}>
                                                                    <div style={{width:`${syrupPct}%`,height:'100%',background:'#8b5cf6',borderRadius:3}} />
                                                                </div>
                                                                <div style={{fontSize:'0.65rem',color:'#94a3b8',textAlign:'right'}}>{syrup} L</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                        {sliderIndex === 5 && (() => {
                            const CO2=0.006, SYRUP=0.25;
                            const petMap = {};
                            ALL_PET_NAMES.forEach(n => { petMap[n] = { name: n, bottles: 0, runMins: 0 }; });
                            hourlyOeeByLine.forEach(l => { if (l.name) petMap[l.name] = { name: l.name, bottles: 0, runMins: 0 }; });
                            rawStoppages.forEach(r => {
                                const n = normPet(r.pet_name); if (!n) return;
                                if (!petMap[n]) petMap[n] = { name: n, bottles: 0, runMins: 0 };
                                petMap[n].bottles += r.bottles_produced || 0;
                                petMap[n].runMins += 60 - (r.downtime_minutes || 0);
                            });
                            const pets = Object.values(petMap).sort((a,b) => parseInt(a.name?.match(/(\d+)/)?.[0]||'999') - parseInt(b.name?.match(/(\d+)/)?.[0]||'999'));
                            if (!pets.length) return <div className="text-center text-muted py-4">No data</div>;
                            const co2Rates = pets.map(p => p.runMins > 0 ? (p.bottles*CO2)/p.runMins : 0);
                            const syrupRates = pets.map(p => p.runMins > 0 ? (p.bottles*SYRUP/1000)/p.runMins : 0);
                            const maxCO2 = Math.max(...co2Rates, 0.001);
                            const maxSyrup = Math.max(...syrupRates, 0.001);
                            return (
                                <div className="card mb-2">
                                    <div className="card-header py-2 d-flex align-items-center gap-2">
                                        <i className="ti ti-gauge text-info"></i><h6 className="mb-0 fw-bold">CO₂ vs Syrup Yield Comparison</h6>
                                        <span className="badge bg-soft-info text-info ms-1">{activeDateLabel}</span>
                                        <span className="d-flex align-items-center gap-2 ms-auto">
                                            <span style={{fontSize:'0.7rem'}}><span style={{display:'inline-block',width:10,height:10,background:'#0ea5e9',borderRadius:2,marginRight:4}}></span>CO₂ (kg/min)</span>
                                            <span style={{fontSize:'0.7rem'}}><span style={{display:'inline-block',width:10,height:10,background:'#8b5cf6',borderRadius:2,marginRight:4}}></span>Syrup (L/min)</span>
                                        </span>
                                    </div>
                                    <div className="card-body py-2">
                                        <div className="d-flex flex-nowrap justify-content-around gap-2" style={{overflowX:'auto'}}>
                                            {pets.map((p,i) => (
                                                <DualGauge key={p.name}
                                                    co2Pct={(co2Rates[i]/maxCO2)*100}
                                                    syrupPct={(syrupRates[i]/maxSyrup)*100}
                                                    label={p.name} size={160}
                                                />
                                            ))}
                                        </div>
                                        <div className="text-center mt-1" style={{fontSize:'0.8rem',color:'#94a3b8'}}>Needles show CO₂ (blue) &amp; Syrup (purple) yield rate per run minute, normalized to best line = 100</div>
                                    </div>
                                </div>
                            );
                        })()}
                        {sliderIndex === 6 && downtimeCategories.length > 0 && (() => {
                            const max = downtimeCategories[0]?.value || 1;
                            const total = downtimeCategories.reduce((s,c)=>s+c.value,0);
                            return (
                                <div className="card mb-2">
                                    <div className="card-header py-2 d-flex align-items-center gap-2"><i className="ti ti-chart-bar text-danger"></i><h6 className="mb-0 fw-bold">Stoppage Categories</h6><span className="badge bg-danger ms-auto">{total} min</span></div>
                                    <div className="card-body py-2">
                                        <div className="d-flex flex-column gap-2">
                                            {downtimeCategories.map(cat => { const pct=((cat.value/total)*100).toFixed(1); return (
                                                <div key={cat.name}>
                                                    <div className="d-flex justify-content-between mb-1"><span style={{fontSize:'0.8rem',fontWeight:600,color:'#334155'}}>{cat.name}</span><span style={{fontSize:'0.8rem',fontWeight:700,color:cat.color}}>{cat.value} min <span style={{color:'#94a3b8',fontWeight:500}}>({pct}%)</span></span></div>
                                                    <div style={{height:14,background:'#f1f5f9',borderRadius:6,overflow:'hidden'}}><div style={{width:`${(cat.value/max)*100}%`,height:'100%',background:cat.color,borderRadius:6}} /></div>
                                                </div>
                                            ); })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                        {sliderIndex === 6 && downtimeCategories.length === 0 && (
                            <div className="card mb-2"><div className="card-body text-center text-muted py-4">No stoppage category data</div></div>
                        )}
                        {sliderIndex === 7 && downtimeCategories.length > 0 && (() => {
                            const allSubs = downtimeCategories.flatMap(cat => cat.subs?.map(s=>({...s,catColor:cat.color,catName:cat.name}))||[]).sort((a,b)=>b.value-a.value);
                            const subMax = allSubs[0]?.value || 1;
                            return (
                                <div className="card mb-2">
                                    <div className="card-header py-2 d-flex align-items-center gap-2"><i className="ti ti-list text-warning"></i><h6 className="mb-0 fw-bold">Sub-Categories</h6><span className="badge bg-warning ms-auto">{allSubs.length} types</span></div>
                                    <div className="card-body py-2">
                                        {allSubs.length > 0 ? (
                                            <div className="d-flex flex-column gap-2">
                                                {allSubs.map(sub => (
                                                    <div key={sub.name+sub.catName}>
                                                        <div className="d-flex justify-content-between mb-1"><span style={{fontSize:'0.78rem',fontWeight:600,color:'#334155'}}>{sub.name}</span><span style={{fontSize:'0.78rem',fontWeight:700,color:sub.catColor}}>{sub.value} min <span style={{fontSize:'0.7rem',color:'#94a3b8',fontWeight:400}}>({sub.catName})</span></span></div>
                                                        <div style={{height:10,background:'#f1f5f9',borderRadius:4,overflow:'hidden'}}><div style={{width:`${(sub.value/subMax)*100}%`,height:'100%',background:sub.catColor,opacity:0.7,borderRadius:4}} /></div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : <div className="text-muted text-center py-3" style={{fontSize:'0.8rem'}}>No sub-category data</div>}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            ) : (
                <>


            {/* ── Per-PET Stoppages Summary Table ── */}
            {(() => {
                const petMap = {};
                rawStoppages.forEach(s => {
                    const name = s.pet_name;
                    if (!name) return;
                    if (!petMap[name]) petMap[name] = { name, total: 0, downtime: 0, runTime: 0, stoppageCount: 0 };
                    petMap[name].total += 1;
                    petMap[name].downtime += s.downtime_minutes || 0;
                    petMap[name].runTime += 60 - (s.downtime_minutes || 0);
                    petMap[name].stoppageCount += (s.incidents?.length || 0);
                });
                const pets = Object.values(petMap).sort((a, b) => parseInt(a.name?.match(/(\d+)/)?.[0]||'999') - parseInt(b.name?.match(/(\d+)/)?.[0]||'999'));
                if (!pets.length) return null;
                return (
                    <div className="card mb-2">
                        <div className="card-header py-2 d-flex align-items-center gap-2">
                            <i className="ti ti-table text-warning"></i>
                            <h6 className="mb-0 fw-bold">Stoppages per PET Line</h6>
                            <span className="badge bg-soft-warning text-warning ms-1">{activeDateLabel}</span>
                        </div>
                        <div className="card-body p-2">
                            <div className="d-flex gap-2">
                                {pets.map(p => {
                                    const dtPct = p.total*60>0 ? (p.downtime/(p.total*60))*100 : 0;
                                    const color = dtPct>20?'#dc2626':dtPct>10?'#d97706':'#16a34a';
                                    return (
                                        <div key={p.name} style={{flex:1}}>
                                            <div className="rounded-3 p-2 h-100" style={{ background: '#f8fafc', border: `1px solid ${color}40`, borderLeft: `4px solid ${color}` }}>
                                                <div className="fw-bold mb-2" style={{ fontSize: '0.8rem', color: '#1e293b' }}>{p.name}</div>
                                                {[
                                                    {label:'Hours',value:p.total,icon:'ti-clock',color:'#64748b'},
                                                    {label:'Run Time',value:`${Math.round(p.runTime)} min`,icon:'ti-player-play',color:'#16a34a'},
                                                    {label:'Downtime',value:`${Math.round(p.downtime)} min`,icon:'ti-clock-pause',color:'#dc2626'},
                                                    {label:'Incidents',value:p.stoppageCount,icon:'ti-alert-triangle',color:'#d97706'},
                                                    {label:'DT %',value:`${dtPct.toFixed(1)}%`,icon:'ti-percentage',color},
                                                ].map(s => (
                                                    <div key={s.label} className="d-flex align-items-center gap-1 mb-1">
                                                        <i className={`ti ${s.icon}`} style={{ color: s.color, fontSize: '0.85rem', width: 16 }}></i>
                                                        <span style={{ fontSize: '0.7rem', color: '#64748b', flex: 1 }}>{s.label}</span>
                                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: s.color }}>{s.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* ── Resources / Yield Stats Table ──── */}
            {(() => {
                const CO2=0.006,SYRUP=0.25,MAT=28,ELEC=2.5,WATER=1.8;
                const petMap = {};
                ALL_PET_NAMES.forEach(n => { petMap[n] = { name: n, bottles: 0, runMins: 0 }; });
                rawStoppages.forEach(r => {
                    const n = normPet(r.pet_name); if (!n) return;
                    if (!petMap[n]) petMap[n] = { name: n, bottles: 0, runMins: 0 };
                    petMap[n].bottles += r.bottles_produced || 0;
                    petMap[n].runMins += 60 - (r.downtime_minutes || 0);
                });
                const pets = Object.values(petMap).sort((a,b) => parseInt(a.name?.match(/(\d+)/)?.[0]||'999') - parseInt(b.name?.match(/(\d+)/)?.[0]||'999'));
                if (!pets.length) return null;
                const isWater = (name) => /pet\s*5/i.test(name);
                const stats = (p) => [
                    {label:'Bottles',value:p.bottles.toLocaleString(),icon:'ti-bottle',color:'#1d4ed8',raw:p.bottles},
                    {label:'Electricity',value:`${(p.runMins*ELEC).toFixed(0)} kWh`,icon:'ti-bolt',color:'#eab308',raw:p.runMins*ELEC},
                    {label:'Water',value:`${(p.bottles*WATER).toFixed(0)} L`,icon:'ti-droplets',color:'#06b6d4',raw:p.bottles*WATER},
                ].filter(s => s.raw > 0);
                return (
                    <div className="card mb-2">
                        <div className="card-header py-2 d-flex align-items-center gap-2">
                            <i className="ti ti-leaf text-success"></i>
                            <h6 className="mb-0 fw-bold">Resource Consumption</h6>
                            <span className="badge bg-soft-success text-success ms-1">{activeDateLabel}</span>
                            <span className="badge bg-soft-secondary text-secondary ms-1"><i className="ti ti-info-circle me-1"></i>Estimates</span>
                        </div>
                        <div className="card-body p-2">
                            <div className="d-flex gap-2">
                                {pets.map(p => (
                                    <div key={p.name} style={{flex:1}}>
                                        <div className="rounded-3 p-2 h-100" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                            <div className="fw-bold mb-2" style={{ fontSize: '0.8rem', color: '#1e293b' }}>{p.name}</div>
                                            {stats(p).map(s => (
                                                <div key={s.label} className="d-flex align-items-center gap-1 mb-1">
                                                    <i className={`ti ${s.icon}`} style={{ color: s.color, fontSize: '0.85rem', width: 16 }}></i>
                                                    <span style={{ fontSize: '0.7rem', color: '#64748b', flex: 1 }}>{s.label}</span>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>{s.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* ── Resource Consumption by Material ── */}
            {(() => {
                const CO2=0.006,SYRUP=0.25,MAT=28,ELEC=2.5,WATER=1.8;
                const petMap = {};
                ALL_PET_NAMES.forEach(n => { petMap[n] = { name: n, bottles: 0, runMins: 0 }; });
                rawStoppages.forEach(r => {
                    const n = normPet(r.pet_name); if (!n) return;
                    if (!petMap[n]) petMap[n] = { name: n, bottles: 0, runMins: 0 };
                    petMap[n].bottles += r.bottles_produced || 0;
                    petMap[n].runMins += 60 - (r.downtime_minutes || 0);
                });
                const pets = Object.values(petMap).sort((a,b) => parseInt(a.name?.match(/(\d+)/)?.[0]||'999') - parseInt(b.name?.match(/(\d+)/)?.[0]||'999'));
                if (!pets.length) return null;
                const isWater2 = (name) => /pet\s*5/i.test(name);
                const allMaterials = [
                    {label:'Bottles',unit:'',fn:p=>p.bottles,color:'#1d4ed8'},
                    {label:'Electricity',unit:'kWh',fn:p=>p.runMins*ELEC,color:'#eab308'},
                    {label:'Water',unit:'L',fn:p=>p.bottles*WATER,color:'#06b6d4'},
                ];
                return (
                    <div className="card mb-2">
                        <div className="card-header py-2 d-flex align-items-center gap-2">
                            <i className="ti ti-chart-donut text-primary"></i>
                            <h6 className="mb-0 fw-bold">Resource Consumption by PET</h6>
                            <span className="badge bg-soft-primary text-primary ms-1">{activeDateLabel}</span>
                        </div>
                        <div className="card-body p-2">
                            <div className="d-flex flex-nowrap justify-content-around gap-2" style={{overflowX:'auto'}}>
                                {pets.map(p => {
                                    const materials = allMaterials.filter(m => !(m.skipWater && isWater2(p.name)));
                                    const data = materials.map(m => ({name:m.label, value:parseFloat(m.fn(p).toFixed(2)), fill:m.color, unit:m.unit})).filter(d => d.value > 0);
                                    return (
                                        <div key={p.name} style={{flexShrink:0,display:'flex',flexDirection:'column',alignItems:'center'}}>
                                            <div style={{fontSize:'0.72rem',fontWeight:700,color:'#1e293b',marginBottom:4}}>{p.name}</div>
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="d-flex flex-column gap-1">
                                                    {data.map(d => (
                                                        <div key={d.name} className="d-flex align-items-center gap-1">
                                                            <span style={{width:8,height:8,borderRadius:'50%',background:d.fill,flexShrink:0,display:'inline-block'}}></span>
                                                            <span style={{fontSize:'0.62rem',color:'#334155',fontWeight:600,whiteSpace:'nowrap'}}>{d.name}</span>
                                                            <span style={{fontSize:'0.62rem',color:'#64748b',whiteSpace:'nowrap'}}>{d.value.toLocaleString()}{d.unit?` ${d.unit}`:''}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <PieChart width={120} height={120}>
                                                    <Pie data={data} cx={55} cy={55} innerRadius={28} outerRadius={50} dataKey="value" paddingAngle={2}>
                                                        {data.map((d,i) => <Cell key={i} fill={d.fill} />)}
                                                    </Pie>
                                                    <Tooltip formatter={(v,n,props) => [`${Number(v).toLocaleString()}${props.payload.unit?` ${props.payload.unit}`:''}`, n]} contentStyle={{fontSize:'0.7rem',padding:'2px 6px'}} />
                                                </PieChart>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* ── Material Consumptions ──────────── */}
            {(() => {
                const rows = rawReports.filter(r => r.co2_readings || r.syrup_readings || r.production_readings);
                if (!rows.length) return null;
                // Build per-PET data points — seed all known PETs first
                const petMap = {};
                ALL_PET_NAMES.forEach(n => { petMap[n] = { pet: n, Shrink: 0, Syrup: 0, CO2: 0, Preforms: 0, ShrinkLoss: 0, SyrupLoss: 0, CO2Loss: 0, PreformsLoss: 0 }; });
                rows.forEach(r => {
                    const n = normPet(r.pet_name); if (!n) return;
                    if (!petMap[n]) petMap[n] = { pet: n, Shrink: 0, Syrup: 0, CO2: 0, Preforms: 0, ShrinkLoss: 0, SyrupLoss: 0, CO2Loss: 0, PreformsLoss: 0 };
                    petMap[n].Shrink    += parseFloat(r.production_readings?.shrink_reading || 0);
                    petMap[n].ShrinkLoss+= parseFloat(r.production_readings?.blower_rejects || 0);
                    petMap[n].Syrup     += parseFloat(r.syrup_readings?.total_syrup_used_liters || 0);
                    petMap[n].SyrupLoss += parseFloat(r.syrup_readings?.std_syrup_consumption || 0);
                    petMap[n].CO2       += parseFloat(r.co2_readings?.total_co2_consumed_kg || 0);
                    petMap[n].CO2Loss   += parseFloat(r.co2_readings?.std_co2_consumed_kg || 0);
                    petMap[n].Preforms  += (r.materials||[]).flatMap(m=>m.data||[]).filter(d=>d.petline_type==='preform').reduce((a,d)=>a+(d.data?.quantity_per_cage_value||0),0);
                    petMap[n].PreformsLoss += parseFloat(r.production_readings?.filler_rejects || 0);
                });
                const data = Object.values(petMap).sort((a,b) => parseInt(a.pet?.match(/(\d+)/)?.[0]||'999') - parseInt(b.pet?.match(/(\d+)/)?.[0]||'999'));
                if (!data.length) return null;
                const BARS = [
                    {key:'Shrink',lossKey:'ShrinkLoss',color:'#0ea5e9',label:'Shrink (Kg)'},
                    {key:'Syrup',lossKey:'SyrupLoss',color:'#8b5cf6',label:'Syrup (L)'},
                    {key:'CO2',lossKey:'CO2Loss',color:'#06b6d4',label:'CO₂ (Kg)'},
                    {key:'Preforms',lossKey:'PreformsLoss',color:'#f59e0b',label:'Preforms (Pcs)'},
                ];
                return (
                    <div className="card mb-2">
                        <div className="card-header py-2 d-flex align-items-center gap-2">
                            <i className="ti ti-stack text-warning"></i>
                            <h6 className="mb-0 fw-bold">Material Consumptions</h6>
                            <span className="badge bg-soft-warning text-warning ms-1">{activeDateLabel}</span>
                        </div>
                        <div className="card-body p-2">
                            <div className="d-flex flex-nowrap justify-content-around" style={{overflowX:'auto'}}>
                                {BARS.map((b, bi) => {
                                    const PET_COLORS=['#1d4ed8','#0ea5e9','#8b5cf6','#f59e0b','#16a34a','#dc2626','#06b6d4','#ec4899'];
                                    const pieData = data.map((p,i) => ({name:p.pet, value:parseFloat((p[b.key]||0).toFixed(2)), fill:PET_COLORS[i%PET_COLORS.length]})).filter(d => d.value > 0);
                                    const total = pieData.reduce((s,d)=>s+d.value,0);
                                    
                                    // Calculate Yield
                                    const totalLoss = data.reduce((s,p) => s + parseFloat(p[b.lossKey]||0), 0);
                                    let yieldVal = 0;
                                    if (total > 0) {
                                        if (b.key === 'Syrup' || b.key === 'CO2') {
                                            // For Syrup and CO2, Loss stores the Standard/Target consumption
                                            yieldVal = (totalLoss / total) * 100;
                                        } else {
                                            // For Shrink and Preforms, Loss stores the waste/rejects
                                            yieldVal = ((total - totalLoss) / total) * 100;
                                        }
                                    }
                                    const yieldColor = yieldVal >= 98 ? '#16a34a' : yieldVal >= 95 ? '#d97706' : '#dc2626';

                                    return (
                                        <div key={b.key} style={{flexShrink:0,display:'flex',flexDirection:'column',alignItems:'center',borderLeft:bi>0?'1px solid #e2e8f0':'none',paddingLeft:bi>0?16:0,paddingRight:16}}>
                                            <div style={{fontSize:'0.72rem',fontWeight:700,color:b.color,marginBottom:4}}>{b.label}</div>
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="d-flex flex-column gap-1">
                                                    {data.map((p, i) => {
                                                        const val = parseFloat((p[b.key]||0).toFixed(2));
                                                        const loss = parseFloat((p[b.lossKey]||0).toFixed(2));
                                                        let pYield = 0;
                                                        if (val > 0) {
                                                            if (b.key === 'Syrup' || b.key === 'CO2') {
                                                                pYield = (loss / val) * 100;
                                                            } else {
                                                                pYield = ((val - loss) / val) * 100;
                                                            }
                                                        }
                                                        const pFill = PET_COLORS[i % PET_COLORS.length];
                                                        const pYieldColor = pYield >= 98 ? '#16a34a' : pYield >= 95 ? '#d97706' : '#dc2626';

                                                        return (
                                                            <div key={p.pet} className="d-flex align-items-center gap-1">
                                                                <span style={{width:8,height:8,borderRadius:'50%',background:pFill,flexShrink:0,display:'inline-block'}}></span>
                                                                <span style={{fontSize:'0.62rem',color:'#334155',fontWeight:600,whiteSpace:'nowrap'}}>{p.pet}</span>
                                                                <span style={{fontSize:'0.62rem',color:'#64748b',whiteSpace:'nowrap'}}>{val.toLocaleString()}</span>
                                                                {val > 0 && (
                                                                    <span style={{fontSize:'0.58rem',fontWeight:700,color:pYieldColor,marginLeft:'auto'}}>
                                                                        {pYield.toFixed(0)}%
                                                                    </span>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <PieChart width={260} height={260}>
                                                    <Pie data={pieData} cx={125} cy={125} innerRadius={62} outerRadius={105} dataKey="value" paddingAngle={2}>
                                                        {pieData.map((d,i) => <Cell key={i} fill={d.fill}/>)}
                                                    </Pie>
                                                    <Tooltip formatter={(v,n) => [v.toLocaleString(), n]} contentStyle={{fontSize:'0.7rem',padding:'2px 6px'}}/>
                                                </PieChart>
                                            </div>
                                            <div className="d-flex flex-column align-items-center mt-1">
                                                <div style={{fontSize:'0.65rem',fontWeight:700,color:'#1e293b'}}>Total: {total.toLocaleString()}</div>
                                                {total > 0 && (
                                                    <div className="d-flex align-items-center gap-1 mt-1">
                                                        <span style={{fontSize:'0.75rem',color:'#64748b',fontWeight:600}}>Yield:</span>
                                                        <span style={{fontSize:'1.1rem',fontWeight:900,color:yieldColor}}>{yieldVal.toFixed(1)}%</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* ── CO₂ & Syrup Yield ──────────────── */}
            {(() => {
                const CO2=0.006, SYRUP=0.25;
                const petMap = {};
                rawStoppages.forEach(r => {
                    const n = normPet(r.pet_name); if (!n) return;
                    if (!petMap[n]) petMap[n] = { name: n, bottles: 0 };
                    petMap[n].bottles += r.bottles_produced || 0;
                });
                const pets = Object.values(petMap).sort((a,b) => parseInt(a.name?.match(/(\d+)/)?.[0]||'999') - parseInt(b.name?.match(/(\d+)/)?.[0]||'999'));
                if (!pets.length) return null;
                const totalBottles = pets.reduce((s,p)=>s+p.bottles,0);
                return (
                    <div className="card mb-2">
                        <div className="card-header py-2 d-flex align-items-center gap-2">
                            <i className="ti ti-flask text-info"></i>
                            <h6 className="mb-0 fw-bold">CO₂ &amp; Syrup Yield</h6>
                            <span className="badge bg-soft-info text-info ms-1">{activeDateLabel}</span>
                            <span className="badge bg-soft-secondary text-secondary ms-auto">Total: {totalBottles.toLocaleString()} bottles</span>
                        </div>
                        <div className="card-body p-2">
                            <div className="d-flex gap-2">
                                {pets.map(p => {
                                    const co2 = (p.bottles * CO2).toFixed(1);
                                    const syrup = (p.bottles * SYRUP / 1000).toFixed(1);
                                    const co2Pct = totalBottles > 0 ? ((p.bottles / totalBottles) * 100).toFixed(1) : 0;
                                    const syrupPct = co2Pct;
                                    return (
                                        <div key={p.name} style={{flex:1}}>
                                            <div className="rounded-3 p-2 h-100" style={{ background: '#f0f9ff', border: '1px solid #bae6fd' }}>
                                                <div className="fw-bold mb-2" style={{ fontSize: '0.8rem', color: '#0c4a6e' }}>{p.name}</div>
                                                <div className="mb-2">
                                                    <div className="d-flex align-items-center gap-1 mb-1">
                                                        <i className="ti ti-cloud" style={{ color: '#0ea5e9', fontSize: '0.85rem', width: 16 }}></i>
                                                        <span style={{ fontSize: '0.7rem', color: '#64748b', flex: 1 }}>CO₂ Yield</span>
                                                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0ea5e9' }}>{co2Pct}%</span>
                                                    </div>
                                                    <div style={{ height: 6, background: '#e0f2fe', borderRadius: 3, overflow: 'hidden' }}>
                                                        <div style={{ width: `${co2Pct}%`, height: '100%', background: '#0ea5e9', borderRadius: 3 }} />
                                                    </div>
                                                    <div style={{ fontSize: '0.65rem', color: '#94a3b8', textAlign: 'right' }}>{co2} kg</div>
                                                </div>
                                                <div>
                                                    <div className="d-flex align-items-center gap-1 mb-1">
                                                        <i className="ti ti-droplet" style={{ color: '#8b5cf6', fontSize: '0.85rem', width: 16 }}></i>
                                                        <span style={{ fontSize: '0.7rem', color: '#64748b', flex: 1 }}>Syrup Yield</span>
                                                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#8b5cf6' }}>{syrupPct}%</span>
                                                    </div>
                                                    <div style={{ height: 6, background: '#ede9fe', borderRadius: 3, overflow: 'hidden' }}>
                                                        <div style={{ width: `${syrupPct}%`, height: '100%', background: '#8b5cf6', borderRadius: 3 }} />
                                                    </div>
                                                    <div style={{ fontSize: '0.65rem', color: '#94a3b8', textAlign: 'right' }}>{syrup} L</div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* ── CO₂ vs Syrup Yield Comparison ───── */}
            {(() => {
                const CO2=0.006, SYRUP=0.25;
                const petMap = {};
                hourlyOeeByLine.forEach(l => { if (l.name) petMap[l.name] = { name: l.name, bottles: 0, runMins: 0 }; });
                rawStoppages.forEach(r => {
                    const n = normPet(r.pet_name); if (!n) return;
                    if (!petMap[n]) petMap[n] = { name: n, bottles: 0, runMins: 0 };
                    petMap[n].bottles += r.bottles_produced || 0;
                    petMap[n].runMins += 60 - (r.downtime_minutes || 0);
                });
                const pets = Object.values(petMap).sort((a,b) => parseInt(a.name?.match(/(\d+)/)?.[0]||'999') - parseInt(b.name?.match(/(\d+)/)?.[0]||'999'));
                if (!pets.length) return null;
                const co2Rates = pets.map(p => p.runMins > 0 ? (p.bottles*CO2)/p.runMins : 0);
                const syrupRates = pets.map(p => p.runMins > 0 ? (p.bottles*SYRUP/1000)/p.runMins : 0);
                const maxCO2 = Math.max(...co2Rates, 0.001);
                const maxSyrup = Math.max(...syrupRates, 0.001);
                return (
                    <div className="card mb-2">
                        <div className="card-header py-2 d-flex align-items-center gap-2">
                            <i className="ti ti-gauge text-info"></i>
                            <h6 className="mb-0 fw-bold">CO₂ vs Syrup Yield Comparison</h6>
                            <span className="badge bg-soft-info text-info ms-1">{activeDateLabel}</span>
                        </div>
                        <div className="card-body p-2">
                            <div className="d-flex flex-nowrap justify-content-around gap-2" style={{overflowX:'auto'}}>
                                {pets.map((p,i) => (
                                    <DualGauge key={p.name}
                                        co2Pct={(co2Rates[i]/maxCO2)*100}
                                        syrupPct={(syrupRates[i]/maxSyrup)*100}
                                        label={p.name} size={160}
                                    />
                                ))}
                            </div>
                            <div className="text-center mt-1" style={{fontSize:'0.8rem',color:'#94a3b8'}}>Needles show CO₂ (blue) &amp; Syrup (purple) yield rate per run minute, normalized to best line = 100</div>
                        </div>
                    </div>
                );
            })()}

            {/* ── Stoppage Category Horizontal Bar Chart ── */}
            {downtimeCategories.length > 0 && (() => {
                const max = downtimeCategories[0]?.value || 1;
                const total = downtimeCategories.reduce((s,c)=>s+c.value,0);
                const allSubs = downtimeCategories.flatMap(cat => cat.subs?.map(s=>({...s,catColor:cat.color,catName:cat.name}))||[]).sort((a,b)=>b.value-a.value);
                const subMax = allSubs[0]?.value || 1;
                return (
                    <>
                            <div className="card mb-2">
                                <div className="card-header py-2 d-flex align-items-center gap-2">
                                    <i className="ti ti-chart-bar text-danger"></i>
                                    <h6 className="mb-0 fw-bold">Stoppage Categories</h6>
                                    <span className="badge bg-soft-danger text-danger ms-1">{activeDateLabel}</span>
                                    <span className="badge bg-danger ms-auto">{total} min</span>
                                </div>
                                <div className="card-body py-2">
                                    <div className="d-flex flex-column gap-2">
                                        {downtimeCategories.map(cat => { const pct=((cat.value/total)*100).toFixed(1); return (
                                            <div key={cat.name}>
                                                <div className="d-flex justify-content-between mb-1"><span style={{fontSize:'0.8rem',fontWeight:600,color:'#334155'}}>{cat.name}</span><span style={{fontSize:'0.8rem',fontWeight:700,color:cat.color}}>{cat.value} min <span style={{color:'#94a3b8',fontWeight:500}}>({pct}%)</span></span></div>
                                                <div style={{height:14,background:'#f1f5f9',borderRadius:6,overflow:'hidden'}}><div style={{width:`${(cat.value/max)*100}%`,height:'100%',background:cat.color,borderRadius:6,transition:'width 0.6s ease'}} /></div>
                                            </div>
                                        ); })}
                                    </div>
                                </div>
                            </div>
                            <div className="card mb-2">
                                <div className="card-header py-2 d-flex align-items-center gap-2">
                                    <i className="ti ti-list text-warning"></i>
                                    <h6 className="mb-0 fw-bold">Sub-Categories</h6>
                                    <span className="badge bg-warning ms-auto">{allSubs.length} types</span>
                                </div>
                                <div className="card-body py-2">
                                    {allSubs.length > 0 ? (
                                        <div className="d-flex flex-column gap-2">
                                            {allSubs.map(sub => (
                                                <div key={sub.name+sub.catName}>
                                                    <div className="d-flex justify-content-between mb-1"><span style={{fontSize:'0.78rem',fontWeight:600,color:'#334155'}}>{sub.name}</span><span style={{fontSize:'0.78rem',fontWeight:700,color:sub.catColor}}>{sub.value} min <span style={{fontSize:'0.7rem',color:'#94a3b8',fontWeight:400}}>({sub.catName})</span></span></div>
                                                    <div style={{height:10,background:'#f1f5f9',borderRadius:4,overflow:'hidden'}}><div style={{width:`${(sub.value/subMax)*100}%`,height:'100%',background:sub.catColor,opacity:0.7,borderRadius:4}} /></div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : <div className="text-muted text-center py-3" style={{fontSize:'0.8rem'}}>No sub-category data</div>}
                                </div>
                            </div>
                    </>
                );
            })()}

            {/* ── Shift + Production Lines ────────── */}
            </> /* end non-slider mode */
            )}

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
                                ((Hours × 60) − Total Downtime) / ((Hours × 60) − Planned Downtime) × 100
                            </div>
                            <div className="font-monospace mt-1" style={{ fontSize: '0.7rem', color: '#1565c0' }}>
                                ({(() => {
                                    const time = selectedLine.stoppageCount * 60;
                                    const td = Math.round(selectedLine.perfRaw?.totalDowntime || 0);
                                    const pd = Math.round(selectedLine.perfRaw?.plannedDowntime || 0);
                                    return `(${time} − ${td}) / (${time} − ${pd}) × 100 = ${selectedLine.performance.toFixed(1)}%`;
                                })()}
                            </div>
                        </div>
                        {/* Detail rows */}
                        {[
                            { label: 'Time (Hours × 60)', value: `${selectedLine.stoppageCount * 60} min (${selectedLine.stoppageCount} hour${selectedLine.stoppageCount !== 1 ? 's' : ''} submitted)`, color: '#2e7d32' },
                            { label: 'Bottles Produced', value: formatN(Math.round(selectedLine.production)), color: '#1565c0' },
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
                    <div className="rounded-4 p-4" style={{ background: '#fff', width: '92vw', maxWidth: 1400, maxHeight: '85vh', overflow: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}
                        onClick={e => e.stopPropagation()}>
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <h5 className="mb-0 fw-bold"><i className="ti ti-alert-triangle me-2 text-warning"></i>Stoppage Reports ({rawStoppages.length})</h5>
                            <button className="btn btn-sm btn-light" onClick={() => setShowReportsModal(false)} style={{ borderRadius: '50%', width: 32, height: 32, padding: 0 }}>
                                <i className="ti ti-x"></i>
                            </button>
                        </div>
                        <div className="d-flex gap-2 mb-3 flex-wrap">
                            <select className="form-select form-select-sm" style={{width:'auto'}} value={modalFilterPet} onChange={e => setModalFilterPet(e.target.value)}>
                                <option value="">All PET Lines</option>
                                {[...new Set(rawStoppages.map(s => s.pet_name).filter(Boolean))].sort().map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                            <input type="date" className="form-control form-control-sm" style={{width:'auto'}} value={modalFilterDate} onChange={e => setModalFilterDate(e.target.value)} />
                            {(modalFilterPet || modalFilterDate) && <button className="btn btn-sm btn-outline-secondary" onClick={() => { setModalFilterPet(''); setModalFilterDate(''); }}>Clear</button>}
                        </div>
                        {(() => {
                            const filtered = rawStoppages.filter(s =>
                                (!modalFilterPet || s.pet_name === modalFilterPet) &&
                                (!modalFilterDate || s.log_date === modalFilterDate || s.production_date === modalFilterDate)
                            );
                            if (!filtered.length) return <div className="text-center py-4 text-muted">No stoppages match the filter</div>;
                            return (
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
                                    {filtered.map(s => (
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
                            );
                        })()}
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
