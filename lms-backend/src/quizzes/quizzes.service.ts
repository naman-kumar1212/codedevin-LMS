import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { IsString, IsNumber, IsOptional, IsEnum, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { PrismaService } from '../prisma/prisma.service';

export class CreateQuizDto {
  @IsString()
  title!: string;

  @IsNumber()
  passingScore!: number;
}

export class QuizOptionDto {
  @IsString()
  text!: string;

  @IsBoolean()
  isCorrect!: boolean;
}

export class AddQuestionDto {
  @IsString()
  questionText!: string;

  @IsEnum(['mcq', 'short_answer'])
  questionType!: 'mcq' | 'short_answer';

  @IsNumber()
  orderIndex!: number;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => QuizOptionDto)
  options?: QuizOptionDto[];
}

@Injectable()
export class QuizzesService {
  constructor(private prisma: PrismaService) { }

  // ── Admin: Create quiz for a lesson ─────────────────────────────────────
  async createQuiz(lessonId: string, dto: CreateQuizDto) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) throw new NotFoundException('Lesson not found');

    const existing = await this.prisma.quiz.findUnique({ where: { lessonId } });
    if (existing) throw new ConflictException('This lesson already has a quiz');

    return this.prisma.quiz.create({
      data: { lessonId, title: dto.title, passingScore: dto.passingScore },
    });
  }

  // ── Admin: Add question to a quiz ────────────────────────────────────────
  async addQuestion(quizId: string, dto: AddQuestionDto) {
    const quiz = await this.prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) throw new NotFoundException('Quiz not found');

    if (dto.questionType === 'mcq' && (!dto.options || dto.options.length < 2)) {
      throw new BadRequestException('MCQ questions require at least 2 options');
    }

    return this.prisma.quizQuestion.create({
      data: {
        quizId,
        questionText: dto.questionText,
        questionType: dto.questionType as any,
        orderIndex: dto.orderIndex,
        options: dto.options
          ? {
            create: dto.options.map((o, i) => ({
              optionText: o.text,
              isCorrect: o.isCorrect,
              orderIndex: i + 1,
            })),
          }
          : undefined,
      },
      include: { options: true },
    });
  }

  // ── Student: Get quiz by ID (no isCorrect) ──────────────────────────────
  async getQuizById(quizId: string, studentId: string, isAdmin = false) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' },
          include: {
            options: {
              orderBy: { orderIndex: 'asc' },
              select: { id: true, optionText: true, orderIndex: true }, // NO isCorrect
            },
          },
        },
        lesson: { include: { module: { select: { courseId: true } } } },
        module: { select: { courseId: true } },
      },
    });
    if (!quiz) throw new NotFoundException('Quiz not found');

    const courseId = quiz.lesson?.module.courseId || quiz.module?.courseId;
    if (!courseId) throw new NotFoundException('Course ID not found for this quiz');

    // Enroll check skip for admins
    if (!isAdmin) {
      const enrolled = await this.prisma.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId,
            courseId,
          },
        },
      });
      if (!enrolled) throw new ForbiddenException('You must be enrolled to take this quiz');
    }

    const attemptsUsed = await this.prisma.quizAttempt.count({
      where: { quizId: quiz.id, studentId },
    });

    return {
      ...quiz,
      attemptsUsed,
      attemptsRemaining: isAdmin ? 999 : Math.max(0, 3 - attemptsUsed),
    };
  }

  // ── Student: Get quiz for a lesson (no isCorrect) ────────────────────────
  async getQuizForLesson(lessonId: string, studentId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');

    const quiz = await this.prisma.quiz.findUnique({
      where: { lessonId },
    });
    if (!quiz) throw new NotFoundException('No quiz for this lesson');

    return this.getQuizById(quiz.id, studentId);
  }

  // ── Student: Submit quiz attempt ─────────────────────────────────────────
  async submitAttempt(
    quizId: string,
    studentId: string,
    answers: Record<string, string>,
    isAdmin = false,
  ) {
    const attemptsUsed = await this.prisma.quizAttempt.count({
      where: { quizId, studentId },
    });

    if (!isAdmin && attemptsUsed >= 3) {
      throw new ForbiddenException(
        'You have used all 3 attempts for this quiz.',
      );
    }

    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: { include: { options: true } },
        lesson: { include: { module: { select: { courseId: true } } } },
        module: { select: { courseId: true } },
      },
    });
    if (!quiz) throw new NotFoundException('Quiz not found');

    const courseId = quiz.lesson?.module.courseId || quiz.module?.courseId;
    if (!courseId) throw new NotFoundException('Course ID not found for this quiz');

    if (!isAdmin) {
      const enrolled = await this.prisma.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId,
            courseId,
          },
        },
      });
      if (!enrolled) throw new ForbiddenException('You must be enrolled to submit this quiz');
    }

    // Score MCQ questions
    let correctCount = 0;
    const totalMcq = quiz.questions.filter((q) => q.questionType === 'mcq').length;

    for (const question of quiz.questions) {
      if (question.questionType === 'mcq') {
        const selectedOptionId = answers[question.id];
        const correctOption = question.options.find((o) => o.isCorrect);
        if (correctOption && selectedOptionId === correctOption.id) {
          correctCount++;
        }
      }
      // short_answer: recorded but not scored
    }

    const score = totalMcq > 0 ? Math.round((correctCount / totalMcq) * 100) : 100;
    const isPassed = score >= quiz.passingScore;

    await this.prisma.quizAttempt.create({
      data: { studentId, quizId, score, isPassed },
    });

    // If passed, mark quiz lesson as completed (skip for admins)
    let lessonCompleted = false;
    if (!isAdmin && isPassed && quiz.lessonId) {
      await this.prisma.lessonProgress.upsert({
        where: {
          studentId_lessonId: {
            studentId,
            lessonId: quiz.lessonId,
          },
        },
        create: {
          studentId,
          lessonId: quiz.lessonId,
          isCompleted: true,
          completedAt: new Date(),
        },
        update: { isCompleted: true, completedAt: new Date() },
      });
      lessonCompleted = true;
    }

    return {
      score,
      isPassed,
      passingScore: quiz.passingScore,
      attemptsUsed: attemptsUsed + 1,
      attemptsRemaining: Math.max(0, 2 - attemptsUsed),
      lessonCompleted,
    };
  }

  // ── Admin: List all quizzes for a course ─────────────────────────────────
  async getQuizzesForCourse(courseId: string) {
    return this.prisma.quiz.findMany({
      where: { lesson: { module: { courseId } } },
      include: {
        questions: { include: { options: true } },
        lesson: { select: { title: true } },
      },
    });
  }

  // ── Admin: Upsert a module-level quiz (creates or updates with all questions) ──
  async upsertModuleQuiz(
    moduleId: string,
    dto: {
      title: string;
      passingScore: number;
      questions: Array<{
        questionText: string;
        orderIndex: number;
        options: Array<{ text: string; isCorrect: boolean }>;
      }>;
    },
  ) {
    const module = await this.prisma.module.findUnique({ where: { id: moduleId } });
    if (!module) throw new NotFoundException('Module not found');

    // Find existing quiz for this module
    const existing = await this.prisma.quiz.findUnique({ where: { moduleId } });

    if (existing) {
      // Delete all existing questions (cascade deletes options)
      await this.prisma.quizQuestion.deleteMany({ where: { quizId: existing.id } });
      // Update quiz header + recreate questions
      return this.prisma.quiz.update({
        where: { id: existing.id },
        data: {
          title: dto.title,
          passingScore: dto.passingScore,
          questions: {
            create: dto.questions.map((q) => ({
              questionText: q.questionText,
              questionType: 'mcq',
              orderIndex: q.orderIndex,
              options: {
                create: q.options.map((o, i) => ({
                  optionText: o.text,
                  isCorrect: o.isCorrect,
                  orderIndex: i + 1,
                })),
              },
            })),
          },
        },
        include: {
          questions: { include: { options: true } },
        },
      });
    } else {
      // Create new quiz linked to module
      return this.prisma.quiz.create({
        data: {
          moduleId,
          title: dto.title,
          passingScore: dto.passingScore,
          questions: {
            create: dto.questions.map((q) => ({
              questionText: q.questionText,
              questionType: 'mcq',
              orderIndex: q.orderIndex,
              options: {
                create: q.options.map((o, i) => ({
                  optionText: o.text,
                  isCorrect: o.isCorrect,
                  orderIndex: i + 1,
                })),
              },
            })),
          },
        },
        include: {
          questions: { include: { options: true } },
        },
      });
    }
  }
}
