'use client';

import React from 'react';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';
import { Terminal, Users, Target, Rocket, Award, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="size-8 rounded bg-primary flex items-center justify-center text-white shadow-sm transition-colors">
              <Terminal size={18} />
            </div>
            <h2 className="text-slate-900 text-xl font-bold tracking-tight">
              Codedevin<span className="text-primary">.</span>
            </h2>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/courses" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Courses</Link>
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Login</Link>
            <Link href="/register" className="h-9 px-4 inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors">Get Started</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 bg-white border-b border-slate-200">
          <div className="max-w-3xl mx-auto px-6 text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">
              Empowering the Next Generation of <span className="text-primary">Engineers</span>
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              CodeDevin is more than just an LMS. It's a specialized learning environment 
              crafted for Computer Science students to master Data Structures, 
              Algorithms, and high-performance programming.
            </p>
          </div>
        </section>

        {/* Mission & Values */}
        <section className="py-20 max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                title: "Technical Excellence", 
                desc: "We prioritize deep understanding over superficial syntax. Our 170+ videos focus on the 'why' behind the code.",
                icon: Target,
                color: "text-primary",
                bg: "bg-primary/10"
              },
              { 
                title: "Student-Centric", 
                desc: "Every course is structured for logical progression, ensuring students can apply concepts from Day 1.",
                icon: Users,
                color: "text-emerald-600",
                bg: "bg-emerald-50 border-emerald-100"
              },
              { 
                title: "Future Ready", 
                desc: "Our curriculum is aligned with the top requirements of global tech giants and high-growth startups.",
                icon: Rocket,
                color: "text-blue-600",
                bg: "bg-blue-50 border-blue-100"
              }
            ].map((value, i) => (
              <div key={i} className="p-6 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-colors flex flex-col items-start text-left">
                <div className={`size-10 rounded border flex items-center justify-center mb-5 ${value.bg} ${value.color}`}>
                  <value.icon size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{value.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Quality Guarantee */}
        <section className="py-20 bg-slate-50 border-t border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-6 text-center space-y-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <ShieldCheck size={16} />
              <span className="text-xs font-semibold uppercase tracking-wider">Verified Quality</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Structured For Success</h2>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="p-6 bg-white rounded-lg border border-slate-200">
                <p className="text-3xl font-bold text-primary mb-1">170+</p>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Specialized Videos</p>
                <p className="text-sm text-slate-600">Deep dives into Java, C++, and DSA with real-world problem sets.</p>
              </div>
              <div className="p-6 bg-white rounded-lg border border-slate-200">
                <p className="text-3xl font-bold text-primary mb-1">98%</p>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Completion Rate</p>
                <p className="text-sm text-slate-600">Our pedagogy ensures students stay engaged and reach the finish line.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Ready to Master Programming?</h2>
          <Link href="/register" className="h-10 px-6 inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors">
            Create Your Account
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
