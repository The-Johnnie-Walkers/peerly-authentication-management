import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './guard/auth.guard';
import { RequestResetDto } from './dto/request-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register({
      name: registerDto.name,
      email: registerDto.email,
      password: registerDto.password,
    });
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login({
      email: loginDto.email,
      password: loginDto.password,
    });
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  profile(@Req() req: Request) {
    return req['user'];
  }

  @Post('reset-request')
  resetRequest(@Body() dto: RequestResetDto) {
    return this.authService.requestReset({ email: dto.email });
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword({ token: dto.token, newPassword: dto.newPassword });
  }
}
