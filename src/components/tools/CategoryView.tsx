import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Layers, Sparkles, Folder, ShieldCheck, Lock, Zap, CheckCircle2, HelpCircle } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import {
  getCategoryBySlug,
  getSubcategoriesByCategory,
  getToolsByCategory,
  getToolUrl,
  getSubcategoryUrl,
  getCategoryUrl,
} from '@/lib/tool-registry';
import { buildCollectionPageJsonLd, buildBreadcrumbJsonLd } from '@/lib/seo';
import { DEFAULT_LOCALE, getLocalizedPath, type Locale } from '@/lib/i18n';
import {
  t,
  getCategorySeoTranslation,
  getSubcategorySeoTranslation,
  getToolSeoTranslation,
} from '@/lib/translations';

interface CategoryViewProps {
  categorySlug: string;
  locale?: Locale;
}

export async function CategoryView({ categorySlug, locale = DEFAULT_LOCALE }: CategoryViewProps) {
  const category = getCategoryBySlug(categorySlug);
  if (!category) {
    notFound();
  }

  const catSeo = await getCategorySeoTranslation(locale, category.slug);
  const catDisplayName = catSeo?.name || category.name;
  const catDisplayDescription = catSeo?.description || category.description;

  const subcategories = getSubcategoriesByCategory(category.slug);
  const categoryTools = getToolsByCategory(category.slug);

  const localizedSubcategories = await Promise.all(
    subcategories.map(async (sub) => {
      const seo = await getSubcategorySeoTranslation(locale, sub.slug);
      return {
        ...sub,
        displayName: seo?.name || sub.name,
        displayDescription: seo?.description || sub.description,
      };
    })
  );

  const localizedCategoryTools = await Promise.all(
    categoryTools.map(async (tool) => {
      const seo = await getToolSeoTranslation(locale, tool.slug);
      let subName = tool.subcategory;
      if (tool.subcategory) {
        const subSeo = await getSubcategorySeoTranslation(locale, tool.subcategory);
        if (subSeo?.name) subName = subSeo.name;
      }
      return {
        ...tool,
        displayName: seo?.name || tool.name,
        displayShortDescription: seo?.shortDescription || tool.shortDescription,
        displaySubcategory: subName || t(locale, 'tools.tool'),
      };
    })
  );

  const breadcrumbs = [
    { label: t(locale, 'breadcrumbs.home'), href: getLocalizedPath(locale, '/') },
    { label: t(locale, 'breadcrumbs.tools'), href: getLocalizedPath(locale, '/tools') },
    { label: catDisplayName, href: getLocalizedPath(locale, getCategoryUrl(category)) },
  ];

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: t(locale, 'breadcrumbs.home'), url: getLocalizedPath(locale, '/') },
    { name: t(locale, 'breadcrumbs.tools'), url: getLocalizedPath(locale, '/tools') },
    { name: catDisplayName, url: getLocalizedPath(locale, getCategoryUrl(category)) },
  ]);

  const collectionJsonLd = buildCollectionPageJsonLd(
    catDisplayName,
    catDisplayDescription,
    getLocalizedPath(locale, getCategoryUrl(category)),
    localizedCategoryTools.map((tool) => ({
      name: tool.displayName,
      url: getLocalizedPath(locale, getToolUrl(tool)),
    }))
  );

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={collectionJsonLd} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-6">
          <Breadcrumbs items={breadcrumbs} />
        </div>

        {/* Category Header */}
        <header className="mb-12 max-w-3xl">
          <div
            className="mb-3 inline-flex items-center gap-2 rounded-[10px] px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-white"
            style={{ background: `var(--color-${category.color})` }}
          >
            <Layers size={14} />
            <span>{t(locale, 'tools.toolsAvailable', { count: categoryTools.length })}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4" style={{ color: 'var(--ink)' }}>
            {catDisplayName}
          </h1>
          <p className="text-base sm:text-lg leading-relaxed font-semibold" style={{ color: 'var(--ink-soft)' }}>
            {catDisplayDescription}
          </p>
        </header>

        {/* Subcategories if present */}
        {localizedSubcategories.length > 0 && (
          <section className="mb-14">
            <h2 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--ink)' }}>
              <Folder size={22} style={{ color: `var(--color-${category.color})` }} />
              <span>{t(locale, 'tools.browseBySubcategory')}</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {localizedSubcategories.map((sub) => {
                const subToolsCount = categoryTools.filter((t) => t.subcategory === sub.slug).length;
                return (
                  <Link
                    key={sub.slug}
                    href={getLocalizedPath(locale, getSubcategoryUrl(sub))}
                    className="group relative overflow-hidden p-5 rounded-[16px] border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 no-underline block"
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
                      <div className="flex items-center justify-between mb-2">
                        <h3
                          className="text-base font-semibold group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors"
                          style={{ color: 'var(--ink)' }}
                        >
                          {sub.displayName}
                        </h3>
                        <ArrowRight size={14} className="text-stone-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <p className="text-xs line-clamp-2 mb-3" style={{ color: 'var(--ink-soft)' }}>
                        {sub.displayDescription}
                      </p>
                      <span className="text-[11px] font-semibold text-stone-400">
                        {t(locale, 'tools.totalTools', { count: subToolsCount })}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* All Tools in this Category */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--ink)' }}>
              {t(locale, 'tools.allToolsIn', { name: catDisplayName })}
            </h2>
            <span className="text-xs text-stone-500 font-medium">
              {t(locale, 'tools.totalTools', { count: categoryTools.length })}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {localizedCategoryTools.map((tool) => (
              <Link
                key={tool.slug}
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
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-[6px]"
                      style={{
                        background: `var(--color-${category.color}-soft)`,
                        color: `var(--color-${category.color})`,
                      }}
                    >
                      {tool.displaySubcategory}
                    </span>
                    <ArrowRight
                      size={14}
                      className="text-stone-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 group-hover:translate-x-1 transition-all"
                    />
                  </div>
                  <h3
                    className="text-base font-semibold mb-1.5 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors"
                    style={{ color: 'var(--ink)' }}
                  >
                    {tool.displayName}
                  </h3>
                  <p className="text-xs line-clamp-2 leading-relaxed font-medium" style={{ color: 'var(--ink-soft)' }}>
                    {tool.displayShortDescription}
                  </p>
                </div>

                <div className="relative z-10 mt-4 pt-3 border-t flex items-center gap-1.5 text-[11px] font-semibold" style={{ borderColor: 'var(--border)', color: 'var(--ink-soft)' }}>
                  <Sparkles size={12} className="text-emerald-600 dark:text-emerald-400" />
                  <span>{t(locale, 'tools.instantAccess')}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Category Educational & Security Guide */}
        <section className="mt-16 sm:mt-24 rounded-[20px] border p-6 sm:p-10 space-y-8" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-[10px] px-3.5 py-1 text-xs font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
              <ShieldCheck size={14} />
              <span>In-Browser Client Execution Guarantee</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--ink)' }}>
              About the {catDisplayName} Collection
            </h2>
            <p className="text-sm leading-relaxed font-medium" style={{ color: 'var(--ink-soft)' }}>
              The {catDisplayName} collection at Alee Tools provides {categoryTools.length} dedicated single-purpose utilities built to solve specific challenges quickly and accurately. Whether you need to compress media, parse complex formats, or generate assets for production, every operation executes 100% locally in your web browser.
            </p>
            <p className="text-sm leading-relaxed font-medium" style={{ color: 'var(--ink-soft)' }}>
              Unlike competitor tools that send your proprietary files to remote cloud servers, our architecture relies on client-side WebAssembly, HTML5 Canvas, and modern browser standards. Zero files are uploaded, zero data is stored, and your work remains completely confidential.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="p-4 rounded-[14px] border space-y-2 bg-stone-50/50 dark:bg-stone-900/30" style={{ borderColor: 'var(--border)' }}>
              <div className="p-2 rounded-[8px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 w-fit">
                <Lock size={16} />
              </div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--ink)' }}>Private & Secure</h3>
              <p className="text-xs leading-relaxed font-medium" style={{ color: 'var(--ink-soft)' }}>
                Your data stays in your browser memory. Ideal for confidential documents, sensitive code, and private media.
              </p>
            </div>

            <div className="p-4 rounded-[14px] border space-y-2 bg-stone-50/50 dark:bg-stone-900/30" style={{ borderColor: 'var(--border)' }}>
              <div className="p-2 rounded-[8px] bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 w-fit">
                <Zap size={16} />
              </div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--ink)' }}>Hardware Accelerated</h3>
              <p className="text-xs leading-relaxed font-medium" style={{ color: 'var(--ink-soft)' }}>
                Calculated on your local device for instant results without network upload or download bottlenecks.
              </p>
            </div>

            <div className="p-4 rounded-[14px] border space-y-2 bg-stone-50/50 dark:bg-stone-900/30" style={{ borderColor: 'var(--border)' }}>
              <div className="p-2 rounded-[8px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 w-fit">
                <CheckCircle2 size={16} />
              </div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--ink)' }}>Free Forever</h3>
              <p className="text-xs leading-relaxed font-medium" style={{ color: 'var(--ink-soft)' }}>
                No hidden subscriptions, no credit card requirements, no account creation, and zero watermarks.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
