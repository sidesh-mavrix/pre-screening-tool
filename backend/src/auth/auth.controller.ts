// NEW FILE: Handles HTTP requests for authentication (login and registration).

import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('auth') // Tag for Swagger UI
@Controller('auth') // Base route: /auth
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Registers a new user account.
   * @param registerDto User registration details.
   * @returns The newly registered user information (excluding password hash).
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: 201,
    description: 'User successfully registered.',
    schema: {
      properties: {
        _id: { type: 'string', example: '60c72b2f9b1d8a001c8c4f1c' },
        email: { type: 'string', example: 'newuser@example.com' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Email already registered or invalid input.' })
  @ApiBody({ type: RegisterDto })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * Logs in a user and returns a JWT access token.
   * @param loginDto User login credentials.
   * @returns An object containing the JWT access token.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in. Returns JWT token.',
    schema: {
      properties: {
        access_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}