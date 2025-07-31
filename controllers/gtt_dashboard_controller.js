import { GttDashboardRepository } from "../repositories/gtt_dashboard_repository.js";

export class GttDashboardController {
    constructor() {
        this.gttDashboardRepository = new GttDashboardRepository();
    }

    async callVolumePerAgentByDateRange(req, res) {
        try {
            const { beginDate, endDate } = req.query;
            const data = await this.gttDashboardRepository.callVolumePerAgentByDateRange(beginDate, endDate);

            if (data.hasValue()) {
                return res.status(200).json({
                    success: true,
                    chart: data.value,
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: data.error,
                });
            }
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
                error: error.message,
            });
        }
    }

    async totalTimeOnCallPerAgentByDateRange(req, res) {
        try {
            const { beginDate, endDate } = req.query;
            const data = await this.gttDashboardRepository.totalTimeOnCallPerAgentByDateRange(beginDate, endDate);

            if (data.hasValue()) {
                return res.status(200).json({
                    success: true,
                    chart: data.value,
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: data.error,
                });
            }
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
                error: error.message,
            });
        }
    }

    async averageCallTimePerAgentByDateRange(req, res) {
        try {
            const { beginDate, endDate } = req.query;
            const data = await this.gttDashboardRepository.averageCallTimePerAgentByDateRange(beginDate, endDate);

            if (data.hasValue()) {
                return res.status(200).json({
                    success: true,
                    chart: data.value,
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: data.error,
                });
            }
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
                error: error.message,
            });
        }
    }

    async callDispositionSummaryByDateRange(req, res) {
        try {
            const { beginDate, endDate } = req.query;
            const data = await this.gttDashboardRepository.callDispositionSummaryByDateRange(beginDate, endDate);

            if (data.hasValue()) {
                return res.status(200).json({
                    success: true,
                    chart: data.value,
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: data.error,
                });
            }
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
                error: error.message,
            });
        }
    }

    async callVolumeByDateRange(req, res) {
        try {
            const { beginDate, endDate } = req.query;
            const data = await this.gttDashboardRepository.callVolumeByDateRange(beginDate, endDate);

            if (data.hasValue()) {
                return res.status(200).json({
                    success: true,
                    chart: data.value,
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: data.error,
                });
            }
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
                error: error.message,
            });
        }
    }
}
