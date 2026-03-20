import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { JwtRefreshGuard } from './guards/jwt.guard';

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax' as const,
};

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Get('verify/:token')
  verifyEmail(@Param('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);
    res.cookie('access_token', result.accessToken, {
      ...COOKIE_OPTS,
      expires: new Date(Date.now() + 15 * 60 * 1000),
    });
    res.cookie('refresh_token', result.refreshToken, {
      ...COOKIE_OPTS,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    return result;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = (req as any).cookies?.refresh_token;
    const result = await this.authService.refresh(refreshToken);
    res.cookie('access_token', result.accessToken, {
      ...COOKIE_OPTS,
      expires: new Date(Date.now() + 15 * 60 * 1000),
    });
    res.cookie('refresh_token', result.refreshToken, {
      ...COOKIE_OPTS,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    return result;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = (req as any).cookies?.refresh_token;
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return this.authService.logout(refreshToken);
  }
}
