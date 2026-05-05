import api from './axios';

export const productionApi = {
    getShifts: () => api.get('/production/shifts/'),
    getStoppagesSummary: (params) => api.get('/production/stoppages/stoppages_summary/', { params }),
    getStoppages: (params) => api.get('/production/stoppages/', { params }),
    getPets: (params) => api.get('/core/pets/', { params }),
    getReports: (params) => api.get('/production/reports/', { params }),
    getReportOeeMetrics: (id) => api.get(`/production/reports/${id}/oee_metrics/`),
    getOeeSummary: (params) => api.get('/production/reports/oee_summary/', { params }),
    getMaterialConsumptions: (params) => api.get('/production/material-consumptions/', { params }),
    getTodayYesterdayComparison: () => api.get('/production/dashboard/today_yesterday_comparison/'),
    getShiftPetMetrics: (params) => api.get('/production/dashboard/shift_pet_metrics/', { params }),
    getMetricsComparison: () => api.get('/production/dashboard/metrics_comparison/'),
};
