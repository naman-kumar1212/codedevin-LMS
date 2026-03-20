import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Clean up in correct order ─────────────────────────────────────────────
  await prisma.notification.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.quizOption.deleteMany();
  await prisma.quizQuestion.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.module.deleteMany();
  await prisma.liveClass.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  // ── Users ─────────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('Admin@1234', 12);
  const studentHash = await bcrypt.hash('Student@1234', 12);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@codedevin.com',
      passwordHash: adminHash,
      role: 'admin',
      isVerified: true,
    },
  });

  const student1 = await prisma.user.create({
    data: {
      name: 'Priya Sharma',
      email: 'student1@test.com',
      passwordHash: studentHash,
      role: 'student',
      isVerified: true,
    },
  });

  const student2 = await prisma.user.create({
    data: {
      name: 'Rahul Verma',
      email: 'student2@test.com',
      passwordHash: studentHash,
      role: 'student',
      isVerified: true,
    },
  });

  console.log('✅ Users created');

  // ── Courses ───────────────────────────────────────────────────────────────
  const course1 = await prisma.course.create({
    data: {
      title: 'Node.js Fundamentals',
      description: 'Learn Node.js from scratch. Master async programming, REST APIs, and real-world backend development with Node.js and Express.',
      price: 99900,
      isFree: false,
      status: 'published',
      createdBy: admin.id,
      thumbnailUrl: null,
      category: 'Backend Development',
      level: 'Beginner',
      duration: '12 hours',
      learningOutcomes: [
        'Build REST APIs using Node.js and Express',
        'Understand asynchronous programming with Promises and async/await',
        'Master the Node.js event loop and non-blocking I/O',
        'Work with npm packages and manage dependencies',
        'Connect Node.js to databases like PostgreSQL',
        'Deploy Node.js applications to cloud platforms',
      ],
    },
  });

  const course2 = await prisma.course.create({
    data: {
      title: 'React & TypeScript Mastery',
      description: 'Build enterprise-grade React applications with TypeScript, hooks, context, and modern patterns.',
      price: 149900,
      isFree: false,
      status: 'published',
      createdBy: admin.id,
      thumbnailUrl: null,
      category: 'Frontend Development',
      level: 'Intermediate',
      duration: '18 hours',
      learningOutcomes: [
        'Build scalable React applications with TypeScript',
        'Master React hooks: useState, useEffect, useContext, and custom hooks',
        'Implement state management with Context API and Zustand',
        'Create reusable, type-safe component libraries',
        'Integrate REST APIs and handle async data fetching',
        'Write unit and integration tests with Vitest and React Testing Library',
      ],
    },
  });

  const course3 = await prisma.course.create({
    data: {
      title: 'Git & GitHub for Beginners',
      description: 'Free course. Master version control with Git and GitHub. Learn branching, merging, pull requests and collaborative workflows.',
      price: 0,
      isFree: true,
      status: 'published',
      createdBy: admin.id,
      thumbnailUrl: null,
      category: 'Development Tools',
      level: 'Beginner',
      duration: '3 hours',
      learningOutcomes: [
        'Understand the core concepts of version control',
        'Use Git commands: init, add, commit, push, pull',
        'Create and manage branches for parallel development',
        'Open and review pull requests on GitHub',
        'Resolve merge conflicts confidently',
        'Collaborate on open-source projects using GitHub workflows',
      ],
    },
  });


  console.log('✅ Courses created');

  // ── Modules and Lessons for Course 1 ─────────────────────────────────────
  const mod1_1 = await prisma.module.create({
    data: {
      courseId: course1.id,
      title: 'Getting Started with Node.js',
      description: 'Introduction and setup',
      orderIndex: 1,
    },
  });

  const lesson1_1_1 = await prisma.lesson.create({
    data: {
      moduleId: mod1_1.id,
      title: 'What is Node.js?',
      type: 'video',
      provider: 'local',
      status: 'ready',
      providerFileId: 'mock-video-nodejs-intro',
      durationSeconds: 720,
      orderIndex: 1,
    },
  });

  const lesson1_1_2 = await prisma.lesson.create({
    data: {
      moduleId: mod1_1.id,
      title: 'Installing Node.js & npm',
      type: 'video',
      provider: 'local',
      status: 'ready',
      providerFileId: 'mock-video-nodejs-install',
      durationSeconds: 540,
      orderIndex: 2,
    },
  });

  const lesson1_1_3 = await prisma.lesson.create({
    data: {
      moduleId: mod1_1.id,
      title: 'Week 1 Live Q&A Recording',
      type: 'video',
      provider: 'local',
      status: 'ready',
      providerFileId: 'mock-video-week1-qa',
      durationSeconds: 3600,
      orderIndex: 3,
    },
  });

  const mod1_2 = await prisma.module.create({
    data: {
      courseId: course1.id,
      title: 'Async Programming',
      description: 'Callbacks, Promises and async/await',
      orderIndex: 2,
    },
  });

  const lesson1_2_1 = await prisma.lesson.create({
    data: {
      moduleId: mod1_2.id,
      title: 'Callbacks & The Event Loop',
      type: 'video',
      provider: 'local',
      status: 'ready',
      providerFileId: 'mock-video-eventloop',
      durationSeconds: 900,
      orderIndex: 1,
    },
  });

  const lesson1_2_2 = await prisma.lesson.create({
    data: {
      moduleId: mod1_2.id,
      title: 'Promises & async/await',
      type: 'video',
      provider: 'local',
      status: 'ready',
      providerFileId: 'mock-video-promises',
      durationSeconds: 1200,
      orderIndex: 2,
    },
  });

  const lesson1_2_3 = await prisma.lesson.create({
    data: {
      moduleId: mod1_2.id,
      title: 'Course Notes & Resources',
      type: 'pdf',
      provider: 'local',
      status: 'ready',
      providerFileId: 'nodejs-notes-v1.pdf',
      resourceUrl: 'https://cdn.example.com/resources/nodejs-notes.pdf',
      learningOutcome: 'Apply asynchronous patterns to real-world scenarios',
      orderIndex: 3,
    },
  });

  console.log('✅ Course 1 modules & lessons created');

  // ── Modules and Lessons for Course 2 ─────────────────────────────────────
  const mod2_1 = await prisma.module.create({
    data: {
      courseId: course2.id,
      title: 'React Fundamentals',
      orderIndex: 1,
    },
  });

  const lesson2_1_1 = await prisma.lesson.create({
    data: {
      moduleId: mod2_1.id,
      title: 'Components & JSX',
      type: 'video',
      videoId: 'mock-video-react-jsx',
      durationSeconds: 800,
      orderIndex: 1,
    },
  });

  const lesson2_1_2 = await prisma.lesson.create({
    data: {
      moduleId: mod2_1.id,
      title: 'State & Props',
      type: 'video',
      videoId: 'mock-video-react-state',
      durationSeconds: 1000,
      orderIndex: 2,
    },
  });

  const mod2_2 = await prisma.module.create({
    data: {
      courseId: course2.id,
      title: 'TypeScript Integration',
      orderIndex: 2,
    },
  });

  const lesson2_2_1 = await prisma.lesson.create({
    data: {
      moduleId: mod2_2.id,
      title: 'TypeScript Basics',
      type: 'video',
      videoId: 'mock-video-ts-basics',
      durationSeconds: 900,
      orderIndex: 1,
    },
  });

  const lesson2_2_2 = await prisma.lesson.create({
    data: {
      moduleId: mod2_2.id,
      title: 'TypeScript with React',
      type: 'video',
      videoId: 'mock-video-ts-react',
      durationSeconds: 1100,
      orderIndex: 2,
    },
  });

  // ── Modules and Lessons for Course 3 (Free) ──────────────────────────────
  const mod3_1 = await prisma.module.create({
    data: {
      courseId: course3.id,
      title: 'Git Basics',
      orderIndex: 1,
    },
  });

  const lesson3_1_1 = await prisma.lesson.create({
    data: {
      moduleId: mod3_1.id,
      title: 'Introduction to Git',
      type: 'video',
      videoId: 'mock-video-git-intro',
      durationSeconds: 600,
      orderIndex: 1,
    },
  });

  const lesson3_1_2 = await prisma.lesson.create({
    data: {
      moduleId: mod3_1.id,
      title: 'Basic Commands',
      type: 'video',
      videoId: 'mock-video-git-commands',
      durationSeconds: 750,
      orderIndex: 2,
    },
  });

  console.log('✅ Course 2 & 3 modules & lessons created');

  // ── Quizzes ───────────────────────────────────────────────────────────────
  const quiz1 = await prisma.quiz.create({
    data: {
      lessonId: lesson1_1_1.id,
      title: 'Node.js Basics Quiz',
      passingScore: 70,
    },
  });

  const q1 = await prisma.quizQuestion.create({
    data: {
      quizId: quiz1.id,
      questionText: 'What runtime does Node.js use?',
      questionType: 'mcq',
      orderIndex: 1,
      options: {
        create: [
          { optionText: 'V8 JavaScript Engine', isCorrect: true, orderIndex: 1 },
          { optionText: 'SpiderMonkey', isCorrect: false, orderIndex: 2 },
          { optionText: 'JavaScriptCore', isCorrect: false, orderIndex: 3 },
          { optionText: 'Chakra', isCorrect: false, orderIndex: 4 },
        ],
      },
    },
    include: { options: true },
  });

  const q2 = await prisma.quizQuestion.create({
    data: {
      quizId: quiz1.id,
      questionText: 'Node.js is primarily used for?',
      questionType: 'mcq',
      orderIndex: 2,
      options: {
        create: [
          { optionText: 'Server-side programming', isCorrect: true, orderIndex: 1 },
          { optionText: 'Mobile app development', isCorrect: false, orderIndex: 2 },
          { optionText: 'Game development', isCorrect: false, orderIndex: 3 },
        ],
      },
    },
    include: { options: true },
  });

  const quiz2 = await prisma.quiz.create({
    data: {
      lessonId: lesson2_1_1.id,
      title: 'React Fundamentals Quiz',
      passingScore: 60,
    },
  });

  await prisma.quizQuestion.create({
    data: {
      quizId: quiz2.id,
      questionText: 'What is JSX?',
      questionType: 'mcq',
      orderIndex: 1,
      options: {
        create: [
          { optionText: 'JavaScript XML — a syntax extension', isCorrect: true, orderIndex: 1 },
          { optionText: 'A separate programming language', isCorrect: false, orderIndex: 2 },
          { optionText: 'A CSS framework', isCorrect: false, orderIndex: 3 },
        ],
      },
    },
  });

  console.log('✅ Quizzes & questions created');

  // ── Enrollments ───────────────────────────────────────────────────────────
  const enroll1_1 = await prisma.enrollment.create({
    data: { studentId: student1.id, courseId: course1.id },
  });
  const enroll1_2 = await prisma.enrollment.create({
    data: { studentId: student1.id, courseId: course2.id },
  });
  const enroll1_3 = await prisma.enrollment.create({
    data: { studentId: student1.id, courseId: course3.id },
  });
  const enroll2_1 = await prisma.enrollment.create({
    data: { studentId: student2.id, courseId: course1.id },
  });

  console.log('✅ Enrollments created');

  // ── Lesson Progress (student1 - 50% through course 1) ────────────────────
  await prisma.lessonProgress.createMany({
    data: [
      { studentId: student1.id, lessonId: lesson1_1_1.id, isCompleted: true, completedAt: new Date() },
      { studentId: student1.id, lessonId: lesson1_1_2.id, isCompleted: true, completedAt: new Date() },
      { studentId: student1.id, lessonId: lesson1_1_3.id, isCompleted: true, completedAt: new Date() },
      // Module 2 not started
    ],
  });

  // Student2: first lesson done
  await prisma.lessonProgress.create({
    data: { studentId: student2.id, lessonId: lesson1_1_1.id, isCompleted: true, completedAt: new Date() },
  });

  console.log('✅ Lesson progress created');

  // ── Quiz Attempts ─────────────────────────────────────────────────────────
  // Find the correct option IDs for quiz1 q1
  const correctOption1 = q1.options.find((o) => o.isCorrect);
  const correctOption2 = q2.options.find((o) => o.isCorrect);

  await prisma.quizAttempt.create({
    data: {
      studentId: student1.id,
      quizId: quiz1.id,
      score: 75,
      isPassed: true,
    },
  });

  await prisma.quizAttempt.create({
    data: {
      studentId: student2.id,
      quizId: quiz1.id,
      score: 50,
      isPassed: false,
    },
  });

  console.log('✅ Quiz attempts created');

  // ── Certificates ──────────────────────────────────────────────────────────
  // Student1 completed course3 (Git - only 2 lessons, both done in their mind)
  await prisma.lessonProgress.createMany({
    data: [
      { studentId: student1.id, lessonId: lesson3_1_1.id, isCompleted: true, completedAt: new Date() },
      { studentId: student1.id, lessonId: lesson3_1_2.id, isCompleted: true, completedAt: new Date() },
    ],
    skipDuplicates: true,
  });

  const year = new Date().getFullYear();
  await prisma.certificate.create({
    data: {
      studentId: student1.id,
      courseId: course3.id,
      certificateCode: `CDS-${course3.id.substring(0, 8)}-${student1.id.substring(0, 8)}-${year}`,
      pdfUrl: null,
      issuedAt: new Date(),
    },
  });

  console.log('✅ Certificate created');

  // ── Live Classes ──────────────────────────────────────────────────────────
  const in2Days = new Date();
  in2Days.setDate(in2Days.getDate() + 2);
  in2Days.setHours(18, 0, 0, 0);

  const in5Days = new Date();
  in5Days.setDate(in5Days.getDate() + 5);
  in5Days.setHours(19, 0, 0, 0);

  await prisma.liveClass.createMany({
    data: [
      {
        courseId: course1.id,
        title: 'Node.js Live Q&A Session',
        zoomMeetingId: 'MOCK-ABC12345',
        zoomJoinUrl: 'https://zoom.us/j/1234567890?pwd=mockpassword',
        scheduledAt: in2Days,
        durationMinutes: 90,
      },
      {
        courseId: course2.id,
        title: 'React Hooks Deep Dive',
        zoomMeetingId: 'MOCK-XYZ67890',
        zoomJoinUrl: 'https://zoom.us/j/9876543210?pwd=mockpassword',
        scheduledAt: in5Days,
        durationMinutes: 120,
      },
    ],
  });

  console.log('✅ Live classes created');

  // ── Notifications ─────────────────────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      {
        userId: student1.id,
        type: 'enrollment',
        title: 'Enrolled Successfully',
        message: `You have been enrolled in "Node.js Fundamentals"`,
        isRead: true,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        userId: student1.id,
        type: 'enrollment',
        title: 'Enrolled Successfully',
        message: `You have been enrolled in "React & TypeScript Mastery"`,
        isRead: true,
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      },
      {
        userId: student1.id,
        type: 'live_class',
        title: 'New Live Class Scheduled',
        message: `"Node.js Live Q&A Session" is coming up in 2 days!`,
        isRead: false,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        userId: student1.id,
        type: 'certificate',
        title: 'Certificate Issued!',
        message: `Congratulations! Your certificate for "Git & GitHub for Beginners" has been issued.`,
        isRead: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        userId: student1.id,
        type: 'account',
        title: 'Welcome to Code Devin!',
        message: `Your account has been set up successfully. Start learning today!`,
        isRead: true,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        userId: student2.id,
        type: 'enrollment',
        title: 'Enrolled Successfully',
        message: `You have been enrolled in "Node.js Fundamentals"`,
        isRead: false,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        userId: student2.id,
        type: 'live_class',
        title: 'New Live Class Scheduled',
        message: `"Node.js Live Q&A Session" is scheduled for ${in2Days.toLocaleDateString()}`,
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log('✅ Notifications created');
  console.log('\n🎉 Seed complete!');
  console.log('─────────────────────────────────────────');
  console.log('Admin:    admin@codedevin.com  / Admin@1234');
  console.log('Student1: student1@test.com    / Student@1234');
  console.log('Student2: student2@test.com    / Student@1234');
  console.log('─────────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
