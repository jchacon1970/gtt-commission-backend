import { Result } from "../common/result.js";

export class AuthService {
    constructor(authRepository, jwtService, bycriptHandler, cognito) {
        this.authRepo = authRepository;
        this.jwt = jwtService;
        this.bcrypt = bycriptHandler;
        this.cognito = cognito;
    }

    /**
     * Autentica un usuario (SignIn)
     * @param {string} email - Email del usuario
     * @param {string} plainPassword - Contraseña en texto plano
     * @returns {Promise<{user: Object, tokens: Object}>}
     * @throws {Error} - Si las credenciales son inválidas
     */
    async login(email, password) {
        try {
            const result = await this.cognito.login(email, password);
            console.log(result)
            return Result.ok({
                id: result.value.idToken,
                access: result.value.accessToken,
                refresh: result.value.refreshToken,
            })
        }
        catch (error) {
            return Result.fail(error.message);
        }
    }

    /**
     * Cierra la sesión (SignOut)
     * @param {string} refreshToken - Token a invalidar
     * @returns {Promise<boolean>}
     */
    async logout(email) {
        try {
            await this.cognito.logout(email);
            return Result.ok(true)
        }
        catch (error) {
            return Result.fail(error.message)
        }
    }

    /**
     * Bloquea un usuario
     * @param {number} userId - ID del usuario a bloquear
     * @param {number} adminId - ID del administrador que realiza la acción
     * @returns {Promise<boolean>}
     * @throws {Error} - Si el administrador no tiene permisos
     */
    async blockUser(userId, adminId) {
        // Verificar permisos del administrador
        const admin = await this.authRepo.findActiveUserById(adminId);
        if (!admin || admin.role !== 1) { // Asumiendo que role 1 es admin
            throw new Error('No tienes permisos para esta acción');
        }

        // Bloquear usuario
        return await this.authRepo.updateUserStatus(userId, false);
    }

    /**
     * Desbloquea un usuario
     * @param {number} userId - ID del usuario a desbloquear
     * @param {number} adminId - ID del administrador que realiza la acción
     * @returns {Promise<boolean>}
     * @throws {Error} - Si el administrador no tiene permisos
     */
    async unblockUser(userId, adminId) {
        // Verificar permisos del administrador
        const admin = await this.authRepo.findActiveUserById(adminId);
        if (!admin || admin.role !== 1) {
            throw new Error('No tienes permisos para esta acción');
        }

        // Desbloquear usuario
        return await this.authRepo.updateUserStatus(userId, true);
    }

    /**
     * Registra un nuevo usuario
     * @param {Object} userData - Datos del usuario
     * @param {string} userData.name - Nombre completo
     * @param {string} userData.email - Email válido
     * @param {string} userData.plainPassword - Contraseña en texto plano
     * @param {number} userData.role - Rol del usuario
     * @returns {Promise<number>} - ID del nuevo usuario
     * @throws {Error} - Si el email ya está registrado
     */
    async register(user) {
        try {
            const personal = await this.authRepo.getPersonalById(user.id)

            await this.cognito.register(
                personal['nombre'].split(" ")[0],
                user.email,
                user.password,
                { name: personal['nombre'].split(" ")[0], nickname: r['cedula'] }
            )

            return Result.ok(true);
        }
        catch (error) {
            return Result.fail(error.message);
        }
    }

    async verify(access) {
        try {
            await this.cognito.verify(access)
            return Result.ok(true);
        }
        catch (error) {
            return Result.fail(error.message);
        }
    }
}