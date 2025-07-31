import express from "express";
import { QfDashboardController } from "../controllers/qf_dashboard_controller.js";
import { AuthMiddleware } from "../middlewares/auth_middleware.js";

export class QfDashboardRoutes {
    constructor() {
        this.router = express.Router();
        this.qfDashboardController = new QfDashboardController();
        this.authMiddleware = new AuthMiddleware();
        this.setupRoutes();
    }

    setupRoutes() {
        this.router.get('/loadsPerCustomerByDateRange', this.authMiddleware.authenticate(), (req, res) => this.qfDashboardController.loadsPerCustomerByDate(req, res));

        this.router.get('/loadsPerCarrierByDateRange', this.authMiddleware.authenticate(), (req, res) => this.qfDashboardController.loadsPerCarrierByDateRange(req, res));

        this.router.get('/loadsByRangeDate', this.authMiddleware.authenticate(), (req, res) => this.qfDashboardController.loadsByRangeDate(req, res));

        this.router.get('/loadsPerCityOriginByDateRange', this.authMiddleware.authenticate(), (req, res) => this.qfDashboardController.loadsPerCityDestinationByDateRange(req, res));

        this.router.get('/loadsPerCityDestinationByDateRange', this.authMiddleware.authenticate(),
            (req, res) => this.qfDashboardController.loadsPerCityOriginByDateRange(req, res));

        this.router.get('/loadsPerStateOriginByDateRange', this.authMiddleware.authenticate(),
            (req, res) => this.qfDashboardController.loadsPerStateDestinationByDateRange(req, res));

        this.router.get('/loadsPerStateDestinationByDateRange', this.authMiddleware.authenticate(),
            (req, res) => this.qfDashboardController.loadsPerStateOriginByDateRange(req, res));
    }

    getRouter() {
        return this.router;
    }
}