// NEW FILE: Handles user-related business logic: registration, login, and JWT generation.

import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs'; // For password hashing
import { JwtService } from '@nestjs/jwt'; // For JWT generation
import { User, UserDocument } from './schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  /**
   * Registers a new user.
   * Hashes the password before saving.
   * @param registerDto User registration data (email, password).
   * @returns The registered user (without password hash).
   * @throws BadRequestException if the email already exists.
   */
  async register(registerDto: RegisterDto): Promise<Omit<User, 'passwordHash'>> {
    const existingUser = await this.userModel.findOne({ email: registerDto.email }).exec();
    if (existingUser) {
      throw new BadRequestException('Email already registered.');
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 10); // Hash password
    const newUser = new this.userModel({
      email: registerDto.email,
      passwordHash,
    });
    const savedUser = await newUser.save();

    // Return user object without the password hash
    const { passwordHash: _, ...result } = savedUser.toObject();
    return result;
  }

  /**
   * Validates user credentials and returns a JWT.
   * @param loginDto User login data (email, password).
   * @returns An object containing the access token.
   * @throws UnauthorizedException if credentials are invalid.
   */
  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    const user = await this.userModel.findOne({ email: loginDto.email }).exec();
    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    // Generate JWT payload
    const payload = { email: user.email, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  /**
   * Validates a user by their ID (used by JwtStrategy).
   * @param userId The ID of the user.
   * @returns The user object if found, otherwise null.
   */
  async validateUserById(userId: string): Promise<UserDocument | null> {
    return this.userModel.findById(userId).exec();
  }
}
