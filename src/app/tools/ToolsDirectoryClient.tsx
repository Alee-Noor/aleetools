'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, ArrowRight, Layers, Sparkles, ShieldCheck, Lock, Zap, CheckCircle2, HelpCircle } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Chip } from '@/components/ui/Chip';
import { getToolUrl, type Tool, type Category } from '@/lib/tool-registry';
import { DEFAULT_LOCALE, getLocalizedPath, type Locale } from '@/lib/i18n';
import { t } from '@/lib/translations';

export interface LocalizedCategory extends Category {
  displayName?: string;
}

export interface LocalizedTool extends Tool {
  displayName?: string;
  displayShortDescription?: string;
}

interface ToolsDirectoryClientProps {
  categories: (Category | LocalizedCategory)[];
  tools: (Tool | LocalizedTool)[];
  locale?: Locale;
}

export function ToolsDirectoryClient({ categories, tools, locale = DEFAULT_LOCALE }: ToolsDirectoryClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredTools = useMemo(() => {
    let list = tools;
    if (selectedCategory !== 'all') {
      list = list.filter((t) => t.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((t: Tool | LocalizedTool) => {
        const name = 'displayName' in t && t.displayName ? t.displayName : t.name;
        const desc =
          'displayShortDescription' in t && t.displayShortDescription
            ? t.displayShortDescription
            : t.shortDescription;
        return (
          name.toLowerCase().includes(q) ||
          desc.toLowerCase().includes(q) ||
          t.name.toLowerCase().includes(q) ||
          t.shortDescription.toLowerCase().includes(q) ||
          t.keywords.some((k) => k.toLowerCase().includes(q))
        );
      });
    }
    return list;
  }, [tools, selectedCategory, searchQuery]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6">
        <Breadcrumbs
          items={[
            { label: t(locale, 'breadcrumbs.home'), href: getLocalizedPath(locale, '/') },
            { label: t(locale, 'breadcrumbs.tools'), href: getLocalizedPath(locale, '/tools') },
          ]}
        />
      </div>

      <header className="mb-10 text-center max-w-3xl mx-auto">
        <div
          className="inline-flex items-center gap-2 rounded-[10px] px-3.5 py-1 text-xs font-semibold uppercase tracking-wider mb-3"
          style={{
            background: 'var(--color-accent-primary-soft)',
            color: 'var(--color-accent-primary)',
          }}
        >
          <Layers size={14} />
          <span>{t(locale, 'tools.toolsAvailable', { count: tools.length })}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4" style={{ color: 'var(--ink)' }}>
          {t(locale, 'header.browseTools')}
        </h1>
        <p className="text-base sm:text-lg leading-relaxed font-semibold" style={{ color: 'var(--ink-soft)' }}>
          {t(locale, 'home.heroSubtitle')}
        </p>

        {/* Search Bar */}
        <div className="mt-8 max-w-xl mx-auto">
          <div
            className="clay-surface flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-3.5"
            style={{
              borderRadius: 'var(--radius-md)',
              background: 'var(--surface)',
            }}
          >
            <Search size={20} className="text-stone-600 dark:text-stone-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t(locale, 'home.searchPlaceholder')}
              className="w-full bg-transparent text-sm sm:text-base outline-none placeholder:text-stone-500 dark:placeholder:text-stone-400 font-medium"
              style={{ color: 'var(--ink)' }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs text-stone-600 dark:text-stone-400 hover:text-stone-900 px-1 font-semibold"
              >
                {t(locale, 'tools.clear')}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Category filter chips */}
      <div className="mb-8 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
        <Chip
          active={selectedCategory === 'all'}
          onClick={() => setSelectedCategory('all')}
        >
          {t(locale, 'tools.all')} ({tools.length})
        </Chip>
        {categories.map((cat) => {
          const count = tools.filter((t) => t.category === cat.slug).length;
          const catName = 'displayName' in cat && cat.displayName ? cat.displayName : cat.name;
          return (
            <Chip
              key={cat.slug}
              active={selectedCategory === cat.slug}
              accentColor={`var(--color-${cat.color})`}
              onClick={() => setSelectedCategory(cat.slug)}
            >
              {catName} ({count})
            </Chip>
          );
        })}
      </div>

      {/* Results Count */}
      <div className="mb-6 flex items-center justify-between text-xs text-stone-600 dark:text-stone-400 font-medium">
        <span>
          {t(locale, 'tools.showingCount', { filtered: filteredTools.length, total: tools.length })}
        </span>
        {searchQuery && (
          <span>{t(locale, 'tools.filteringBy', { query: searchQuery })}</span>
        )}
      </div>

      {/* Tools Grid */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredTools.map((tool) => {
            const cat = categories.find((c) => c.slug === tool.category);
            const toolName = 'displayName' in tool && tool.displayName ? tool.displayName : tool.name;
            const toolDesc =
              'displayShortDescription' in tool && tool.displayShortDescription
                ? tool.displayShortDescription
                : tool.shortDescription;
            const catBadge = cat
              ? 'displayName' in cat && cat.displayName
                ? cat.displayName.split(' ')[0]
                : cat.name.split(' ')[0]
              : t(locale, 'tools.tool');

            return (
              <Link
                key={`${tool.category}-${tool.slug}`}
                href={getLocalizedPath(locale, getToolUrl(tool))}
                className="group relative flex flex-col justify-between overflow-hidden p-5 rounded-[16px] border transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 no-underline"
                style={{
                  background: 'var(--surface)',
                  borderColor: 'var(--border)',
                }}
              >
                <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                  <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-emerald-500/10 dark:bg-emerald-400/15 blur-xl transition-all group-hover:scale-125" />
                  <div className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-amber-500/10 dark:bg-violet-500/15 blur-xl transition-all group-hover:scale-125" />
                  <div className="absolute inset-0 bg-[radial-gradient(#2C6E59_0.9px,transparent_0.9px)] dark:bg-[radial-gradient(#3DD6A0_0.9px,transparent_0.9px)] [background-size:32px_32px] opacity-15 dark:opacity-25" />
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/40 dark:via-emerald-400/50 to-transparent" />
                </div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-[6px]"
                      style={{
                        background: cat ? `var(--color-${cat.color}-soft)` : 'var(--color-accent-primary-soft)',
                        color: cat ? `var(--color-${cat.color})` : 'var(--color-accent-primary)',
                      }}
                    >
                      {catBadge}
                    </span>
                    <ArrowRight
                      size={14}
                      className="text-stone-500 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 group-hover:translate-x-1 transition-all"
                    />
                  </div>
                  <h2
                    className="text-base font-bold mb-1.5 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors"
                    style={{ color: 'var(--ink)' }}
                  >
                    {toolName}
                  </h2>
                  <p className="text-xs line-clamp-2 leading-relaxed font-medium" style={{ color: 'var(--ink-soft)' }}>
                    {toolDesc}
                  </p>
                </div>

                <div className="relative z-10 mt-4 pt-3 border-t flex items-center gap-1.5 text-[11px] font-semibold" style={{ borderColor: 'var(--border)', color: 'var(--ink-soft)' }}>
                  <Sparkles size={12} className="text-emerald-600 dark:text-emerald-400" />
                  <span>{t(locale, 'tools.instantAccess')}</span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div
          className="text-center py-16 px-4 rounded-[20px] border my-8"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <p className="text-base text-stone-600 dark:text-stone-400 mb-4">
            {t(locale, 'tools.noToolsFound', { query: searchQuery })}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="text-sm font-semibold hover:underline"
            style={{ color: 'var(--color-accent-primary)' }}
          >
            {t(locale, 'tools.resetFilters')}
          </button>
        </div>
      )}

      {/* ─── DIRECTORY EDUCATIONAL & SEO GUIDE ─── */}
      <section className="mt-16 sm:mt-24 space-y-12 border-t pt-12" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-[10px] px-3.5 py-1 text-xs font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
            <ShieldCheck size={14} />
            <span>Architecture & Security Standards</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--ink)' }}>
            Why In-Browser Client-Side Processing is the Future of Web Tools
          </h2>
          <p className="text-sm leading-relaxed font-medium" style={{ color: 'var(--ink-soft)' }}>
            Every tool in the Alee catalog has been engineered with a single guiding principle: <strong>your files belong to you</strong>. When you use conventional online tool websites, your files must be transmitted across the internet to third-party cloud servers. This exposes confidential company documents, proprietary code, personal identity photos, and private contracts to potential security breaches and unwanted data retention.
          </p>
          <p className="text-sm leading-relaxed font-medium" style={{ color: 'var(--ink-soft)' }}>
            Alee Tools replaces cloud-dependent architectures with modern client-side standards. Utilizing HTML5 Canvas, WebAssembly (WASM), and the Web Cryptography API, every byte of data is manipulated directly within your local browser memory. Processing completes instantly without network upload delays, and zero data is ever transmitted or stored on remote servers.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 rounded-[16px] border space-y-2.5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="p-2 rounded-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 w-fit">
              <Lock size={18} />
            </div>
            <h3 className="text-sm font-bold" style={{ color: 'var(--ink)' }}>100% Zero-Upload Privacy</h3>
            <p className="text-xs leading-relaxed font-medium" style={{ color: 'var(--ink-soft)' }}>
              No cloud storage, no server databases, and no third-party inspection. Fully compliant with GDPR and CCPA privacy standards.
            </p>
          </div>

          <div className="p-5 rounded-[16px] border space-y-2.5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="p-2 rounded-[10px] bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 w-fit">
              <Zap size={18} />
            </div>
            <h3 className="text-sm font-bold" style={{ color: 'var(--ink)' }}>Instant Hardware Speed</h3>
            <p className="text-xs leading-relaxed font-medium" style={{ color: 'var(--ink-soft)' }}>
              Operations run on your device&apos;s CPU and GPU, eliminating network latency and file upload wait times.
            </p>
          </div>

          <div className="p-5 rounded-[16px] border space-y-2.5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="p-2 rounded-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 w-fit">
              <CheckCircle2 size={18} />
            </div>
            <h3 className="text-sm font-bold" style={{ color: 'var(--ink)' }}>Zero Paywalls or Quotas</h3>
            <p className="text-xs leading-relaxed font-medium" style={{ color: 'var(--ink-soft)' }}>
              No monthly subscription limits, credit card demands, or artificial file size restrictions. Free forever.
            </p>
          </div>

          <div className="p-5 rounded-[16px] border space-y-2.5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="p-2 rounded-[10px] bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 w-fit">
              <Sparkles size={18} />
            </div>
            <h3 className="text-sm font-bold" style={{ color: 'var(--ink)' }}>No Watermarks Added</h3>
            <p className="text-xs leading-relaxed font-medium" style={{ color: 'var(--ink-soft)' }}>
              Your exported PDFs, images, and barcodes remain completely clean and ready for immediate professional use.
            </p>
          </div>
        </div>

        {/* 5 Workbenches Overview */}
        <div className="rounded-[18px] border p-6 sm:p-8 space-y-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h3 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--ink)' }}>
            Overview of the Five Specialized Workbenches
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed font-medium">
            <div className="space-y-1.5">
              <strong className="text-emerald-700 dark:text-emerald-400 text-sm block">1. Image & Social Media Utility Hub</strong>
              <p style={{ color: 'var(--ink-soft)' }}>
                Tailored aspect ratio calculators, grid splitters, and image resizers engineered for Instagram, YouTube, TikTok, and general publishing. Delivers exact platform dimensions without compression artifacts.
              </p>
            </div>
            <div className="space-y-1.5">
              <strong className="text-amber-700 dark:text-amber-400 text-sm block">2. PDF Student & Office Toolkit</strong>
              <p style={{ color: 'var(--ink-soft)' }}>
                Perform essential document operations — merging, splitting, compressing, rotating, watermarking, and converting — directly in your browser. Handles sensitive contracts and academic papers with complete confidentiality.
              </p>
            </div>
            <div className="space-y-1.5">
              <strong className="text-blue-700 dark:text-blue-400 text-sm block">3. Developer Utilities & Network Tools</strong>
              <p style={{ color: 'var(--ink-soft)' }}>
                Everyday engineering tools including JSON formatters, regex testers, UUID generators, Base64 converters, CIDR calculators, and color space converters designed for low-latency workflow efficiency.
              </p>
            </div>
            <div className="space-y-1.5">
              <strong className="text-red-700 dark:text-red-400 text-sm block">4. Image Format Conversion & Editing</strong>
              <p style={{ color: 'var(--ink-soft)' }}>
                Convert seamlessly between modern web formats (WebP, PNG, JPG, SVG, HEIC, BMP) with client-side lossy and lossless algorithms that retain crisp detail while shrinking file weight.
              </p>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <strong className="text-purple-700 dark:text-purple-400 text-sm block">5. QR Code & Barcode Generation Suite</strong>
              <p style={{ color: 'var(--ink-soft)' }}>
                Create scannable vector QR codes for URLs, Wi-Fi credentials, vCards, and emails, alongside industry-standard product barcodes (EAN-13, UPC-A, Code 128) with customizable error correction levels.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
