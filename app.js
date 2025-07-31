import express from 'express';
import { AuthRoutes } from './routes/auth.js';
import { AuthMiddleware } from './middlewares/auth_middleware.js';
import cookieParser from 'cookie-parser';
import { QfDashboardRoutes } from './routes/qf_dashboard.js';
import { GttDashboardRoutes } from './routes/gtt_dashboard.js';
import { DashboardRoutes } from './routes/dashboard.js';

export class App {
  constructor() {
    this.app = express();
    
    //ROUTES
    this.authRoutes = new AuthRoutes();
    this.qfDashboardRoutes = new QfDashboardRoutes();
    this.gttDashboardRoutes = new GttDashboardRoutes();
    this.dashboardRoutes = new DashboardRoutes();

    this.authMiddleware = new AuthMiddleware();

    this.setupMiddlewares();
    this.setupRoutes();
    this.setupErrorHandlers();
  }

  setupMiddlewares() {
    this.app.use(cookieParser());
    // Middlewares básicos
    this.app.use(this.authMiddleware.cors())
    this.app.use(express.json());
  }

  setupRoutes() {
    // Rutas de autenticación
    this.app.use('/api/auth', this.authRoutes.getRouter());
    this.app.use('/api/dashboard', this.dashboardRoutes.getRouter());
    this.app.use('/api/qf-dashboard', this.qfDashboardRoutes.getRouter());
    this.app.use('/api/gtt-dashboard', this.gttDashboardRoutes.getRouter())

    // Ruta básica de prueba
    this.app.get('/', (req, res) => {
      res.send('Backend GTT Commission - Operativo');
    });

    // Health check de la base de datos
    this.app.get('/db-health-check', async (req, res) => {
      try {
        const connection = await this.database.getConnection();
        await connection.ping();
        connection.release();

        res.status(200).json({
          status: 'success',
          message: 'Conexión a la base de datos exitosa'
        });
      } catch (error) {
        console.error('Error al conectar con MySQL:', error);
        res.status(500).json({
          status: 'error',
          message: 'Fallo al conectar con la base de datos',
          error: error.message
        });
      }
    });
  }

  setupErrorHandlers() {
    this.app.use(this.authMiddleware.errorHandler());
    this.app.use(this.authMiddleware.notFound());
  }

  async start(port) {
    const server = this.app.listen(port, '0.0.0.0', () => {
      console.log(`Servidor corriendo en http://localhost:${port}`);
    });

    // Manejo de cierre adecuado
    process.on('SIGINT', async () => {
      await this.shutdown(server);
    });

    process.on('SIGTERM', async () => {
      await this.shutdown(server);
    });

    return server;
  }

  async shutdown(server) {
    server.close(() => {
      console.log('Servidor y conexiones a DB cerradas');
      process.exit(0);
    });
  }
}