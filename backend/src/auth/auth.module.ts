import { Module } from '@nestjs/common';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';
import { AuthRepository } from '../repositories/auth.repository';
import { AuthTransactionRunner } from '../repositories/auth.transaction';
import { AuthSessions } from './auth.sessions';
import { AuthGuard, AdminGuard } from '../guards/auth.guard';
import { AuthRateGuard } from '../guards/auth-rate.guard';
@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthRepository,
    AuthTransactionRunner,
    AuthSessions,
    AuthGuard,
    AdminGuard,
    AuthRateGuard,
  ],
  exports: [AuthService],
})
export class AuthModule {}
