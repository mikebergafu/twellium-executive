import React from 'react';

class ChartErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('[ChartErrorBoundary]', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="card flex-fill">
                    <div className="card-body d-flex flex-column align-items-center justify-content-center py-5">
                        <i className="ti ti-chart-bar-off fs-1 text-muted mb-3"></i>
                        <p className="text-muted mb-2">
                            {this.props.fallbackMessage || 'This chart failed to render'}
                        </p>
                        <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={this.handleRetry}
                        >
                            <i className="ti ti-refresh me-1"></i>Retry
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ChartErrorBoundary;

/* Inline error state for API-level failures (not render crashes) */
export const SectionError = ({ message, onRetry }) => (
    <div className="card flex-fill">
        <div className="card-body d-flex flex-column align-items-center justify-content-center py-5">
            <i className="ti ti-alert-triangle fs-1 text-warning mb-3"></i>
            <p className="text-muted mb-2">{message || 'Failed to load data'}</p>
            {onRetry && (
                <button className="btn btn-outline-primary btn-sm" onClick={onRetry}>
                    <i className="ti ti-refresh me-1"></i>Retry
                </button>
            )}
        </div>
    </div>
);
