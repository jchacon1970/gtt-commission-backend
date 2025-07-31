import { QfDashboardRepository } from "../repositories/qf_dashboard_repository.js";

export class QfDashboardController {
    constructor() {
        this.qfChartsRepository = new QfDashboardRepository();
    }

    async loadsPerCustomerByDate(req, res) {
        try {
            const { beginDate, endDate } = req.query;
            const data = await this.qfChartsRepository.loadsByCustomerByDate(beginDate, endDate);

            if (data.hasValue()) {
                return res.status(200).json({
                    success: true,
                    chart: data.value
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: data.error
                });
            }
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
                error: error.message
            });
        }
    }

    async loadsPerCarrierByDateRange(req, res) {
        try {
            const { beginDate, endDate } = req.query;
            const data = await this.qfChartsRepository.loadsPerCarrierByDateRange(beginDate, endDate);

            if (data.hasValue()) {
                return res.status(200).json({
                    success: true,
                    chart: data.value
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: data.error
                });
            }
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
                error: error.message
            });
        }
    }

    async loadsByRangeDate(req, res) {
        try {
            const { beginDate, endDate } = req.query;
            const data = await this.qfChartsRepository.loadsByRangeDate(beginDate, endDate);

            if (data.hasValue()) {
                return res.status(200).json({
                    success: true,
                    chart: data.value
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: data.error
                });
            }
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
                error: error.message
            });
        }
    }

    async loadsPerCityDestinationByDateRange(req, res) {
        try {
            const { beginDate, endDate } = req.query;
            const data = await this.qfChartsRepository.loadsPerCityDestinationByDateRange(beginDate, endDate);

            if (data.hasValue()) {
                return res.status(200).json({
                    success: true,
                    chart: data.value
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: data.error
                });
            }
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
                error: error.message
            });
        }
    }

    async loadsPerCityOriginByDateRange(req, res) {
        try {
            const { beginDate, endDate } = req.query;
            const data = await this.qfChartsRepository.loadsPerCityOriginByDateRange(beginDate, endDate);

            if (data.hasValue()) {
                return res.status(200).json({
                    success: true,
                    chart: data.value
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: data.error
                });
            }
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
                error: error.message
            });
        }
    }

    async loadsPerStateDestinationByDateRange(req, res) {
        try {
            const { beginDate, endDate } = req.query;
            const data = await this.qfChartsRepository.loadsPerStateDestinationByDateRange(beginDate, endDate);

            if (data.hasValue()) {
                return res.status(200).json({
                    success: true,
                    chart: data.value
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: data.error
                });
            }
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
                error: error.message
            });
        }
    }

    async loadsPerStateOriginByDateRange(req, res) {
        try {
            const { beginDate, endDate } = req.query;
            const data = await this.qfChartsRepository.loadsPerStateOriginByDateRange(beginDate, endDate);

            if (data.hasValue()) {
                return res.status(200).json({
                    success: true,
                    chart: data.value
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: data.error
                });
            }
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
                error: error.message
            });
        }
    }
}
