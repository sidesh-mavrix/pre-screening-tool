// NEW FILE: A custom authentication guard that uses the 'jwt' strategy.
// Apply this guard to controllers or individual routes to protect them.

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}