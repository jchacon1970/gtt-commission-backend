import mysql from 'mysql2/promise';

export class Database {
  constructor() {
    // Validar configuración
    const requiredVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
    const missingVars = requiredVars.filter(key => !process.env[key]);

    if (missingVars.length > 0) {
      throw new Error(`Faltan variables de entorno requeridas: ${missingVars.join(', ')}`);
    }

    // Crear pool de conexiones
    this.pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
      connectionLimit: process.env.DB_CONNECTION_LIMIT || 10,
      waitForConnections: true,
      queueLimit: 0
    });
  }

  /**
   * Obtiene una conexión del pool
   * @returns {Promise<mysql.PoolConnection>}
   */
  async getConnection() {
    return await this.pool.getConnection();
  }

  /**
   * Cierra todas las conexiones del pool
   */
  async close() {
    await this.pool.end();
  }

  /**
   * Ejecuta una transacción
   * @param {(connection: mysql.PoolConnection) => Promise<any>} transactionCallback
   */
  async executeTransaction(transactionCallback) {
    let connection;
    try {
      connection = await this.getConnection();
      await connection.beginTransaction();
      
      const result = await transactionCallback(connection);
      
      await connection.commit();
      return result;
    } catch (error) {
      if (connection) await connection.rollback();
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }
}