import api from './axios';

export const productionApi = {
    getShifts: () => api.get('/production/shifts/'),
    getStoppagesSummary: (params) => api.get('/production/stoppages/stoppages_summary/', { params }),
    getStoppages: (params) => api.get('/production/stoppages/', { params }),
    getPets: (params) => api.get('/core/pets/', { params }),
    getReports: (params) => api.get('/production/reports/', { params }),
    getReportOeeMetrics: (id) => api.get(`/production/reports/${id}/oee_metrics/`),
};
