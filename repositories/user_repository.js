export class UserRepository {
    constructor(database) {
        this.db = database;
    }

    /**
     * Crea un nuevo usuario
     * @param {Object} userData - Datos del usuario
     * @param {string} userData.name - Nombre del usuario
     * @param {string} userData.email - Email del usuario
     * @param {string} userData.password - Contraseña hasheada
     * @param {number} userData.id_rol - ID del rol del usuario
     * @returns {Promise<number>} ID del usuario creado
     */
    async create({ name, email, password, id_rol }) {
        return await this.db.executeTransaction(async (connection) => {
            // Verificar si el email ya existe (incluyendo usuarios eliminados lógicamente)
            const [existing] = await connection.query(
                'SELECT 1 FROM tbl_users WHERE email = ? LIMIT 1',
                [email]
            );
            
            if (existing.length > 0) {
                throw new Error('El email ya está registrado');
            }

            const [result] = await connection.query(
                `INSERT INTO tbl_users 
                (name, email, password, id_rol) 
                VALUES (?, ?, ?, ?)`,
                [name, email, password, id_rol]
            );
            return result.insertId;
        });
    }

    /**
     * Obtiene un usuario por ID (excluye eliminados lógicamente)
     * @param {number} id - ID del usuario
     * @param {boolean} [includeDeleted=false] - Incluir usuarios eliminados
     * @returns {Promise<Object|null>} Usuario encontrado o null
     */
    async getById(id, includeDeleted = false) {
        const connection = await this.db.getConnection();
        try {
            const query = includeDeleted 
                ? `SELECT id, name, email, id_rol, created_at, updated_at, active, deleted_at, deleted_by 
                   FROM tbl_users WHERE id = ?`
                : `SELECT id, name, email, id_rol, created_at, updated_at, active 
                   FROM tbl_users WHERE id = ? AND deleted_at IS NULL`;

            const [rows] = await connection.query(query, [id]);
            return rows[0] ? this.mapUser(rows[0]) : null;
        } finally {
            connection.release();
        }
    }

    /**
     * Obtiene un usuario por email (excluye eliminados por defecto)
     * @param {string} email - Email del usuario
     * @param {boolean} [includeDeleted=false] - Incluir usuarios eliminados
     * @returns {Promise<Object|null>} Usuario encontrado o null
     */
    async getByEmail(email, includeDeleted = false) {
        const connection = await this.db.getConnection();
        try {
            const query = includeDeleted
                ? `SELECT id, name, email, password, id_rol, active, deleted_at 
                   FROM tbl_users WHERE email = ?`
                : `SELECT id, name, email, password, id_rol, active 
                   FROM tbl_users WHERE email = ? AND deleted_at IS NULL`;

            const [rows] = await connection.query(query, [email]);
            return rows[0] ? this.mapUser(rows[0]) : null;
        } finally {
            connection.release();
        }
    }

    /**
     * Actualiza un usuario
     * @param {number} id - ID del usuario a actualizar
     * @param {Object} updateData - Datos a actualizar
     * @param {string} [updateData.name] - Nuevo nombre
     * @param {string} [updateData.email] - Nuevo email
     * @param {string} [updateData.password] - Nueva contraseña
     * @param {number} [updateData.id_rol] - Nuevo rol
     * @param {boolean} [updateData.active] - Estado activo/inactivo
     * @returns {Promise<boolean>} True si se actualizó correctamente
     */
    async update(id, { name, email, password, id_rol, active }) {
        return await this.db.executeTransaction(async (connection) => {
            const fieldsToUpdate = [];
            const values = [];

            if (name !== undefined) {
                fieldsToUpdate.push('name = ?');
                values.push(name);
            }
            if (email !== undefined) {
                fieldsToUpdate.push('email = ?');
                values.push(email);
            }
            if (password !== undefined) {
                fieldsToUpdate.push('password = ?');
                values.push(password);
            }
            if (id_rol !== undefined) {
                fieldsToUpdate.push('id_rol = ?');
                values.push(id_rol);
            }
            if (active !== undefined) {
                fieldsToUpdate.push('active = ?');
                values.push(active ? 1 : 0);
            }

            if (fieldsToUpdate.length === 0) {
                throw new Error('No se proporcionaron datos para actualizar');
            }

            fieldsToUpdate.push('updated_at = NOW()');
            values.push(id);

            const [result] = await connection.query(
                `UPDATE tbl_users 
                SET ${fieldsToUpdate.join(', ')} 
                WHERE id = ? AND deleted_at IS NULL`, // No permitir actualizar eliminados
                values
            );

            return result.affectedRows > 0;
        });
    }

    /**
     * Elimina un usuario lógicamente
     * @param {number} id - ID del usuario a eliminar
     * @param {number} deletedBy - ID del usuario que realiza la eliminación
     * @returns {Promise<boolean>} True si se eliminó correctamente
     */
    async delete(id, deletedBy) {
        return await this.db.executeTransaction(async (connection) => {
            const [result] = await connection.query(
                `UPDATE tbl_users 
                SET active = 0, deleted_at = NOW(), deleted_by = ? 
                WHERE id = ? AND deleted_at IS NULL`,
                [deletedBy, id]
            );
            return result.affectedRows > 0;
        });
    }

    /**
     * Restaura un usuario eliminado lógicamente
     * @param {number} id - ID del usuario a restaurar
     * @returns {Promise<boolean>} True si se restauró correctamente
     */
    async restore(id) {
        return await this.db.executeTransaction(async (connection) => {
            const [result] = await connection.query(
                `UPDATE tbl_users 
                SET active = 1, deleted_at = NULL, deleted_by = NULL 
                WHERE id = ? AND deleted_at IS NOT NULL`,
                [id]
            );
            return result.affectedRows > 0;
        });
    }

    /**
     * Lista todos los usuarios (excluye eliminados por defecto)
     * @param {Object} [options] - Opciones de paginación/filtrado
     * @param {number} [options.limit=10] - Límite de resultados
     * @param {number} [options.offset=0] - Offset para paginación
     * @param {boolean} [options.includeDeleted=false] - Incluir usuarios eliminados
     * @param {boolean} [options.onlyActive=true] - Solo usuarios activos (ignorado si includeDeleted=true)
     * @returns {Promise<Array>} Lista de usuarios
     */
    async getAll({ limit = 10, offset = 0, includeDeleted = false, onlyActive = true } = {}) {
        const connection = await this.db.getConnection();
        try {
            let whereClause = '';
            const params = [];

            if (!includeDeleted) {
                whereClause = 'WHERE deleted_at IS NULL';
                if (onlyActive) {
                    whereClause += ' AND active = 1';
                }
            } else if (onlyActive) {
                whereClause = 'WHERE active = 1';
            }

            params.push(limit, offset);

            const [rows] = await connection.query(
                `SELECT id, name, email, id_rol, created_at, updated_at, active, deleted_at 
                FROM tbl_users 
                ${whereClause}
                LIMIT ? OFFSET ?`,
                params
            );

            return rows.map(this.mapUser);
        } finally {
            connection.release();
        }
    }

    /**
     * Verifica si un email ya está registrado
     * @param {string} email - Email a verificar
     * @param {number} [excludeUserId] - ID de usuario a excluir (para actualizaciones)
     * @param {boolean} [includeDeleted=false] - Incluir usuarios eliminados en la verificación
     * @returns {Promise<boolean>} True si el email ya existe
     */
    async emailExists(email, excludeUserId = null, includeDeleted = false) {
        const connection = await this.db.getConnection();
        try {
            let query = 'SELECT 1 FROM tbl_users WHERE email = ?';
            const params = [email];

            if (!includeDeleted) {
                query += ' AND deleted_at IS NULL';
            }

            if (excludeUserId) {
                query += ' AND id != ?';
                params.push(excludeUserId);
            }

            query += ' LIMIT 1';

            const [rows] = await connection.query(query, params);
            return rows.length > 0;
        } finally {
            connection.release();
        }
    }

    /**
     * Mapea los datos del usuario desde la base de datos
     * @private
     */
    mapUser(user) {
        return {
            ...user,
            active: user.active === 1,
            isDeleted: user.deleted_at !== null
        };
    }
}