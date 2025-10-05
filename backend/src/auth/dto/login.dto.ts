// NEW FILE: DTO for user login.
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { RegisterDto } from './register.dto'; // Re-use email and password validators
import { IsEmail, IsString } from 'class-validator';


// LoginDto extends RegisterDto, but password is not optional
export class LoginDto extends PartialType(RegisterDto) {
  @ApiProperty({ description: 'User email address', example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User password', example: 'SecurePassword123' })
  @IsString()
  password: string;
}