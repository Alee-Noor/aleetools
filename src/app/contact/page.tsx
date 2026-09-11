import type { Metadata } from 'next';
import { Mail, MessageSquare, ExternalLink, Sparkles } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Contact – Feedback & Feature Requests | Alee Tools',
  description:
    'Have a suggestion for a new browser tool or feedback on existing utilities? Get in touch with the Alee Tools team.',
  alternates: {
    canonical: 'https://alee.software/contact',
  },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Contact', href: '/contact' },
          ]}
        />
      </div>

      <header className="mb-10">
        <div
          className="mb-3 inline-flex items-center gap-2 rounded-[10px] px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300"
          style={{ background: 'var(--color-accent-primary-soft)' }}
        >
          <MessageSquare size={14} />
          <span>Feedback & Support</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4" style={{ color: 'var(--ink)' }}>
          Get in Touch
        </h1>
        <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 leading-relaxed">
          Alee Tools is constantly growing. If there is a browser tool or file format you wish we supported, let us know.
        </p>
      </header>

      <div className="space-y-6">
        <div
          className="p-6 sm:p-8 rounded-[18px] border space-y-4"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-3">
            <Mail size={22} style={{ color: 'var(--color-accent-primary)' }} />
            <h2 className="text-lg font-bold" style={{ color: 'var(--ink)' }}>
              Direct Email
            </h2>
          </div>
          <p className="text-sm text-stone-600 dark:text-stone-300">
            For general inquiries, bug reports, or partnership proposals, reach out directly at:
          </p>
          <div className="p-4 rounded-[12px] bg-stone-100 dark:bg-stone-900/60 font-mono text-sm font-semibold inline-block">
            hello@alee.software
          </div>
        </div>

        <div
          className="p-6 sm:p-8 rounded-[18px] border space-y-4"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-3">
            <Sparkles size={22} className="text-amber-500" />
            <h2 className="text-lg font-bold" style={{ color: 'var(--ink)' }}>
              Suggest a New Tool
            </h2>
          </div>
          <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
            Every tool on this site is built to solve real creator, student, and engineer workflows client-side. If you need a specific calculator, image operation, or format converter, send us your feature request!
          </p>
        </div>
      </div>
    </div>
  );
}
