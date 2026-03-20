import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { QuizzesService } from './quizzes.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import {
  IsString,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

class OptionDto {
  @IsString() text: string;
  @IsBoolean() isCorrect: boolean;
}

class CreateQuizDto {
  @IsString() title: string;
  @IsInt() @Min(0) @Max(100) passingScore: number;
}

class AddQuestionDto {
  @IsString() questionText: string;
  @IsIn(['mcq', 'short_answer']) questionType: 'mcq' | 'short_answer';
  @IsInt() @Min(1) orderIndex: number;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => OptionDto)
  options?: OptionDto[];
}

class SubmitAttemptDto {
  answers: Record<string, string>;
}

@Controller()
@UseGuards(JwtAuthGuard)
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  /** Admin: create quiz for a lesson */
  @Post('lessons/:lessonId/quiz')
  createQuiz(@Param('lessonId') lessonId: string, @Body() dto: CreateQuizDto) {
    return this.quizzesService.createQuiz(lessonId, dto);
  }

  /** Admin: add question to a quiz */
  @Post('quizzes/:quizId/questions')
  addQuestion(@Param('quizId') quizId: string, @Body() dto: AddQuestionDto) {
    return this.quizzesService.addQuestion(quizId, dto);
  }

  /** Student: get quiz for a lesson */
  @Get('lessons/:lessonId/quiz')
  getQuizForLesson(@Param('lessonId') lessonId: string, @Req() req: Request) {
    return this.quizzesService.getQuizForLesson(
      lessonId,
      (req.user as any).id,
    );
  }

  /** Student: submit quiz attempt */
  @Post('quizzes/:quizId/attempt')
  submitAttempt(
    @Param('quizId') quizId: string,
    @Body() dto: SubmitAttemptDto,
    @Req() req: Request,
  ) {
    return this.quizzesService.submitAttempt(
      quizId,
      (req.user as any).id,
      dto.answers,
    );
  }
}
