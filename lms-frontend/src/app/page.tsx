"use client";

import React from "react";
import { Footer } from "@/components/layout/Footer";
import Image from "next/image";
import Link from "next/link";
import {
  Terminal,
  Menu,
  ChevronRight,
  PlayCircle,
  BookOpen,
  Users,
  Search,
  Star,
  Trophy,
  ArrowRight,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CourseCard } from "@/components/ui/CourseCard";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils"; // Assuming cn utility is available here

export default function LandingPage() {
  const featuredCourses = [
    {
      id: "cmmxt9wn300085a880tvxuzbs",
      title: "Node.js Fundamentals",
      instructor: { name: "Admin User" },
      rating: 4.9,
      enrollments: 120,
      lessonsCount: 12,
      durationHours: 12,
      category: "Backend Development",
      price: 999,
      thumbnailUrl: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=500&h=300&fit=crop",
      href: "/courses/cmmxt9wn300085a880tvxuzbs",
    },
    {
      id: "react-typescript-mastery",
      title: "React & TypeScript Mastery",
      instructor: { name: "Admin User" },
      rating: 4.8,
      enrollments: 85,
      lessonsCount: 18,
      durationHours: 18,
      category: "Frontend Development",
      price: 1499,
      thumbnailUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&h=300&fit=crop",
      href: "/courses/react-typescript-mastery",
    },
    {
      id: "git-github-beginners",
      title: "Git & GitHub for Beginners",
      instructor: { name: "Admin User" },
      rating: 4.7,
      enrollments: 210,
      lessonsCount: 6,
      durationHours: 3,
      category: "Development Tools",
      price: 0,
      thumbnailUrl: "https://images.unsplash.com/photo-1618401471353-b98aadebc25a?w=500&h=300&fit=crop",
      href: "/courses/git-github-beginners",
    },
  ];

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-bg-page text-text-primary selection:bg-primary/10 font-sans">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-bg-surface/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-sm group-hover:bg-primary-hover transition-all">
              <Terminal size={18} />
            </div>
            <h2 className="text-text-primary text-xl font-bold tracking-tight">
              Codedevin<span className="text-primary">.</span>
            </h2>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/courses"
              className="text-sm font-medium text-text-secondary hover:text-primary transition-colors"
            >
              Courses
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-text-secondary hover:text-primary transition-colors"
            >
              Our Story
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-text-secondary hover:text-primary transition-colors"
            >
              Login
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </nav>

          <button className="md:hidden size-10 flex items-center justify-center rounded-lg bg-bg-subtle border border-border">
            <Menu size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-32">
          {/* Subtle Background Elements */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
            <div className="absolute -top-24 -left-24 size-[600px] bg-primary/5 rounded-full blur-[120px]" />
            <div className="absolute top-1/2 -right-24 size-[600px] bg-primary/10 rounded-full blur-[120px]" />
          </div>

          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col items-center text-center max-w-4xl mx-auto gap-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-light border border-primary/20 text-primary">
                <Star size={14} className="fill-current" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                  World-Class Online Learning
                </span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-extrabold text-text-primary leading-tight tracking-tight">
                Master <span className="text-primary">DSA, Java & C++</span><br className="hidden md:block" />
                with Expert-Led Courses
              </h1>
              
              <p className="text-xl text-text-secondary font-medium leading-relaxed max-w-2xl">
                Join our elite community learning Data Structures, Algorithms, 
                and Core Programming. Access our library of 170+ specialized videos 
                designed for Computer Science students.
              </p>

              <div className="w-full max-w-xl mt-4">
                <Input 
                  placeholder="Search 170+ videos on DSA, Java, C++, and more..."
                  leftIcon={<Search size={18} />}
                  className="rounded-full h-14 pl-12 shadow-sm border-border bg-bg-surface focus-visible:ring-4 focus-visible:ring-primary/5"
                />
              </div>

              <div className="flex flex-wrap gap-4 justify-center mt-4">
                <Link href="/courses">
                  <Button size="lg" className="px-10 rounded-full shadow-lg shadow-primary/20">
                    Start Coding Now
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="px-10 rounded-full bg-transparent">
                  <PlayCircle className="size-5 mr-2 text-primary" />
                  How it Works
                </Button>
              </div>

              <div className="flex items-center gap-4 py-8">
                <div className="flex -space-x-3">
                  {[
                    "1535713875002-d1d0cf377fde",
                    "1494790108377-be9c29b29330",
                    "1599566150163-29194dcaad36",
                    "1527980965255-d3b416303d12"
                  ].map((id, i) => (
                    <div key={i} className="size-10 rounded-full border-2 border-bg-page bg-bg-subtle overflow-hidden relative">
                      <Image
                        src={`https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=80&h=80`}
                        alt="User"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-sm font-medium text-text-muted">
                  <span className="text-text-primary font-bold">4.8/5</span> from over 12,000 students
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-24 border-y border-border bg-bg-surface">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { name: "DSA & Algorithms", count: "45+ Videos", icon: Zap, variant: "info" },
                { name: "Core Java & Spring", count: "60+ Videos", icon: BookOpen, variant: "success" },
                { name: "C++ Programming", count: "30+ Videos", icon: Terminal, variant: "warning" },
                { name: "System Design", count: "15+ Videos", icon: Users, variant: "error" },
              ].map((cat, i) => (
                <div key={i} className="flex flex-col items-center text-center p-6 rounded-2xl hover:bg-bg-subtle transition-colors cursor-pointer group">
                  <div className={cn(
                    "size-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 shadow-sm",
                    cat.variant === 'info' ? "bg-primary-light text-primary" :
                    cat.variant === 'success' ? "bg-primary-light text-primary" :
                    cat.variant === 'warning' ? "bg-primary-light text-primary" : "bg-primary-light text-primary"
                  )}>
                    <cat.icon size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-text-primary mb-1">{cat.name}</h3>
                  <p className="text-xs font-bold text-text-muted uppercase tracking-widest">{cat.count}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Courses */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
              <div className="max-w-xl">
                <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary mb-4 tracking-tight">
                  Start Learning with <span className="text-primary">Confidence</span>
                </h2>
                <p className="text-lg text-text-secondary font-medium">
                  Explore our most popular and highly-rated courses taught by industry veterans.
                </p>
              </div>
              <Link
                href="/courses"
                className="group text-primary font-bold hover:text-primary-hover flex items-center gap-2 transition-all"
              >
                Explore All Courses
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-all" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredCourses.map((course, i) => (
                <CourseCard key={i} {...course} />
              ))}
            </div>
          </div>
        </section>

        {/* Why Codedevin */}
        <section className="py-24 bg-bg-surface border-y border-border">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div className="relative group">
                <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl border border-border">
                  <Image 
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2070&auto=format&fit=crop" 
                    alt="Learning experience" 
                    fill 
                    className="object-cover" 
                  />
                  <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
                </div>
                {/* Floating Achievement */}
                <div className="absolute -bottom-8 -right-8 bg-bg-surface p-6 rounded-2xl shadow-xl border border-border flex items-center gap-4 animate-bounce-subtle">
                  <div className="size-12 rounded-xl bg-success-light flex items-center justify-center text-success">
                    <Trophy size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Global Ranking</p>
                    <p className="text-sm font-extrabold text-text-primary">#1 in Developer Education</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-10">
                <div className="space-y-4">
                  <h2 className="text-4xl md:text-5xl font-extrabold text-text-primary tracking-tight leading-[1.1]">
                    Everything You Need to <br />
                    <span className="text-primary">Master Your Craft</span>
                  </h2>
                  <p className="text-lg text-text-secondary font-medium">
                    We've built a structure that ensures you don't just learn, but you retain and apply the knowledge.
                  </p>
                </div>

                <div className="grid gap-8">
                  {[
                    { title: "Instructor-Led Sessions", desc: "Learn directly from professionals currently working at top tier companies." },
                    { title: "Comprehensive Curriculum", desc: "Rigorous pedagogical approach designed for deep understanding and skill retention." },
                    { title: "Verifiable Certificates", desc: "Earn official proof of completion to showcase your commitment to employers." },
                  ].map((feat, i) => (
                    <div key={i} className="flex gap-5">
                      <div className="shrink-0 size-6 rounded-full bg-primary-light flex items-center justify-center mt-1">
                        <CheckCircle2 size={14} className="text-primary" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-text-primary mb-1">{feat.title}</h4>
                        <p className="text-text-secondary font-medium text-sm leading-relaxed">{feat.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="bg-primary rounded-[40px] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-2xl shadow-primary/20">
            <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center gap-8">
              <h2 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
                Empower Your Professional Future
              </h2>
              <p className="text-primary-light text-lg md:text-xl font-medium opacity-90 leading-relaxed">
                Join a global community of lifelong learners and take the next step towards your career goals.
              </p>
                <Link href="/register">
                  <Button variant="outline" size="lg" className="h-16 px-12 rounded-2xl text-lg font-bold bg-white/10 hover:bg-white/20 border-white/20 text-white">
                    Join Codedevin for Free
                  </Button>
                </Link>
              </div>

              {/* Background elements */}
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 size-[500px] bg-white/10 rounded-full blur-[100px]" />
              <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 size-[400px] bg-indigo-900/40 rounded-full blur-[80px]" />
            </div>
          </section>
        </main>

        <Footer />

      <style jsx global>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
