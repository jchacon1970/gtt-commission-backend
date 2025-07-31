import dotenv from 'dotenv';
import { App } from './app.js';

// Cargar variables de entorno
dotenv.config();

const port = process.env.PORT || 3000;

// Inicializar y ejecutar aplicación
const app = new App();
app.start(port).catch(error => {
  console.error('Error al iniciar la aplicación:', error);
  process.exit(1);
});