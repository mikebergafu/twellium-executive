import api from './axios';

export const productionApi = {
    getLines: () => api.get('/production/lines/'),
    getShifts: () => api.get('/production/shifts/'),
    getShift: (id) => api.get(`/production/shifts/${id}/`),
    getOeeSummary: (params) => api.get('/production/reports/oee_summary/', { params }),
    getShiftOeeSummary: (params) => api.get('/production/reports/oee_summary/', { params }),

    getReports: (params) => api.get('/production/reports/', { params }),
    getReport: (id) => api.get(`/production/reports/${id}/`),
    getMaterialConsumptions: (params) => api.get('/production/material-consumptions/', { params }),
    createReport: (data) => api.post('/production/reports/', data),
    updateReport: (id, data) => api.patch(`/production/reports/${id}/`, data),
    deleteReport: (id) => api.delete(`/production/reports/${id}/`),

    updateStatus: (id, status) => api.post(`/production/reports/${id}/update_status/`, { status }),
    addBatch: (id, data) => api.post(`/production/reports/${id}/add_batch/`, data),
    addMaterial: (id, data) => api.post(`/production/reports/${id}/add_material/`, data),
    addStoppages: (id, data) => api.post(`/production/reports/${id}/add_stoppage_logs/`, data),
    addProductionReading: (id, data) => api.post(`/production/reports/${id}/add_production_reading/`, data),
    addSyrupReading: (id, data) => api.post(`/production/reports/${id}/add_syrup_reading/`, data),
    addCO2Reading: (id, data) => api.post(`/production/reports/${id}/add_co2_reading/`, data),

    getRuns: (params) => api.get('/production/runs/', { params }),
    startRun: (data) => api.post('/production/runs/', data),
    stopRun: (id) => api.post(`/production/runs/${id}/stop/`),


    getStoppages: (params) => api.get('/production/stoppages/', { params }),
    getStoppagesSummary: (params) => api.get('/production/stoppages/stoppages_summary/', { params }),
    getShiftGroupStoppagesSummary: (params) => api.get('/production/stoppages/stoppages_summary/', { params }),
    getStoppage: (id) => api.get(`/production/stoppages/${id}/`),
    createStoppage: (data) => api.post('/production/stoppages/', data),
    updateStoppage: (id, data) => api.patch(`/production/stoppages/${id}/`, data),
    deleteStoppage: (id) => api.delete(`/production/stoppages/${id}/`),
    addIncident: (id, data) => api.post(`/production/stoppages/${id}/add_incident/`, data),

    getDowntimeCategories: (params) => api.get('/production/downtime-categories/', { params }),
    createDowntimeCategory: (data) => api.post('/production/downtime-categories/', data),
    updateDowntimeCategory: (id, data) => api.patch(`/production/downtime-categories/${id}/`, data),
    deleteDowntimeCategory: (id) => api.delete(`/production/downtime-categories/${id}/`),

    getDowntimeSubCategories: (params) => api.get('/production/downtime-sub-categories/', { params }),
    createDowntimeSubCategory: (data) => api.post('/production/downtime-sub-categories/', data),
    updateDowntimeSubCategory: (id, data) => api.patch(`/production/downtime-sub-categories/${id}/`, data),
    deleteDowntimeSubCategory: (id) => api.delete(`/production/downtime-sub-categories/${id}/`),

    getIncidentCategories: (params) => api.get('/production/incident-categories/', { params }),
    createIncidentCategory: (data) => api.post('/production/incident-categories/', data),
    updateIncidentCategory: (id, data) => api.patch(`/production/incident-categories/${id}/`, data),
    deleteIncidentCategory: (id) => api.delete(`/production/incident-categories/${id}/`),

    getMaterials: (params) => api.get('/production/materials/', { params }),
    createMaterial: (data) => api.post('/production/materials/', data),
    updateMaterial: (id, data) => api.patch(`/production/materials/${id}/`, data),
    deleteMaterial: (id) => api.delete(`/production/materials/${id}/`),

    getMeters: (params) => api.get('/production/meters/', { params }),
    createMeter: (data) => api.post('/production/meters/', data),
    updateMeter: (id, data) => api.patch(`/production/meters/${id}/`, data),
    deleteMeter: (id) => api.delete(`/production/meters/${id}/`),

    getPets: (params) => api.get('/core/pets/', { params }),
    createPet: (data) => api.post('/core/pets/', data),
    updatePet: (id, data) => api.patch(`/core/pets/${id}/`, data),
    deletePet: (id) => api.delete(`/core/pets/${id}/`),

    createShift: (data) => api.post('/production/shifts/', data),
    updateShift: (id, data) => api.patch(`/production/shifts/${id}/`, data),
    deleteShift: (id) => api.delete(`/production/shifts/${id}/`),

    getBatches: (params) => api.get('/production/batches/', { params }),
    createBatch: (data) => api.post('/production/batches/', data),
    updateBatch: (id, data) => api.patch(`/production/batches/${id}/`, data),
    deleteBatch: (id) => api.delete(`/production/batches/${id}/`),

    getSuppliers: (params) => api.get('/production/suppliers/', { params }),
    createSupplier: (data) => api.post('/production/suppliers/', data),
    updateSupplier: (id, data) => api.patch(`/production/suppliers/${id}/`, data),
    deleteSupplier: (id) => api.delete(`/production/suppliers/${id}/`),

    getPreformColors: (params) => api.get('/production/preform-colors/', { params }),
    createPreformColor: (data) => api.post('/production/preform-colors/', data),
    updatePreformColor: (id, data) => api.patch(`/production/preform-colors/${id}/`, data),
    deletePreformColor: (id) => api.delete(`/production/preform-colors/${id}/`),

    getCapTypes: (params) => api.get('/production/cap-types/', { params }),
    createCapType: (data) => api.post('/production/cap-types/', data),
    updateCapType: (id, data) => api.patch(`/production/cap-types/${id}/`, data),
    deleteCapType: (id) => api.delete(`/production/cap-types/${id}/`),

    getCapColors: (params) => api.get('/production/cap-colors/', { params }),
    createCapColor: (data) => api.post('/production/cap-colors/', data),
    updateCapColor: (id, data) => api.patch(`/production/cap-colors/${id}/`, data),
    deleteCapColor: (id) => api.delete(`/production/cap-colors/${id}/`),

    getLabelProductSizes: (params) => api.get('/production/label-product-sizes/', { params }),
    createLabelProductSize: (data) => api.post('/production/label-product-sizes/', data),
    updateLabelProductSize: (id, data) => api.patch(`/production/label-product-sizes/${id}/`, data),
    deleteLabelProductSize: (id) => api.delete(`/production/label-product-sizes/${id}/`),

    getLabelNames: (params) => api.get('/production/label-names/', { params }),
    createLabelName: (data) => api.post('/production/label-names/', data),
    updateLabelName: (id, data) => api.patch(`/production/label-names/${id}/`, data),
    deleteLabelName: (id) => api.delete(`/production/label-names/${id}/`),

    getShrinkProductSizes: (params) => api.get('/production/shrink-product-sizes/', { params }),
    createShrinkProductSize: (data) => api.post('/production/shrink-product-sizes/', data),
    updateShrinkProductSize: (id, data) => api.patch(`/production/shrink-product-sizes/${id}/`, data),
    deleteShrinkProductSize: (id) => api.delete(`/production/shrink-product-sizes/${id}/`),

    getPackSizes: (params) => api.get('/production/pack-sizes/', { params }),
    createPackSize: (data) => api.post('/production/pack-sizes/', data),
    updatePackSize: (id, data) => api.patch(`/production/pack-sizes/${id}/`, data),
    deletePackSize: (id) => api.delete(`/production/pack-sizes/${id}/`),

    getShrinkNames: (params) => api.get('/production/shrink-names/', { params }),
    createShrinkName: (data) => api.post('/production/shrink-names/', data),
    updateShrinkName: (id, data) => api.patch(`/production/shrink-names/${id}/`, data),
    deleteShrinkName: (id) => api.delete(`/production/shrink-names/${id}/`),


    getPreformSizes: (params) => api.get('/production/preform-sizes/', { params }),
    createPreformSize: (data) => api.post('/production/preform-sizes/', data),
    updatePreformSize: (id, data) => api.patch(`/production/preform-sizes/${id}/`, data),
    deletePreformSize: (id) => api.delete(`/production/preform-sizes/${id}/`),


    getCageQuantities: (params) => api.get('/production/cage-quantities/', { params }),
    createCageQuantity: (data) => api.post('/production/cage-quantities/', data),
    updateCageQuantity: (id, data) => api.patch(`/production/cage-quantities/${id}/`, data),
    deleteCageQuantity: (id) => api.delete(`/production/cage-quantities/${id}/`),

    getCapBoxQuantities: (params) => api.get('/production/cap-box-quantities/', { params }),
    createCapBoxQuantity: (data) => api.post('/production/cap-box-quantities/', data),
    updateCapBoxQuantity: (id, data) => api.patch(`/production/cap-box-quantities/${id}/`, data),
    deleteCapBoxQuantity: (id) => api.delete(`/production/cap-box-quantities/${id}/`),


    getProductionRanges: (params) => api.get('/production/production-ranges/', { params }),
    createProductionRange: (data) => api.post('/production/production-ranges/', data),
    updateProductionRange: (id, data) => api.patch(`/production/production-ranges/${id}/`, data),
    deleteProductionRange: (id) => api.delete(`/production/production-ranges/${id}/`),


    getMeasuringUnits: (params) => api.get('/production/measuring-units/', { params }),
    createMeasuringUnit: (data) => api.post('/production/measuring-units/', data),
    updateMeasuringUnit: (id, data) => api.patch(`/production/measuring-units/${id}/`, data),
    deleteMeasuringUnit: (id) => api.delete(`/production/measuring-units/${id}/`),

    getStandardCO2s: (params) => api.get('/production/standard-co2s/', { params }),
    createStandardCO2: (data) => api.post('/production/standard-co2s/', data),
    updateStandardCO2: (id, data) => api.patch(`/production/standard-co2s/${id}/`, data),
    deleteStandardCO2: (id) => api.delete(`/production/standard-co2s/${id}/`),


    getSyrupDensities: (params) => api.get('/production/syrup-densities/', { params }),
    createSyrupDensity: (data) => api.post('/production/syrup-densities/', data),
    updateSyrupDensity: (id, data) => api.patch(`/production/syrup-densities/${id}/`, data),
    deleteSyrupDensity: (id) => api.delete(`/production/syrup-densities/${id}/`),


    getSyrupDilutionRatios: (params) => api.get('/production/syrup-dilution-ratios/', { params }),
    createSyrupDilutionRatio: (data) => api.post('/production/syrup-dilution-ratios/', data),
    updateSyrupDilutionRatio: (id, data) => api.patch(`/production/syrup-dilution-ratios/${id}/`, data),
    deleteSyrupDilutionRatio: (id) => api.delete(`/production/syrup-dilution-ratios/${id}/`),


    getSyrupConcentrations: (params) => api.get('/production/syrup-concentrations/', { params }),
    createSyrupConcentration: (data) => api.post('/production/syrup-concentrations/', data),
    updateSyrupConcentration: (id, data) => api.patch(`/production/syrup-concentrations/${id}/`, data),
    deleteSyrupConcentration: (id) => api.delete(`/production/syrup-concentrations/${id}/`),


    getBottlesPerPack: (params) => api.get('/production/bottles-per-pack/', { params }),
    createBottlesPerPack: (data) => api.post('/production/bottles-per-pack/', data),
    updateBottlesPerPack: (id, data) => api.patch(`/production/bottles-per-pack/${id}/`, data),
    deleteBottlesPerPack: (id) => api.delete(`/production/bottles-per-pack/${id}/`),


    getLineSpeeds: (params) => api.get('/production/line-speeds/', { params }),
    createLineSpeed: (data) => api.post('/production/line-speeds/', data),
    updateLineSpeed: (id, data) => api.patch(`/production/line-speeds/${id}/`, data),
    deleteLineSpeed: (id) => api.delete(`/production/line-speeds/${id}/`),
};
