'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, ArrowRight, Layers, Sparkles } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Chip } from '@/components/ui/Chip';
import { getToolUrl, type Tool, type Category } from '@/lib/tool-registry';
import { DEFAULT_LOCALE, getLocalizedPath, type Locale } from '@/lib/i18n';
import { t } from '@/lib/translations';

interface ToolsDirectoryClientProps {
  categories: Category[];
  tools: Tool[];
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
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.shortDescription.toLowerCase().includes(q) ||
          t.keywords.some((k) => k.toLowerCase().includes(q))
      );
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
                Clear
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
          All ({tools.length})
        </Chip>
        {categories.map((cat) => {
          const count = tools.filter((t) => t.category === cat.slug).length;
          return (
            <Chip
              key={cat.slug}
              active={selectedCategory === cat.slug}
              accentColor={`var(--color-${cat.color})`}
              onClick={() => setSelectedCategory(cat.slug)}
            >
              {cat.name} ({count})
            </Chip>
          );
        })}
      </div>

      {/* Results Count */}
      <div className="mb-6 flex items-center justify-between text-xs text-stone-600 dark:text-stone-400 font-medium">
        <span>
          Showing <strong>{filteredTools.length}</strong> of {tools.length} tools
        </span>
        {searchQuery && (
          <span>Filtering by &ldquo;{searchQuery}&rdquo;</span>
        )}
      </div>

      {/* Tools Grid */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredTools.map((tool) => {
            const cat = categories.find((c) => c.slug === tool.category);
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
                      {cat?.name.split(' ')[0] || 'Tool'}
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
                    {tool.name}
                  </h2>
                  <p className="text-xs line-clamp-2 leading-relaxed font-medium" style={{ color: 'var(--ink-soft)' }}>
                    {tool.shortDescription}
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
            No tools found matching &ldquo;{searchQuery}&rdquo;.
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
            Reset search and filters
          </button>
        </div>
      )}
    </div>
  );
}
