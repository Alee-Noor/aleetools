import type { Metadata } from 'next';
import { ShieldCheck, Lock, EyeOff, ServerOff, CheckCircle } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Privacy Policy – 100% Client-Side Processing | Alee Tools',
  description:
    'Our ironclad privacy guarantee: all 156 tools operate privately and securely. No files, documents, or data are ever uploaded to a server.',
  alternates: {
    canonical: 'https://alee.software/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Privacy Policy', href: '/privacy' },
          ]}
        />
      </div>

      <header className="mb-10">
        <div
          className="mb-3 inline-flex items-center gap-2 rounded-[10px] px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300"
          style={{ background: 'var(--color-accent-primary-soft)' }}
        >
          <ShieldCheck size={14} />
          <span>Zero Server Upload Guarantee</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4" style={{ color: 'var(--ink)' }}>
          Privacy Policy
        </h1>
        <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 leading-relaxed">
          At Alee Tools, privacy is an architectural guarantee, not merely a legal statement. We built this platform so that we literally cannot view your files.
        </p>
      </header>

      <div className="space-y-8 text-sm sm:text-base leading-relaxed text-stone-700 dark:text-stone-300">
        {/* Core pillar card */}
        <div
          className="p-6 sm:p-8 rounded-[18px] border space-y-4"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="flex items-center gap-3">
            <ServerOff size={24} className="text-emerald-600" />
            <h2 className="text-xl font-bold" style={{ color: 'var(--ink)' }}>
              1. Your Files Never Leave Your Device
            </h2>
          </div>
          <p>
            When you select an image, PDF, or text file in any tool on Alee Tools, the file is read directly into your web browser&apos;s local memory using modern client-side APIs (such as HTML5 Canvas, the File API, and WebAssembly).
          </p>
          <p>
            <strong>No network request is ever made with your file content.</strong> No file is sent to an external server, no temporary cache is created on any cloud storage, and no backend database receives your documents.
          </p>
        </div>

        <div
          className="p-6 sm:p-8 rounded-[18px] border space-y-4"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="flex items-center gap-3">
            <EyeOff size={24} className="text-blue-600" />
            <h2 className="text-xl font-bold" style={{ color: 'var(--ink)' }}>
              2. No Accounts, No Trackers, No Cookies
            </h2>
          </div>
          <p>
            We do not require you to create an account, register with an email, or sign in. We do not store personal profiles, browsing habits, or tool usage histories.
          </p>
          <ul className="space-y-2 list-disc list-inside text-stone-600 dark:text-stone-400">
            <li>No user account registration or login required.</li>
            <li>No tracking cookies or invasive third-party ad pixels.</li>
            <li>No retention of input text, passwords, UUIDs, or QR data.</li>
          </ul>
        </div>

        <div
          className="p-6 sm:p-8 rounded-[18px] border space-y-4"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="flex items-center gap-3">
            <Lock size={24} className="text-amber-600" />
            <h2 className="text-xl font-bold" style={{ color: 'var(--ink)' }}>
              3. Open Auditing & Client Execution
            </h2>
          </div>
          <p>
            Because this website is deployed as a static export, you can verify this behavior yourself at any time by opening your browser&apos;s Developer Tools (Network Tab) while running any tool. You will see zero outbound POST requests containing your payload data.
          </p>
        </div>

        <div
          className="p-6 rounded-[14px] border text-xs text-stone-500"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          Last updated: September 2026. For questions regarding our privacy architecture, contact us at privacy@alee.software.
        </div>
      </div>
    </div>
  );
}
