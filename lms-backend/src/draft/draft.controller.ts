import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { DraftService } from './draft.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('drafts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class DraftController {
  constructor(private readonly draftService: DraftService) {}

  @Get('course/:courseId')
  async getDraft(@Param('courseId') courseId: string) {
    const draft = await this.draftService.getDraft(courseId);
    if (!draft) throw new NotFoundException('No draft found');
    return draft;
  }

  @Post('course/:courseId')
  async saveDraft(
    @Param('courseId') courseId: string,
    @Body() data: Record<string, unknown>,
  ) {
    await this.draftService.saveDraft(courseId, data);
    return { message: 'Draft saved', courseId };
  }

  @Delete('course/:courseId')
  @HttpCode(HttpStatus.NO_CONTENT)
  clearDraft(@Param('courseId') courseId: string) {
    return this.draftService.clearDraft(courseId);
  }

  // Upload session helpers
  @Get('upload-session/:sessionId')
  async getUploadSession(@Param('sessionId') sessionId: string) {
    const session = await this.draftService.getUploadSession(sessionId);
    if (!session) throw new NotFoundException('Upload session not found');
    return session;
  }

  @Post('upload-session/:sessionId')
  saveUploadSession(
    @Param('sessionId') sessionId: string,
    @Body() data: Record<string, unknown>,
  ) {
    return this.draftService.saveUploadSession(sessionId, data);
  }
}
