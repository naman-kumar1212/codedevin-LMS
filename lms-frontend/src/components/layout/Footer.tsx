'use client';

import Link from 'next/link';
import { Terminal, Linkedin, Twitter, Github } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Separator } from '@/components/ui/separator';

export function Footer() {
  return (
    <footer className="bg-white border-t border-border w-full pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        {/* Top Section: Multi-column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 pb-12">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-2.5 group cursor-pointer w-fit">
              <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:bg-primary/90 transition-all duration-300">
                <Terminal size={20} />
              </div>
              <h2 className="text-foreground text-2xl font-bold tracking-tight">
                Codedevin<span className="text-primary">.</span>
              </h2>
            </div>
            <p className="text-muted-foreground text-[15px] leading-relaxed max-w-sm">
              Premier learning platform for Computer Science students. Master DSA, 
              Core Java, and C++ with our specialized 170+ video library.
            </p>
          </div>

          {/* Links Section */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8">
            {/* Links Column 1: Explore */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-sans">Explore</h3>
              <ul className="space-y-4">
                <li><Link href="/courses" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">All Courses</Link></li>
                <li><Link href="/learning-paths" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Learning Paths</Link></li>
                <li><Link href="/success-stories" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Success Stories</Link></li>
                <li><Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Pricing</Link></li>
              </ul>
            </div>

            {/* Links Column 2: Resources */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-sans">Resources</h3>
              <ul className="space-y-4">
                <li><Link href="/help" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Help Center</Link></li>
                <li><Link href="/blog" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Blog</Link></li>
                <li><Link href="/community" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Community Forum</Link></li>
                <li><Link href="/faq" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">FAQs</Link></li>
              </ul>
            </div>

            {/* Links Column 3: Legal */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-sans">Legal</h3>
              <ul className="space-y-4">
                <li><Link href="/privacy" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link href="/refunds" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Refund Policy</Link></li>
                <li><Link href="/contact" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Contact Us</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <Separator className="opacity-50" />

        {/* Bottom Section: Metadata & Copyright */}
        <div className="pt-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
            <span className="text-sm font-bold text-foreground tracking-tight">Codedevin LMS</span>
            <div className="hidden md:block size-1.5 rounded-full bg-primary/30" />
            <p className="text-sm text-muted-foreground font-medium">
              Empowering Future Developers
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-6">
             <p className="text-sm text-muted-foreground font-medium">
              &copy; {new Date().getFullYear()} Codedevin. All rights reserved.
            </p>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="size-10 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20">
                <Linkedin size={20} />
              </Button>
              <Button variant="ghost" size="icon" className="size-10 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20">
                <Twitter size={20} />
              </Button>
              <Button variant="ghost" size="icon" className="size-10 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20">
                <Github size={20} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

