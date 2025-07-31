import express from "express";
import { DashboardController } from "../controllers/dashboard_controller.js";
import { AuthMiddleware } from "../middlewares/auth_middleware.js";

export class DashboardRoutes {
    constructor() {
        this.router = express.Router();
        this.dashboardController = new DashboardController();
        this.authMiddleware = new AuthMiddleware();
        this.setupRoutes();
    }

    setupRoutes() {
        this.router.get(
            '/getProfitByDateRange',
            this.authMiddleware.authenticate(),
            (req, res) => this.dashboardController.getProfitByDateRange(req, res)
        );

        this.router.get(
            '/getCostByDateRange',
            this.authMiddleware.authenticate(),
            (req, res) => this.dashboardController.getCostByDateRange(req, res)
        );
    }

    getRouter() {
        return this.router;
    }
}
