import {mergedEnvironmentConfig} from '../../config/env.config.js';
import { JsonWebToken, Token } from '../authentication';

/**
 * Sign Jwt Token
 */
class AuthenticationJwtToken {
    /**
   * Send authentication JWT token
   */
    static async getToken(tokenPayload, tokenExpiry, tokenSecret) {
        try {
            // set configured options if not provided
            // const authConfig = config.get('auth');
            tokenPayload = tokenPayload || {};
            tokenExpiry = tokenExpiry || 360000;
            tokenSecret = tokenSecret || mergedEnvironmentConfig.jwtSecret;

            // create token instance with payload and expiry
            const token = new Token(tokenPayload, tokenExpiry);
            // create JWT instance by giving secret or key
            const jwt = new JsonWebToken({ secret: tokenSecret });
            // sign token using JWT secret key
            const signedToken = await jwt.sign(token);
            return signedToken;
        } catch (err) {
            return err;
        }
    }

}

export default AuthenticationJwtToken;
