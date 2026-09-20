import Link from 'next/link';
import { type ReactNode } from 'react';
import { Sparkles, ArrowRight, Zap } from 'lucide-react';
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
import { type Locale, DEFAULT_LOCALE, getLocalizedPath } from '@/lib/i18n';
import {
  getToolSeoTranslation,
  getCategorySeoTranslation,
  getSubcategorySeoTranslation,
  t,
} from '@/lib/translations';

interface ToolPageShellProps {
  tool: Tool;
  children: ReactNode;
  howToSteps?: string[];
  referenceTable?: ReactNode;
  locale?: Locale;
}

export async function ToolPageShell({
  tool,
  children,
  howToSteps,
  referenceTable,
  locale = DEFAULT_LOCALE,
}: ToolPageShellProps) {
  const category = getCategoryBySlug(tool.category);
  const subcategory = tool.subcategory
    ? getSubcategoryBySlug(tool.category, tool.subcategory)
    : undefined;
  const relatedTools = getRelatedTools(tool);
  const localizedRelatedTools = await Promise.all(
    relatedTools.map(async (rel) => {
      const relSeo = await getToolSeoTranslation(locale, rel.slug);
      return {
        ...rel,
        displayName: relSeo?.name || rel.name,
        displayShortDescription: relSeo?.shortDescription || rel.shortDescription,
      };
    })
  );

  // Multilingual SEO overrides
  const seo = await getToolSeoTranslation(locale, tool.slug);
  const categorySeo = await getCategorySeoTranslation(locale, tool.category);
  const subcategorySeo = tool.subcategory
    ? await getSubcategorySeoTranslation(locale, tool.subcategory)
    : null;

  const toolName = seo?.name || tool.name;
  const toolH1 = seo?.h1 || tool.h1;
  const toolMetaDesc = seo?.metaDescription || tool.metaDescription;
  const categoryName = categorySeo?.name || category?.name || 'Tool';
  const subcategoryName = subcategorySeo?.name || subcategory?.name;
  const faqsToDisplay = (seo?.faqs && seo.faqs.length > 0) ? seo.faqs : tool.faqs;

  const { softwareApp, faqPage } = await buildToolJsonLd(tool, locale);

  // Build localized breadcrumb items
  const breadcrumbItems = [
    { label: t(locale, 'breadcrumbs.home'), href: getLocalizedPath(locale, '/') },
    { label: t(locale, 'breadcrumbs.tools'), href: getLocalizedPath(locale, '/tools') },
  ];
  if (category) {
    breadcrumbItems.push({
      label: categoryName,
      href: getLocalizedPath(locale, getCategoryUrl(category)),
    });
  }
  if (subcategory && category) {
    breadcrumbItems.push({
      label: subcategoryName || subcategory.name,
      href: getLocalizedPath(locale, getSubcategoryUrl(subcategory)),
    });
  }
  breadcrumbItems.push({
    label: toolName,
    href: getLocalizedPath(locale, getToolUrl(tool)),
  });

  const defaultSteps = [
    `${toolName} — ${t(locale, 'features.noAccounts')}`,
    t(locale, 'home.step2Desc'),
    'Adjust settings, dimensions, or parameters to your preference.',
    t(locale, 'home.step3Desc'),
  ];

  const stepsToDisplay = howToSteps && howToSteps.length > 0 ? howToSteps : defaultSteps;

  return (
    <>
      <JsonLd data={softwareApp} />
      {faqPage && <JsonLd data={faqPage} />}

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        {/* 1. Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* 2. Header: H1 + Intro */}
        <header className="mb-8">
          <div
            className="mb-3 inline-flex items-center gap-2 rounded-[10px] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white"
            style={{
              background: category ? `var(--color-${category.color})` : 'var(--color-accent-primary)',
            }}
          >
            {categoryName}
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-4" style={{ color: 'var(--ink)' }}>
            {toolH1}
          </h1>
          <p className="text-lg leading-relaxed max-w-3xl font-semibold" style={{ color: 'var(--ink-soft)' }}>
            {toolMetaDesc}
          </p>
        </header>

        {/* 3. Primary Interactive Tool Panel */}
        <section className="mb-6">
          <ClayCard className="border border-white/60 dark:border-white/10 overflow-hidden shadow-lg">
            {children}
          </ClayCard>
        </section>

        {/* 4. Feature microcopy badge */}
        <div
          className="mb-14 flex flex-wrap items-center justify-between gap-4 rounded-[14px] px-5 py-3.5 border shadow-sm"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold" style={{ color: 'var(--ink)' }}>
            <Zap size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              <strong>{t(locale, 'features.instantExecution')}:</strong> {t(locale, 'features.instantExecutionDesc')}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-300 font-medium">
            <Sparkles size={14} className="text-amber-500 shrink-0" />
            <span>{t(locale, 'features.freeForever')} • {t(locale, 'features.zeroWatermarks')} • {t(locale, 'features.noAccounts')}</span>
          </div>
        </div>

        {/* 5. Optional Reference Table / Platform Specs */}
        {referenceTable && (
          <section className="mb-14">
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--ink)' }}>
              {t(locale, 'tools.specsAndDimensions')}
            </h2>
            <div className="overflow-hidden rounded-[14px] border" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
              {referenceTable}
            </div>
          </section>
        )}

        {/* 6. How to Use Section */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--ink)' }}>
            {t(locale, 'tools.howToUse')} {toolName}
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
        {faqsToDisplay && faqsToDisplay.length > 0 && (
          <section className="mb-14">
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--ink)' }}>
              {t(locale, 'tools.faq')}
            </h2>
            <div
              className="rounded-[14px] border p-6 sm:p-8"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
              }}
            >
              <Accordion items={faqsToDisplay} />
            </div>
          </section>
        )}

        {/* 8. Related Tools */}
        {relatedTools.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ color: 'var(--ink)' }}>
                {t(locale, 'tools.relatedTools')}
              </h2>
              <Link
                href={getLocalizedPath(locale, '/tools')}
                className="text-sm font-medium flex items-center gap-1 hover:underline"
                style={{ color: 'var(--color-accent-primary)' }}
              >
                <span>{t(locale, 'home.viewAllTools')}</span>
                <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {localizedRelatedTools.map((rel) => (
                <Link
                  key={rel.slug}
                  href={getLocalizedPath(locale, getToolUrl(rel))}
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
                    {rel.displayName}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                    {rel.displayShortDescription}
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
