import React, { useState } from 'react';
import { useRefresh } from '../../context/RefreshContext';

const RefreshSettings = () => {
    const { enabled, setEnabled, interval, setInterval } = useRefresh();
    const [showModal, setShowModal] = useState(false);
    const [tempInterval, setTempInterval] = useState(interval / 1000);

    const handleSave = () => {
        setInterval(tempInterval * 1000);
        setShowModal(false);
    };

    const intervalOptions = [
        { label: '10 seconds', value: 10 },
        { label: '30 seconds', value: 30 },
        { label: '1 minute', value: 60 },
        { label: '2 minutes', value: 120 },
        { label: '5 minutes', value: 300 }
    ];

    return (
        <>
            <button 
                className="topbar-link btn" 
                type="button"
                onClick={() => setShowModal(true)}
                title="Refresh Settings"
            >
                <i className={`ti ti-refresh fs-16 ${enabled ? 'text-success' : ''}`}></i>
            </button>

            {showModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Auto-Refresh Settings</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="form-check form-switch mb-3">
                                    <input 
                                        className="form-check-input" 
                                        type="checkbox" 
                                        id="refreshEnabled"
                                        checked={enabled}
                                        onChange={(e) => setEnabled(e.target.checked)}
                                    />
                                    <label className="form-check-label" htmlFor="refreshEnabled">
                                        Enable Auto-Refresh
                                    </label>
                                </div>
                                
                                {enabled && (
                                    <div>
                                        <label className="form-label">Refresh Interval</label>
                                        <select 
                                            className="form-select"
                                            value={tempInterval}
                                            onChange={(e) => setTempInterval(Number(e.target.value))}
                                        >
                                            {intervalOptions.map(opt => (
                                                <option key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="button" className="btn btn-primary" onClick={handleSave}>
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default RefreshSettings;
