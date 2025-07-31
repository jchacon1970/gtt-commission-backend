import express from 'express';
import { AuthController } from './../controllers/auth_controller.js';
import { AuthMiddleware } from './../middlewares/auth_middleware.js';

export class AuthRoutes {
    constructor() {
        this.router = express.Router();
        this.authController = new AuthController();
        this.authMiddleware = new AuthMiddleware();
        this.setupRoutes();
    }

    setupRoutes() {
        // 1. Registro de usuario
        this.router.post('/register', (req, res) => this.authController.register(req, res));

        // 2. Inicio de sesión
        this.router.post('/login', (req, res) => this.authController.login(req, res));

        // 3. Cierre de sesión
        this.router.post('/logout', (req, res) => this.authController.logout(req, res));

        // 4. Verificar sesion
        this.router.get('/verify', this.authMiddleware.authenticate(), (req, res) => this.authController.verify(req, res));

        // 5. Ruta protegida de ejemplo
        this.router.get('/profile', this.authMiddleware.authenticate(), (req, res) => this.authController.getProfile(req, res));

        // 6. Rutas de administración
        this.router.post('/block-user/:id', this.authMiddleware.authenticate(),
            (req, res) => this.authController.blockUser(req, res));

        this.router.post('/unblock-user/:id', this.authMiddleware.authenticate(),
            (req, res) => this.authController.unblockUser(req, res));
    }

    getRouter() {
        return this.router;
    }
}