import jwt from 'jsonwebtoken';

export class JwtHandler {
  constructor() {
    this.accessTokenSecret = process.env.JWT_ACCESS_SECRET;
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET;
    this.accessTokenExpiry = process.env.JWT_ACCESS_EXPIRY;
    this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRY;
  }

  generateAccessToken(payload) {
    if (!payload) throw new Error('Payload is required');
    return jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiry
    });
  }

  generateRefreshToken(payload) {
    if (!payload) throw new Error('Payload is required');
    return jwt.sign(payload, this.refreshTokenSecret, {
      expiresIn: this.refreshTokenExpiry
    });
  }

  generateTokenPair(userData) {
    if (!userData?.id) throw new Error('User data with ID is required');
    
    return {
      accessToken: this.generateAccessToken({
        sub: userData.id,
        email: userData.email,
        role: userData.role || userData.id_rol
      }),
      refreshToken: this.generateRefreshToken({
        sub: userData.id
      })
    };
  }

  verifyAccessToken(token) {
    if (!token) throw new Error('Token is required');
    return new Promise((resolve, reject) => {
      jwt.verify(token, this.accessTokenSecret, (err, decoded) => {
        if (err) reject(new Error(`Invalid access token: ${err.message}`));
        else resolve(decoded);
      });
    });
  }

  verifyRefreshToken(token) {
    if (!token) throw new Error('Token is required');
    return new Promise((resolve, reject) => {
      jwt.verify(token, this.refreshTokenSecret, (err, decoded) => {
        if (err) reject(new Error(`Invalid refresh token: ${err.message}`));
        else resolve(decoded);
      });
    });
  }

  decodeToken(token) {
    if (!token) throw new Error('Token is required');
    return jwt.decode(token);
  }

  getTokenExpiry(token) {
    const decoded = this.decodeToken(token);
    return decoded?.exp ? new Date(decoded.exp * 1000) : null;
  }
}