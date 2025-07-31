import bcrypt from 'bcrypt';

export class BycriptHandler {
    /**
     * @param {number} saltRounds - Número de rondas de sal (10-12 recomendado)
     */
    constructor(saltRounds = 10) {
        this.saltRounds = saltRounds;
    }

    /**
     * Hashea una contraseña
     * @param {string} plainPassword - Contraseña en texto plano
     * @returns {Promise<string>} - Contraseña hasheada
     */
    async hashPassword(plainPassword) {
        return await bcrypt.hash(plainPassword, this.saltRounds);
    }

    /**
     * Compara una contraseña con su hash
     * @param {string} plainPassword - Contraseña en texto plano
     * @param {string} hashedPassword - Contraseña hasheada
     * @returns {Promise<boolean>} - True si coinciden
     */
    async comparePassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    /**
     * Verifica si un hash necesita actualizarse
     * @param {string} hashedPassword - Contraseña hasheada
     * @returns {boolean} - True si el hash es obsoleto
     */
    needsRehash(hashedPassword) {
        const salt = hashedPassword.split('$')[3];
        return bcrypt.getRounds(salt) < this.saltRounds;
    }
}