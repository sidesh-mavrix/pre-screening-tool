// NEW FILE: Defines the Passport-JWT strategy for validating JWTs from incoming requests.

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtConstants } from './constants';
import { AuthService } from './auth.service'; // Assuming AuthService will handle user validation

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) { // Inject AuthService to validate user
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extract JWT from Authorization header as Bearer token
      ignoreExpiration: false, // Do not ignore token expiration
      secretOrKey: jwtConstants.secret, // Use the defined secret to verify the token signature
    });
  }

  // This method is called after the JWT is extracted and verified.
  // The 'payload' contains the decoded JWT payload.
  async validate(payload: any) {
    // In a real application, you might fetch the user from the database
    // to ensure they still exist and are active. For simplicity, we just
    // return the user ID and email from the payload.
    // The returned object will be attached to the `req.user` property.
    const user = await this.authService.validateUserById(payload.sub); // Use a new method in AuthService to validate by ID
    if (!user) {
      throw new UnauthorizedException('User not found or invalid token.');
    }
    return { userId: payload.sub, email: payload.email };
  }
}