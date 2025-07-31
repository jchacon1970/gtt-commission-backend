import {
    CognitoUserPool,
    CognitoUser,
    AuthenticationDetails
} from 'amazon-cognito-identity-js';

import { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminSetUserPasswordCommand } from "@aws-sdk/client-cognito-identity-provider";
import { Result } from '../common/result.js';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

const cognitoClient = new CognitoIdentityProviderClient({
    region: process.env.COGNITO_REGION
});

export class CognitoAuthService {
    /**
     * @param {string} userPoolId - ID del User Pool de Cognito
     * @param {string} clientId - Client ID de la aplicación
     * @param {string} [region='us-east-1'] - Región de AWS
     */
    constructor(userPoolId = "us-east-2_38hX1gNIW", clientId = "llamor19sd4ol1soiqbatma06", region = 'us-east-2') {
        if (!userPoolId || !clientId) {
            throw new Error('UserPoolId and ClientId are required');
        }

        this.poolData = {
            UserPoolId: userPoolId,
            ClientId: clientId,
            Region: region
        };

        this.userPool = new CognitoUserPool({
            UserPoolId: userPoolId,
            ClientId: clientId
        });
    }

    /**
     * Registra un nuevo usuario
     * @param {string} name - Nombre de usuario (username)
     * @param {string} email - Email del usuario
     * @param {string} password - Contraseña
     * @param {Object} [attributes={}] - Atributos adicionales
     * @returns {Promise<{userId: string}>}
     */
    async register(name, email, password, attributes = {}) {
        const params = {
            UserPoolId: this.poolData.UserPoolId,
            Username: name,
            TemporaryPassword: password,
            MessageAction: "SUPPRESS",
            UserAttributes: [
                { Name: "email", Value: email },
                { Name: "email_verified", Value: "true" },
                ...Object.entries(attributes).map(([key, value]) => ({
                    Name: key,
                    Value: value,
                })),
            ],
        };

        try {
            // 1. Crea el usuario (en estado FORCE_CHANGE_PASSWORD)
            const createUserCommand = new AdminCreateUserCommand(params);
            await cognitoClient.send(createUserCommand);

            // 2. Establece la contraseña como permanente
            const setPasswordParams = {
                UserPoolId: this.poolData.UserPoolId,
                Username: name,
                Password: password,
                Permanent: true,
            };
            const setPasswordCommand = new AdminSetUserPasswordCommand(setPasswordParams);
            await cognitoClient.send(setPasswordCommand);

            return Result.ok(true);
        } catch (error) {
            return Result.fail(error);
        }
    }

    /**
     * Verifica el token JWT (idToken o accessToken)
     * @param {string} token - Token JWT a verificar
     * @returns {Promise<Result>}
     */
    async verify(token) {
        try {
            // Crear el verificador dentro del método
            const verifier = CognitoJwtVerifier.create({
                userPoolId: this.poolData.UserPoolId,
                tokenUse: "access", // o "id" según el token que esperes
                clientId: this.poolData.ClientId,
            });

            const payload = await verifier.verify(token);
            return Result.ok(payload);
        } catch (error) {
            return Result.fail(error.message);
        }
    }

    /**
     * Inicia sesión con email y contraseña
     * @param {string} email 
     * @param {string} password 
     * @returns {Promise<Result<{idToken: string, accessToken: string, refreshToken: string}>>}
     */
    async login(email, password) {
        const authenticationDetails = new AuthenticationDetails({
            Username: email,
            Password: password
        });

        const cognitoUser = new CognitoUser({
            Username: email,
            Pool: this.userPool
        });

        return new Promise((resolve) => {
            cognitoUser.authenticateUser(authenticationDetails, {
                onSuccess: (result) => {
                    resolve(Result.ok({
                        idToken: result.getIdToken().getJwtToken(),
                        accessToken: result.getAccessToken().getJwtToken(),
                        refreshToken: result.getRefreshToken().getToken()
                    }));
                },
                onFailure: (err) => {
                    resolve(Result.fail(err));
                },
                newPasswordRequired: (userAttributes, requiredAttributes) => {
                    // Se puede manejar el cambio de contraseña si es necesario
                    resolve(Result.fail(new Error('User needs to set a new password')));
                }
            });
        });
    }

    /**
     * Cierra sesión del usuario eliminando el token de la sesión local
     * @param {string} email - Email del usuario que cierra sesión
     */
    async logout(email) {
        const cognitoUser = new CognitoUser({
            Username: email,
            Pool: this.userPool
        });

        cognitoUser.signOut();
        return Result.ok(true);
    }
}
