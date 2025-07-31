import express from "express";
import { GttDashboardController } from "../controllers/gtt_dashboard_controller.js";
import { AuthMiddleware } from "../middlewares/auth_middleware.js";

export class GttDashboardRoutes {
    constructor() {
        this.router = express.Router();
        this.gttDashboardController = new GttDashboardController();
        this.authMiddleware = new AuthMiddleware();
        this.setupRoutes();
    }

    setupRoutes() {
        this.router.get(
            '/callVolumePerAgentByDateRange',
            this.authMiddleware.authenticate(),
            (req, res) => this.gttDashboardController.callVolumePerAgentByDateRange(req, res)
        );

        this.router.get(
            '/totalTimeOnCallPerAgentByDateRange',
            this.authMiddleware.authenticate(),
            (req, res) => this.gttDashboardController.totalTimeOnCallPerAgentByDateRange(req, res)
        );

        this.router.get(
            '/averageCallTimePerAgentByDateRange',
            this.authMiddleware.authenticate(),
            (req, res) => this.gttDashboardController.averageCallTimePerAgentByDateRange(req, res)
        );

        this.router.get(
            '/callDispositionSummaryByDateRange',
            this.authMiddleware.authenticate(),
            (req, res) => this.gttDashboardController.callDispositionSummaryByDateRange(req, res)
        );

        this.router.get(
            '/callVolumeByDateRange',
            this.authMiddleware.authenticate(),
            (req, res) => this.gttDashboardController.callVolumeByDateRange(req, res)
        );
    }

    getRouter() {
        return this.router;
    }
}
