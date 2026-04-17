import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

/* ── Stat Card Skeleton ─────────────────────────── */
export const SkeletonStatCard = () => (
    <div className="col-xl-3 col-sm-6 d-flex">
        <div className="card flex-fill mb-0">
            <div className="card-body">
                <div className="d-flex align-items-start justify-content-between">
                    <div style={{ flex: 1 }}>
                        <Skeleton width="60%" height={12} style={{ marginBottom: 10 }} />
                        <Skeleton width="40%" height={24} style={{ marginBottom: 8 }} />
                        <Skeleton width="75%" height={11} />
                    </div>
                    <Skeleton circle width={48} height={48} />
                </div>
            </div>
        </div>
    </div>
);

export const SkeletonStatCards = ({ count = 4 }) => (
    <div className="row row-gap-3 mb-4">
        {Array.from({ length: count }).map((_, i) => (
            <SkeletonStatCard key={i} />
        ))}
    </div>
);

/* ── Gauge Skeleton ─────────────────────────────── */
export const SkeletonGauge = () => (
    <div className="col-lg-3 col-sm-6 d-flex justify-content-center">
        <div className="d-flex flex-column align-items-center p-4 border rounded-3 shadow-sm w-100">
            <Skeleton width="50%" height={14} style={{ marginBottom: 20 }} />
            <Skeleton circle width={140} height={140} style={{ margin: '8px 0' }} />
            <Skeleton width="35%" height={20} style={{ marginTop: 12 }} />
        </div>
    </div>
);

export const SkeletonGauges = ({ count = 4 }) => (
    <div className="row row-gap-3 mb-4">
        <div className="col-12">
            <div className="card">
                <div className="card-header">
                    <Skeleton width="35%" height={16} />
                </div>
                <div className="card-body">
                    <div className="row g-3">
                        {Array.from({ length: count }).map((_, i) => (
                            <SkeletonGauge key={i} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

/* ── Chart Skeleton ─────────────────────────────── */
export const SkeletonChart = ({ height = 350, title }) => (
    <div className="card flex-fill">
        {title && (
            <div className="card-header">
                <Skeleton width="40%" height={16} />
            </div>
        )}
        <div className="card-body">
            <Skeleton height={height} />
        </div>
    </div>
);

/* ── Table Skeleton ─────────────────────────────── */
export const SkeletonTable = ({ rows = 4, cols = 6 }) => (
    <div className="card flex-fill">
        <div className="card-header d-flex align-items-center justify-content-between">
            <Skeleton width="30%" height={16} />
            <Skeleton width={80} height={32} />
        </div>
        <div className="card-body p-0">
            <div className="table-responsive">
                <table className="table mb-0">
                    <thead className="table-light">
                        <tr>
                            {Array.from({ length: cols }).map((_, i) => (
                                <th key={i} className="ps-3">
                                    <Skeleton width="70%" height={12} />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: rows }).map((_, row) => (
                            <tr key={row}>
                                {Array.from({ length: cols }).map((_, col) => (
                                    <td key={col} className="ps-3">
                                        <Skeleton width={col === 0 ? '80%' : '50%'} height={12} />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);

/* ── Downtime List Skeleton ─────────────────────── */
export const SkeletonDowntimeList = () => (
    <div className="card flex-fill">
        <div className="card-header d-flex align-items-center justify-content-between">
            <div>
                <Skeleton width={180} height={16} style={{ marginBottom: 6 }} />
                <Skeleton width={250} height={11} />
            </div>
            <Skeleton width={60} height={28} />
        </div>
        <div className="card-body">
            <div className="alert alert-light border mb-4 p-3">
                <Skeleton width="40%" height={12} style={{ marginBottom: 8 }} />
                <Skeleton width="30%" height={24} />
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border rounded p-3 mb-3">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                        <div className="d-flex align-items-center gap-2">
                            <Skeleton width={32} height={32} />
                            <Skeleton width={120} height={14} />
                        </div>
                        <div className="text-end">
                            <Skeleton width={50} height={14} style={{ marginBottom: 4 }} />
                            <Skeleton width={30} height={10} />
                        </div>
                    </div>
                    <Skeleton height={8} />
                </div>
            ))}
        </div>
    </div>
);

/* ── Donut Chart Skeleton ───────────────────────── */
export const SkeletonDonut = ({ title }) => (
    <div className="card flex-fill">
        {title !== false && (
            <div className="card-header">
                <Skeleton width="50%" height={16} />
            </div>
        )}
        <div className="card-body d-flex flex-column align-items-center">
            <Skeleton circle width={150} height={150} style={{ marginBottom: 20 }} />
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="d-flex align-items-center justify-content-between w-100 mb-2">
                    <Skeleton width="40%" height={12} />
                    <Skeleton width={30} height={12} />
                </div>
            ))}
        </div>
    </div>
);

/* ── Enhanced Page Skeleton ─────────────────────── */
export const SkeletonPage = ({ sections = 3 }) => (
    <div className="animate-in">
        {/* Page Header */}
        <div className="d-flex align-items-center justify-content-between gap-2 mb-4">
            <div>
                <Skeleton width={180} height={28} style={{ marginBottom: 8 }} />
                <Skeleton width={280} height={14} />
            </div>
            <Skeleton width={120} height={36} />
        </div>
        
        {/* Filters */}
        <div className="card mb-4">
            <div className="card-body">
                <div className="row g-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="col-md-3">
                            <Skeleton height={40} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
        
        {/* Stat Cards */}
        <div className="row row-gap-3 mb-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonStatCard key={i} />
            ))}
        </div>
        
        {/* Charts and Tables */}
        {Array.from({ length: sections }).map((_, i) => (
            <div key={i} className="card mb-4">
                <div className="card-header">
                    <Skeleton width="30%" height={16} />
                </div>
                <div className="card-body">
                    <Skeleton height={250} />
                </div>
            </div>
        ))}
    </div>
);
