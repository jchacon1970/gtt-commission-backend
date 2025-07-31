export class RoleRepository {
    constructor(database) {
        this.db = database;
    }

    /**
     * Crea un nuevo rol
     * @param {Object} roleData - Datos del rol
     * @param {string} roleData.name - Nombre del rol
     * @param {boolean} [roleData.is_admin=false] - Si es rol de administrador
     * @param {boolean} [roleData.can_publish=false] - Si puede publicar contenido
     * @param {boolean} [roleData.can_approve=false] - Si puede aprobar contenido
     * @returns {Promise<number>} ID del rol creado
     */
    async create({ name, is_admin = false, can_publish = false, can_approve = false }) {
        return await this.db.executeTransaction(async (connection) => {
            const [result] = await connection.query(
                `INSERT INTO tbl_roles 
                (name, is_admin, can_publish, can_approve) 
                VALUES (?, ?, ?, ?)`,
                [name, is_admin ? 1 : 0, can_publish ? 1 : 0, can_approve ? 1 : 0]
            );
            return result.insertId;
        });
    }

    /**
     * Elimina un rol lógicamente
     * @param {number} id - ID del rol a eliminar
     * @param {number} deletedBy - ID del usuario que realiza la eliminación
     * @returns {Promise<boolean>} True si se eliminó correctamente
     */
    async delete(id, deletedBy) {
        return await this.db.executeTransaction(async (connection) => {
            // Verificar que el rol no esté asignado a usuarios
            const [users] = await connection.query(
                'SELECT 1 FROM tbl_users WHERE id_rol = ? AND deleted_at IS NULL LIMIT 1',
                [id]
            );
            
            if (users.length > 0) {
                throw new Error('No se puede eliminar el rol porque está asignado a usuarios');
            }

            const [result] = await connection.query(
                `UPDATE tbl_roles 
                SET deleted_at = NOW(), deleted_by = ? 
                WHERE id = ? AND deleted_at IS NULL`,
                [deletedBy, id]
            );
            return result.affectedRows > 0;
        });
    }

    /**
     * Restaura un rol eliminado lógicamente
     * @param {number} id - ID del rol a restaurar
     * @returns {Promise<boolean>} True si se restauró correctamente
     */
    async restore(id) {
        return await this.db.executeTransaction(async (connection) => {
            const [result] = await connection.query(
                `UPDATE tbl_roles 
                SET deleted_at = NULL, deleted_by = NULL 
                WHERE id = ? AND deleted_at IS NOT NULL`,
                [id]
            );
            return result.affectedRows > 0;
        });
    }

    /**
     * Obtiene un rol por ID (excluye eliminados por defecto)
     * @param {number} id - ID del rol
     * @param {boolean} [includeDeleted=false] - Incluir roles eliminados
     * @returns {Promise<Object|null>} Rol encontrado o null
     */
    async getById(id, includeDeleted = false) {
        const connection = await this.db.getConnection();
        try {
            const query = includeDeleted
                ? `SELECT * FROM tbl_roles WHERE id = ?`
                : `SELECT * FROM tbl_roles WHERE id = ? AND deleted_at IS NULL`;

            const [rows] = await connection.query(query, [id]);
            return rows[0] ? this.mapRole(rows[0]) : null;
        } finally {
            connection.release();
        }
    }

    /**
     * Lista todos los roles (excluye eliminados por defecto)
     * @param {Object} [options] - Opciones de filtrado
     * @param {boolean} [options.includeDeleted=false] - Incluir roles eliminados
     * @returns {Promise<Array>} Lista de roles
     */
    async getAll({ includeDeleted = false } = {}) {
        const connection = await this.db.getConnection();
        try {
            const query = includeDeleted
                ? `SELECT * FROM tbl_roles`
                : `SELECT * FROM tbl_roles WHERE deleted_at IS NULL`;

            const [rows] = await connection.query(query);
            return rows.map(this.mapRole);
        } finally {
            connection.release();
        }
    }

    /**
     * Mapea los datos del rol desde la base de datos
     * @private
     */
    mapRole(role) {
        return {
            id: role.id,
            name: role.name,
            is_admin: role.is_admin === 1,
            can_publish: role.can_publish === 1,
            can_approve: role.can_approve === 1,
            created_at: role.created_at,
            updated_at: role.updated_at,
            isDeleted: role.deleted_at !== null
        };
    }
}