import Link from 'next/link';
import { type ReactNode } from 'react';
import { Shield, Sparkles, ArrowRight, CheckCircle2, Zap } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Accordion } from '@/components/ui/Accordion';
import { ClayCard } from '@/components/ui/ClayCard';
import { JsonLd } from '@/components/seo/JsonLd';
import {
  type Tool,
  getCategoryBySlug,
  getSubcategoryBySlug,
  getRelatedTools,
  getToolUrl,
  getCategoryUrl,
  getSubcategoryUrl,
} from '@/lib/tool-registry';
import { buildToolJsonLd } from '@/lib/seo';

interface ToolPageShellProps {
  tool: Tool;
  children: ReactNode;
  howToSteps?: string[];
  referenceTable?: ReactNode;
}

export function ToolPageShell({
  tool,
  children,
  howToSteps,
  referenceTable,
}: ToolPageShellProps) {
  const category = getCategoryBySlug(tool.category);
  const subcategory = tool.subcategory
    ? getSubcategoryBySlug(tool.category, tool.subcategory)
    : undefined;
  const relatedTools = getRelatedTools(tool);
  const { softwareApp, faqPage } = buildToolJsonLd(tool);

  // Build breadcrumb items
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Tools', href: '/tools' },
  ];
  if (category) {
    breadcrumbItems.push({
      label: category.name,
      href: getCategoryUrl(category),
    });
  }
  if (subcategory && category) {
    breadcrumbItems.push({
      label: subcategory.name,
      href: getSubcategoryUrl(subcategory),
    });
  }
  breadcrumbItems.push({
    label: tool.name,
    href: getToolUrl(tool),
  });

  const defaultSteps = [
    `Open ${tool.name} — no account or login needed.`,
    'Select your file or input your data into the tool panel above.',
    'Adjust the settings, dimensions, or parameters to your preference.',
    'Click process and save your result directly to your device.',
  ];

  const stepsToDisplay = howToSteps && howToSteps.length > 0 ? howToSteps : defaultSteps;

  return (
    <>
      <JsonLd data={softwareApp} />
      <JsonLd data={faqPage} />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        {/* 1. Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* 2. Header: H1 + Intro */}
        <header className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-[10px] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white"
            style={{
              background: category ? `var(--color-${category.color})` : 'var(--color-accent-primary)',
            }}
          >
            {category?.name || 'Tool'}
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-4" style={{ color: 'var(--ink)' }}>
            {tool.h1}
          </h1>
          <p className="text-lg leading-relaxed max-w-3xl font-semibold" style={{ color: 'var(--ink-soft)' }}>
            {tool.metaDescription}
          </p>
        </header>

        {/* 3. Primary Interactive Tool Panel */}
        <section className="mb-6">
          <ClayCard className="border border-white/60 dark:border-white/10 overflow-hidden shadow-lg">
            {children}
          </ClayCard>
        </section>

        {/* 4. Feature microcopy badge */}
        <div className="mb-14 flex flex-wrap items-center justify-between gap-4 rounded-[14px] px-5 py-3.5 border shadow-sm"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold" style={{ color: 'var(--ink)' }}>
            <Zap size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              <strong>Instant & Fast:</strong> High-performance utility tools ready for immediate use.
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-300 font-medium">
            <Sparkles size={14} className="text-amber-500 shrink-0" />
            <span>Free Forever • No Watermarks • No Sign-up</span>
          </div>
        </div>

        {/* 5. Optional Reference Table / Platform Specs */}
        {referenceTable && (
          <section className="mb-14">
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--ink)' }}>
              Specifications & Recommended Dimensions
            </h2>
            <div className="overflow-hidden rounded-[14px] border" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
              {referenceTable}
            </div>
          </section>
        )}

        {/* 6. How to Use Section */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--ink)' }}>
            How to use {tool.name}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stepsToDisplay.map((step, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3.5 p-5 rounded-[14px] border"
                style={{
                  background: 'var(--surface)',
                  borderColor: 'var(--border)',
                }}
              >
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ background: 'var(--color-accent-primary)' }}
                >
                  {idx + 1}
                </div>
                <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--ink)' }}>
                  {step}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 7. FAQ Accordion */}
        {tool.faqs && tool.faqs.length > 0 && (
          <section className="mb-14">
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--ink)' }}>
              Frequently Asked Questions
            </h2>
            <div
              className="rounded-[14px] border p-6 sm:p-8"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
              }}
            >
              <Accordion items={tool.faqs} />
            </div>
          </section>
        )}

        {/* 8. Related Tools */}
        {relatedTools.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ color: 'var(--ink)' }}>
                Related Tools
              </h2>
              <Link
                href="/tools"
                className="text-sm font-medium flex items-center gap-1 hover:underline"
                style={{ color: 'var(--color-accent-primary)' }}
              >
                <span>View all 156 tools</span>
                <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedTools.map((rel) => (
                <Link
                  key={rel.slug}
                  href={getToolUrl(rel)}
                  className="group block p-5 rounded-[14px] border transition-all duration-150 hover:shadow-md no-underline"
                  style={{
                    background: 'var(--surface)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <h3
                    className="text-base font-semibold mb-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors"
                    style={{ color: 'var(--ink)' }}
                  >
                    {rel.name}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                    {rel.shortDescription}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
