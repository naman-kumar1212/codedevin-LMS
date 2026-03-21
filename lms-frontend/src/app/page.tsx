"use client";

import React from "react";
import { Footer } from "@/components/layout/Footer";
import Image from "next/image";
import Link from "next/link";
import {
  Terminal,
  Menu,
  PlayCircle,
  BookOpen,
  Users,
  Search,
  Star,
  ArrowRight,
  CheckCircle2,
  Zap,
  Code2,
  MonitorPlay,
  ShieldCheck,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CourseCard } from "@/components/ui/CourseCard";
import { Input } from "@/components/ui/Input";
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

export default function LandingPage() {
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['featured-courses'],
    queryFn: () => api.getCourses().then(r => r.data.slice(0, 3)),
  });

  const featuredCourses = courses.length > 0 ? courses.map((c: any) => ({
    id: c.id,
    title: c.title,
    instructor: { name: c.author?.name || 'CodeDevin Expert' },
    rating: 4.8,
    enrollments: c._count?.enrollments || 0,
    lessonsCount: c._count?.lessons || 12,
    durationHours: 8.5,
    category: c.category || 'Computer Science',
    price: c.price || 4999,
    thumbnailUrl: c.thumbnailUrl || `https://images.unsplash.com/photo-1547658719-da2b51169166?w=500&h=300&fit=crop`,
    href: `/courses/${c.id}`,
    isFree: c.isFree
  })) : [
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
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-white text-slate-900 font-sans antialiased">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group hover:opacity-90 transition-opacity">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-sm">
              <Terminal size={18} strokeWidth={2.5} />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              CodeDevin<span className="text-primary">.</span>
            </h2>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/courses" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">
              Explore Courses
            </Link>
            <Link href="/about" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">
              Our Story
            </Link>
            <div className="h-4 w-px bg-slate-200 mx-2" />
            <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">
              Log In
            </Link>
            <Link href="/register">
              <Button size="sm" className="font-semibold text-sm rounded-lg shadow-sm">Join for Free</Button>
            </Link>
          </nav>

          <button className="md:hidden size-10 flex items-center justify-center rounded-lg bg-slate-50 border border-slate-200 text-slate-600">
            <Menu size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1">
        {/* Split Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

              {/* Left Content */}
              <div className="flex flex-col gap-6 md:gap-8 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 self-start">
                  <Star size={14} className="fill-current" />
                  <span className="text-xs font-bold tracking-wide uppercase">
                    Trusted Learning Platform
                  </span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                  Master <span className="text-primary">DSA, Java & C++</span><br className="hidden md:block" />
                  with Expert-Led Courses
                </h1>

                <p className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed max-w-xl">
                  Join our elite community learning Data Structures, Algorithms,
                  and Core Programming. Access our library of specialized videos
                  designed to accelerate your tech career.
                </p>

                <div className="relative w-full max-w-lg mt-2">
                  <Input
                    placeholder="Search for courses, skills, or topics..."
                    leftIcon={<Search size={20} className="text-slate-400" />}
                    className="h-14 pl-12 rounded-xl border-slate-200 shadow-sm text-base focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                  <Button className="absolute right-1.5 top-1.5 h-11 px-6 rounded-lg font-semibold shadow-sm text-sm">
                    Search
                  </Button>
                </div>

                <div className="flex items-center gap-8 pt-4">
                  <div className="flex -space-x-3">
                    {[
                      "1535713875002-d1d0cf377fde",
                      "1494790108377-be9c29b29330",
                      "1599566150163-29194dcaad36",
                    ].map((id, i) => (
                      <div key={i} className="size-10 rounded-full border-2 border-white bg-slate-100 overflow-hidden relative shadow-sm">
                        <Image
                          src={`https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=80&h=80`}
                          alt="Student Avatar"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                    <div className="size-10 rounded-full border-2 border-white bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shadow-sm z-10">
                      12k+
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-amber-400 mb-0.5">
                      <Star size={14} className="fill-current" />
                      <Star size={14} className="fill-current" />
                      <Star size={14} className="fill-current" />
                      <Star size={14} className="fill-current" />
                      <Star size={14} className="fill-current" />
                    </div>
                    <p className="text-xs font-semibold text-slate-500">
                      4.8/5 Average Rating
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Image */}
              <div className="relative hidden lg:block">
                <div className="relative aspect-4/3 rounded-2xl overflow-hidden shadow-2xl border border-slate-100">
                  <Image
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2070&auto=format&fit=crop"
                    alt="Students coding together"
                    fill
                    className="object-cover"
                  />
                  {/* Overlay Gradient for polish */}
                  <div className="absolute inset-0 bg-linear-to-tr from-slate-900/20 to-transparent" />
                </div>

                {/* Floating elements */}
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-slate-100 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                  <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <MonitorPlay size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">170+ Video Lessons</p>
                    <p className="text-xs font-medium text-slate-500">Always up-to-date</p>
                  </div>
                </div>
                <div className="absolute -top-6 -right-6 bg-white p-4 rounded-xl shadow-xl border border-slate-100 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-700 delay-500">
                  <div className="size-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                    <Award size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Certified Courses</p>
                    <p className="text-xs font-medium text-slate-500">Industry recognized</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Global Partners / Trust Section */}
        <section className="bg-slate-50 border-y border-slate-200 py-10">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Trusted by students from top organizations</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale">
              {['Amazon', 'Google', 'Microsoft', 'Meta', 'Netflix'].map((company, i) => (
                <div key={i} className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
                  {company}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Explore Categories</h2>
                <p className="text-slate-500 font-medium">Find the perfect specialized course to elevate your tech skills.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: "DSA & Algorithms", count: "45+ Videos", icon: Zap, color: "text-amber-600", bg: "bg-amber-50" },
                { name: "Core Java & Spring", count: "60+ Videos", icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50" },
                { name: "C++ Programming", count: "30+ Videos", icon: Code2, color: "text-indigo-600", bg: "bg-indigo-50" },
                { name: "System Design", count: "15+ Videos", icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
              ].map((cat, i) => (
                <div key={i} className="group flex flex-col items-start p-6 rounded-2xl border border-slate-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer bg-white">
                  <div className={`size-12 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${cat.bg} ${cat.color}`}>
                    <cat.icon size={24} strokeWidth={2} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{cat.name}</h3>
                  <p className="text-sm font-medium text-slate-500">{cat.count}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Courses */}
        <section className="py-24 bg-slate-50 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div className="max-w-2xl">
                <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">
                  Featured Courses
                </h2>
                <p className="text-slate-600 font-medium text-lg">
                  Start learning with confidence. Explore our highly-rated curriculum taught by industry veterans.
                </p>
              </div>
              <Link
                href="/courses"
                className="group text-primary font-bold hover:text-primary/80 flex items-center gap-2 transition-all"
              >
                View all courses
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-[400px] rounded-2xl bg-slate-50 animate-pulse border border-slate-100" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredCourses?.map((course: any, i: number) => (
                  <CourseCard
                    key={course.id || i}
                    {...course}
                    className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both"
                    style={{ animationDelay: `${i * 150}ms` } as any}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Value Proposition */}
        <section className="py-24 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="flex flex-col gap-8 lg:pr-8">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight tracking-tight">
                  Everything you need to <br />
                  <span className="text-primary">master your craft.</span>
                </h2>

                <div className="space-y-8">
                  {[
                    { title: "Instructor-Led Sessions", desc: "Learn completely practical implementations directly from professionals currently working at top tier tech companies.", icon: Users },
                    { title: "Rigorous Curriculum", desc: "Our pedagogical approach is designed for deep understanding, retention, and passing tough technical interviews.", icon: BookOpen },
                    { title: "Verifiable Certificates", desc: "Earn official proof of completion to showcase your commitment to employers and add to your portfolio.", icon: ShieldCheck },
                  ].map((feat, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="shrink-0 size-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                        <feat.icon size={24} strokeWidth={2} />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-slate-900 mb-1">{feat.title}</h4>
                        <p className="text-slate-600 font-medium text-sm leading-relaxed">{feat.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="relative aspect-square md:aspect-4/3 rounded-2xl overflow-hidden shadow-xl border border-slate-200">
                  <Image
                    src="https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2070&auto=format&fit=crop"
                    alt="Learning experience"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 bg-white pb-32">
          <div className="max-w-5xl mx-auto px-6">
            <div className="bg-primary rounded-3xl p-12 md:p-16 text-center text-white relative overflow-hidden shadow-2xl">
              {/* Decorative rings */}
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 size-64 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 size-64 bg-black/10 rounded-full blur-2xl" />

              <div className="relative z-10 flex flex-col items-center gap-6">
                <h2 className="text-3xl md:text-5xl font-bold leading-tight tracking-tight">
                  Ready to empower your future?
                </h2>
                <p className="text-primary-foreground/90 text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
                  Join our global community of lifelong learners and take the next confident step towards your career goals today.
                </p>
                <div className="flex gap-4 mt-4">
                  <Link href="/register">
                    <Button size="lg" className="h-14 px-8 py-0 rounded-xl text-lg font-bold bg-white text-primary hover:bg-slate-50 shadow-sm border-none">
                      Join for Free
                    </Button>
                  </Link>
                  <Link href="/courses">
                    <Button variant="outline" size="lg" className="h-14 px-8 py-0 rounded-xl text-lg font-bold bg-transparent text-white border border-white/30 hover:bg-white/10">
                      Explore Courses
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
