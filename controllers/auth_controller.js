import { AuthService } from './../service/auth_service.js';
import { AuthRepository } from './../repositories/auth_repository.js';
import { JwtHandler } from './../handlers/jwt_handler.js';
import { BycriptHandler } from './../handlers/bycript_handler.js';
import { CognitoAuthService } from '../handlers/amazon_cognito_identity.js';

const cognitoConfig = {
    userPoolId: process.env.COGNITO_USER_POOL_ID,
    clientId: process.env.COGNITO_CLIENT_ID,
    clientSecret: process.env.COGNITO_CLIENT_SECRET,
    region: process.env.COGNITO_REGION
};

export class AuthController {
    constructor() {
        this.authService = new AuthService(
            new AuthRepository(),
            new JwtHandler(),
            new BycriptHandler(),
            new CognitoAuthService(
                cognitoConfig.userPoolId,
                cognitoConfig.clientId,
                cognitoConfig.region
            )
        );
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;

            const result = await this.authService.login(email, password);

            if (result.hasValue()) {
                // Configurar cookies HTTP-only seguras
                res.cookie('id', result.value.id, {
                    httpOnly: true,
                });

                res.cookie('access', result.value.access, {
                    httpOnly: true,
                });

                res.cookie('refresh', result.value.refresh, {
                    httpOnly: true,
                });

                res.json({
                    success: true
                });
            }
            else {
                res.status(400).json({
                    success: false,
                    message: result.error
                });
            }
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async logout(req, res) {
        try {
            const result = await this.authService.signOut();

            if (result.hasValue()) {
                // Limpiar cookies
                res.clearCookie('id', {
                    httpOnly: true,
                });
                res.clearCookie('access', {
                    httpOnly: true,
                });
                res.clearCookie('refresh', {
                    httpOnly: true,
                });

                res.json({
                    success: true,
                    message: 'Cierre exitoso'
                });
            }
            else {
                res.status(400).json({
                    success: false,
                    message: result.error
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async verify(req, res) {
        try {

            const result = await this.authService.verify(req.cookies?.access);

            if (result.hasValue()) {
                res.status(201).json({
                    success: true,
                    result
                });
            }
            else {
                res.status(400).json({
                    success: false,
                    message: result.error
                });
            }

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error
            });
        }
    }

    async getProfile(req, res) {
        try {
            // El usuario está disponible en req.user gracias al middleware
            res.json({
                success: true,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error
            });
        }
    }

    async blockUser(req, res) {
        try {
            const success = await this.authService.blockUser(
                req.params.id,
                req.user.id
            );

            res.json({
                success: true,
                blocked: success
            });
        } catch (error) {
            res.status(403).json({
                success: false,
                message: error.message
            });
        }
    }

    async unblockUser(req, res) {
        try {
            const success = await this.authService.unblockUser(
                req.params.id,
                req.user.id
            );

            res.json({
                success: true,
                unblocked: success
            });
        } catch (error) {
            res.status(403).json({
                success: false,
                message: error.message
            });
        }
    }

    async register(req, res) {
        try {
            const { id, email, password } = req.body;

            const result = await this.authService.register({
                id: id,
                name: r['nombre'].split(" ")[0],
                email: email,
                password: password,
                attrs: { name: r['nombre'].split(" ")[0], nickname: r['cedula'] }
            }
            );

            if (result.hasValue()) {
                res.status(201).json({
                    success: true,
                    result
                });
            }
            else {
                res.status(400).json({
                    success: false,
                    message: result.error
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}