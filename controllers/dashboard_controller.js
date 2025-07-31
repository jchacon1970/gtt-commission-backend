import { DashboardRepository } from "../repositories/dashboard_repository.js";

export class DashboardController {
    constructor() {
        this.dashboardRepository = new DashboardRepository();
    }

    async getProfitByDateRange(req, res) {
        try {
            const { beginDate, endDate } = req.query;
            const data = await this.dashboardRepository.getProfitByDateRange(beginDate, endDate);

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

    async getCostByDateRange(req, res) {
        try {
            const { beginDate, endDate } = req.query;
            const data = await this.dashboardRepository.getCostByDateRange(beginDate, endDate);

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
