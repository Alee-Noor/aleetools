import type { Metadata } from 'next';
import Link from 'next/link';
import { Wrench, Shield, Zap, Sparkles, ArrowRight } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

export const metadata: Metadata = {
  title: 'About Alee Tools – Handcrafted Micro-Tools for Creators & Developers',
  description:
    'Alee Tools is an independent digital workshop of 156 free micro-tools built to deliver instant results with zero subscriptions and zero paywalls.',
  alternates: {
    canonical: 'https://alee.software/about',
  },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'About', href: '/about' },
          ]}
        />
      </div>

      <header className="mb-10">
        <div
          className="mb-3 inline-flex items-center gap-2 rounded-[10px] px-3.5 py-1 text-xs font-semibold uppercase tracking-wider"
          style={{
            background: 'var(--color-accent-primary-soft)',
            color: 'var(--color-accent-primary)',
          }}
        >
          <Wrench size={14} />
          <span>About Alee Tools</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4" style={{ color: 'var(--ink)' }}>
          A Physical Workshop for the Modern Web
        </h1>
        <p className="text-base sm:text-lg text-stone-700 dark:text-stone-300 leading-relaxed font-medium">
          We built Alee Tools to solve a universal annoyance: why do you need to upload a confidential document or private photo to someone else&apos;s server just to resize an image, format a JSON snippet, or merge two PDF files?
        </p>
      </header>

      <div className="space-y-8 text-sm sm:text-base leading-relaxed text-stone-700 dark:text-stone-300">
        <div className="p-6 sm:p-8 rounded-[18px] border space-y-4 shadow-sm" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h2 className="text-xl font-bold" style={{ color: 'var(--ink)' }}>
            The Problem With Cloud Tools
          </h2>
          <p>
            Most online conversion and utility websites operate on outdated architectures: you upload your file to their cloud server, wait in a processing queue, hope they don&apos;t store or leak your file, and often face watermarks, paywalls, or file size limits designed to force a monthly subscription.
          </p>
          <p>
            Modern web technologies and efficient architectures provide instant execution without costly server queues. There is simply no technical reason to wait in line or pay subscriptions for routine digital operations.
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-[18px] border space-y-4 shadow-sm" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h2 className="text-xl font-bold" style={{ color: 'var(--ink)' }}>
            Our Three Commitments
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-[12px] bg-stone-100 dark:bg-stone-900/60 space-y-2">
              <div className="font-bold text-sm" style={{ color: 'var(--ink)' }}>1. Instant Speed</div>
              <p className="text-xs text-stone-600 dark:text-stone-400">Zero waiting in processing queues. Operations complete immediately.</p>
            </div>
            <div className="p-4 rounded-[12px] bg-stone-100 dark:bg-stone-900/60 space-y-2">
              <div className="font-bold text-sm" style={{ color: 'var(--ink)' }}>2. Zero Paywalls</div>
              <p className="text-xs text-stone-600 dark:text-stone-400">No premium tier, no subscription nag screens, and no watermarks.</p>
            </div>
            <div className="p-4 rounded-[12px] bg-stone-100 dark:bg-stone-900/60 space-y-2">
              <div className="font-bold text-sm" style={{ color: 'var(--ink)' }}>3. Tactility & Precision</div>
              <p className="text-xs text-stone-600 dark:text-stone-400">Instant load times, dependable calculations, and intuitive hand-tool ergonomics.</p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 rounded-[18px] border flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div>
            <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--ink)' }}>
              Explore the 156-Tool Catalog
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 font-medium">
              Find exactly what you need in seconds across images, PDFs, developer utilities, and QR codes.
            </p>
          </div>
          <Link
            href="/tools"
            className="clay-chip py-3 px-6 text-sm font-semibold no-underline"
            style={{
              background: 'var(--color-accent-primary)',
              color: '#FFFFFF',
              borderColor: 'transparent',
            }}
          >
            Browse All Tools
          </Link>
        </div>
      </div>
    </div>
  );
}
