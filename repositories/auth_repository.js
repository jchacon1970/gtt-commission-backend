import { Result } from '../common/result.js';
import { Database } from './../source/database.js';

export class AuthRepository {
    constructor() {
        this.db = new Database();
    }

    /**
     * Busca un usuario activo por email
     * @param {string} email - Email del usuario
     * @returns {Promise<{id: number, name: string, email: string, password: string, id_rol: number, active: boolean}|null>}
     */
    async findActiveUserByEmail(email) {
        const connection = await this.db.getConnection();
        try {
            const [rows] = await connection.query(
                `SELECT id, name, email, password, id_rol, active
                FROM tbl_users 
                WHERE email = ? AND active = 1 AND deleted_at IS NULL
                LIMIT 1`,
                [email]
            );
            return rows[0] || null;
        } finally {
            connection.release();
        }
    }

    /**
     * Busca un usuario activo por ID
     * @param {number} id - ID del usuario
     * @returns {Promise<{id: number, name: string, email: string, id_rol: number, active: boolean}|null>}
     */
    async findActiveUserById(id) {
        const connection = await this.db.getConnection();
        try {
            const [rows] = await connection.query(
                `SELECT id, name, email, id_rol, active
                FROM tbl_users 
                WHERE id = ? AND active = 1 AND deleted_at IS NULL
                LIMIT 1`,
                [id]
            );
            return rows[0] || null;
        } finally {
            connection.release();
        }
    }

    /**
     * Crea un nuevo usuario
     * @param {Object} userData - Datos del usuario
     * @param {string} userData.name - Nombre completo
     * @param {string} userData.email - Email válido
     * @param {string} userData.password - Contraseña hasheada
     * @param {number} userData.role - Rol del usuario
     * @returns {Promise<number>} - ID del nuevo usuario
     */
    async createUser({ name, email, password, role }) {
        return await this.db.executeTransaction(async (connection) => {
            // Verificar email único
            const [existing] = await connection.query(
                'SELECT 1 FROM tbl_users WHERE email = ? LIMIT 1',
                [email]
            );

            if (existing.length > 0) {
                return Result.fail("El email ya está registrado")
            }

            const [result] = await connection.query(
                `INSERT INTO tbl_users 
                (name, email, password, id_rol) 
                VALUES (?, ?, ?, ?)`,
                [name, email, password, role]
            );

            return Result.ok(result);
        });
    }

    /**
     * Actualiza el estado de un usuario (activo/inactivo)
     * @param {number} userId - ID del usuario
     * @param {boolean} active - Nuevo estado
     * @returns {Promise<boolean>} - True si se actualizó correctamente
     */
    async updateUserStatus(userId, active) {
        return await this.db.executeTransaction(async (connection) => {
            const [result] = await connection.query(
                `UPDATE tbl_users 
                SET active = ?, updated_at = NOW() 
                WHERE id = ?`,
                [active ? 1 : 0, userId]
            );

            return Result.ok(result.affectedRows > 0);
        });
    }

    /**
     * Verifica si un email ya está registrado
     * @param {string} email - Email a verificar
     * @returns {Promise<boolean>} - True si el email existe
     */
    async emailExists(email) {
        const connection = await this.db.getConnection();
        try {
            const [rows] = await connection.query(
                'SELECT 1 FROM tbl_users WHERE email = ? LIMIT 1',
                [email]
            );

            return Result.ok(rows.length > 0);
        } finally {
            connection.release();
        }
    }

    async getPersonalById(id) {
        const connection = await this.db.getConnection();
        try {
            const [rows] = await connection.query(
                'SELECT cedula, nombre, fecha_ingreso, cargo FROM tbl_personal WHERE cedula = ? LIMIT 1',
                [id]
            );

            return Result.ok(rows[0])
        }
        catch (error) {
            return Result.fail(error.message)
        }
    }


}