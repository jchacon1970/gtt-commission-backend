import cors from 'cors';
import { CognitoAuthService } from '../handlers/amazon_cognito_identity.js';

const cognitoConfig = {
    userPoolId: process.env.COGNITO_USER_POOL_ID,
    clientId: process.env.COGNITO_CLIENT_ID,
    clientSecret: process.env.COGNITO_CLIENT_SECRET,
    region: process.env.COGNITO_REGION
};

export class AuthMiddleware {
    constructor() {
        this.cognito = new CognitoAuthService(
            cognitoConfig.userPoolId,
            cognitoConfig.clientId,
            cognitoConfig.region
        );
    }

    /**
     * Configuración CORS
     */
    cors() {
        //not APP CORTS
        const corsOptions = {
            origin: process.env.CORS?.split(','),
            credentials: true,
        };

        return cors(corsOptions);
    }

    /**
     * Middleware de autenticación JWT
     */
    authenticate() {
        return async (req, res, next) => {
            try {
                const token = req.cookies?.access;  // token almacenado en cookie 'access'
                if (!token) {
                    return res.status(401).json({ success: false, message: 'No token provided in cookies' });
                }

                const result = await this.cognito.verify(token);

                if (result.hasValue()) {
                    next();
                }
                else {
                    return res.status(401).json({ success: false, message: result.error });
                }
            } catch (error) {
                console.error('Authentication error:', error);
                res.status(401).json({ success: false, message: 'Unauthorized', error: error.message });
            }
        };
    }


    /**
     * Middleware para manejo de errores
     */
    errorHandler() {
        return (err, req, res, next) => {
            console.error('[Error]', err.stack);

            const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
            const isProduction = process.env.NODE_ENV === 'production';

            res.status(statusCode).json({
                success: false,
                message: err.message || 'Error interno del servidor',
                ...(!isProduction && { stack: err.stack })
            });
        };
    }

    /**
     * Middleware para rutas no encontradas (404)
     */
    notFound() {
        return (req, res) => {
            res.status(404).json({
                success: false,
                message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
            });
        };
    }
}
