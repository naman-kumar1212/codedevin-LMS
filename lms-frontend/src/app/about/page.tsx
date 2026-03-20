'use client';

import React from 'react';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';
import { Terminal, Users, Target, Rocket, Award, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-bg-page flex flex-col">
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
            <Link href="/courses" className="text-sm font-medium text-text-secondary hover:text-primary">Courses</Link>
            <Link href="/login" className="text-sm font-medium text-text-secondary hover:text-primary">Login</Link>
            <Button size="sm">Get Started</Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-24 bg-bg-surface border-b border-border">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-5xl font-extrabold text-text-primary mb-6 tracking-tight">
              Empowering the Next Generation of <span className="text-primary">Engineers</span>
            </h1>
            <p className="text-xl text-text-secondary leading-relaxed font-medium">
              CodeDevin is more than just an LMS. It's a specialized learning environment 
              crafted for Computer Science students to master Data Structures, 
              Algorithms, and high-performance programming.
            </p>
          </div>
        </section>

        {/* Mission & Values */}
        <section className="py-24 max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { 
                title: "Technical Excellence", 
                desc: "We prioritize deep understanding over superficial syntax. Our 170+ videos focus on the 'why' behind the code.",
                icon: Target,
                color: "text-primary"
              },
              { 
                title: "Student-Centric", 
                desc: "Every course is structured for logical progression, ensuring students can apply concepts from Day 1.",
                icon: Users,
                color: "text-success"
              },
              { 
                title: "Future Ready", 
                desc: "Our curriculum is aligned with the top requirements of global tech giants and high-growth startups.",
                icon: Rocket,
                color: "text-warning"
              }
            ].map((value, i) => (
              <div key={i} className="p-8 rounded-2xl border border-border bg-bg-surface shadow-sm hover:shadow-md transition-all">
                <div className={`size-12 rounded-xl bg-bg-subtle flex items-center justify-center mb-6 ${value.color}`}>
                  <value.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-3">{value.title}</h3>
                <p className="text-text-secondary text-base leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Quality Guarantee */}
        <section className="py-24 bg-bg-subtle/50">
          <div className="max-w-5xl mx-auto px-6 text-center space-y-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success border border-success/20">
              <ShieldCheck size={18} />
              <span className="text-xs font-bold uppercase tracking-widest">Verified Quality</span>
            </div>
            <h2 className="text-4xl font-extrabold text-text-primary">Structured For Success</h2>
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div className="p-8 bg-bg-surface rounded-3xl border border-border">
                <p className="text-3xl font-bold text-primary mb-2">170+</p>
                <p className="text-sm font-bold text-text-muted uppercase tracking-widest mb-4">Specialized Videos</p>
                <p className="text-text-secondary">Deep dives into Java, C++, and DSA with real-world problem sets.</p>
              </div>
              <div className="p-8 bg-bg-surface rounded-3xl border border-border">
                <p className="text-3xl font-bold text-primary mb-2">98%</p>
                <p className="text-sm font-bold text-text-muted uppercase tracking-widest mb-4">Completion Rate</p>
                <p className="text-text-secondary">Our pedagogy ensures students stay engaged and reach the finish line.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 text-center">
          <h2 className="text-3xl font-bold text-text-primary mb-8">Ready to Master Programming?</h2>
          <Link href="/register">
            <Button size="lg" className="px-12 rounded-2xl shadow-xl shadow-primary/20">Create Your Account</Button>
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
