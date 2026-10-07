/**
 * Local registration/session and admin account-management HTTP contracts.
 * Validates DTOs, delegates to AuthService, and enforces identity/role guards.
 * Wiki: wiki/Authentication.md and wiki/API-Docs.md.
 */
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import {
  CredentialsDto,
  AccountListDto,
  AccountUpdateDto,
  RowVersionDto,
} from '../dtos/auth.dto';
import { AuthGuard, AdminGuard } from '../guards/auth.guard';
import type { AuthRequest } from '../types/auth/account';
import { AuthRateGuard } from '../guards/auth-rate.guard';
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Post('accounts') @UseGuards(AuthRateGuard) register(
    @Body() body: CredentialsDto,
  ) {
    return this.auth.register(body.username, body.password);
  }
  @Post('sessions') @HttpCode(200) @UseGuards(AuthRateGuard) login(
    @Body() body: CredentialsDto,
  ) {
    return this.auth.login(body.username, body.password);
  }
  @Delete('sessions/current') @HttpCode(204) @UseGuards(AuthGuard) logout(
    @Req() request: AuthRequest,
  ) {
    this.auth.logout(request.authToken);
  }
  @Get('accounts/current') @UseGuards(AuthGuard) current(
    @Req() request: AuthRequest,
  ) {
    return this.auth.current(request.identity);
  }
  @Get('accounts') @UseGuards(AuthGuard, AdminGuard) list(
    @Query() query: AccountListDto,
  ) {
    return this.auth.list(query.page, query.pageSize, query.search);
  }
  @Get('roles') @UseGuards(AuthGuard, AdminGuard) roles(
    @Query() query: AccountListDto,
  ) {
    return this.auth.roles(query.page, query.pageSize);
  }
  @Patch('accounts/:id') @UseGuards(AuthGuard, AdminGuard) update(
    @Req() request: AuthRequest,
    @Param('id') id: string,
    @Body() body: AccountUpdateDto,
  ) {
    return this.auth.update(request.identity, id, body);
  }
  @Delete('accounts/:id')
  @HttpCode(204)
  @UseGuards(AuthGuard, AdminGuard)
  async remove(
    @Req() request: AuthRequest,
    @Param('id') id: string,
    @Body() body: RowVersionDto,
  ) {
    await this.auth.update(request.identity, id, body, true);
  }
}
