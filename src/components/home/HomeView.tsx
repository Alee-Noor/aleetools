import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Lock,
  Zap,
  CheckCircle,
  FileText,
  Image as ImageIcon,
  Code,
  QrCode,
  Layers,
  Wrench,
} from 'lucide-react';
import { SearchInput } from '@/components/ui/SearchInput';
import { ClayCard } from '@/components/ui/ClayCard';
import { Chip } from '@/components/ui/Chip';
import { JsonLd } from '@/components/seo/JsonLd';
import { Hero3DWrapper } from '@/components/home/Hero3DWrapper';
import { LocaleRedirect } from '@/components/layout/LocaleRedirect';
import {
  categories,
  getPopularTools,
  getToolCount,
  getCategoryUrl,
  getToolUrl,
  getToolsByCategory,
  getSubcategoriesByCategory,
  getSubcategoryUrl,
} from '@/lib/tool-registry';
import { buildWebsiteJsonLd } from '@/lib/seo';
import { type Locale, DEFAULT_LOCALE, getLocalizedPath } from '@/lib/i18n';
import { t, getCategorySeoTranslation, getToolSeoTranslation } from '@/lib/translations';

const categoryIconMap: Record<string, typeof ImageIcon> = {
  'image-social-media-hub': ImageIcon,
  'pdf-toolkit': FileText,
  'developer-tools': Code,
  'image-converter-toolkit': Layers,
  'qr-barcode-tools': QrCode,
};

export async function HomeView({ locale = DEFAULT_LOCALE }: { locale?: Locale }) {
  const popularTools = getPopularTools();
  const websiteJsonLd = buildWebsiteJsonLd();

  // Pre-load category translations if not English
  const localizedCategories = await Promise.all(
    categories.map(async (cat) => {
      const seo = await getCategorySeoTranslation(locale, cat.slug);
      return {
        ...cat,
        displayName: seo?.name || cat.name,
        displayDescription: seo?.description || cat.description,
      };
    })
  );

  // Pre-load popular tool translations
  const localizedPopularTools = await Promise.all(
    popularTools.map(async (tool) => {
      const seo = await getToolSeoTranslation(locale, tool.slug);
      return {
        ...tool,
        displayName: seo?.name || tool.name,
      };
    })
  );

  return (
    <>
      {locale === DEFAULT_LOCALE && <LocaleRedirect />}
      <JsonLd data={websiteJsonLd} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-20 sm:space-y-28">
        {/* ─── 1. HERO SECTION ─── */}
        <section
          className="relative overflow-hidden rounded-[28px] border p-6 sm:p-10 lg:p-14 shadow-2xl transition-all duration-500 hover:shadow-[0_25px_70px_rgba(44,110,89,0.25)] dark:hover:shadow-[0_25px_70px_rgba(44,110,89,0.4)]"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          {/* Custom Outer Glowing Pattern Backdrop */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -left-20 h-[400px] w-[400px] rounded-full bg-emerald-500/25 blur-3xl animate-pulse-slow" />
            <div
              className="absolute top-1/3 -right-20 h-[420px] w-[420px] rounded-full bg-amber-500/20 blur-3xl animate-pulse-slow"
              style={{ animationDelay: '3s' }}
            />
            <div
              className="absolute -bottom-20 left-1/3 h-[380px] w-[380px] rounded-full bg-indigo-500/20 blur-3xl animate-pulse-slow"
              style={{ animationDelay: '1.5s' }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(#2C6E59_1.2px,transparent_1.2px)] dark:bg-[radial-gradient(#3DD6A0_1.2px,transparent_1.2px)] [background-size:28px_28px] opacity-35 dark:opacity-50" />
            <div className="absolute top-1/4 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/80 to-transparent animate-line-beam-1" />
            <div className="absolute top-3/4 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/80 to-transparent animate-line-beam-2" />
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-6 items-center">
            {/* Left Column: Copy & Search */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div
                className="inline-flex items-center gap-2 rounded-[10px] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider shadow-sm"
                style={{
                  background: 'var(--color-accent-primary-soft)',
                  color: 'var(--color-accent-primary)',
                }}
              >
                <Sparkles size={14} />
                <span>{t(locale, 'home.badge')}</span>
              </div>

              <h1
                className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]"
                style={{ color: 'var(--ink)' }}
              >
                {t(locale, 'home.heroTitle')}
              </h1>

              <p className="text-base sm:text-lg max-w-2xl leading-relaxed font-semibold" style={{ color: 'var(--ink-soft)' }}>
                {t(locale, 'home.heroSubtitle')}
              </p>

              {/* Search Bar */}
              <div className="max-w-xl pt-2">
                <SearchInput placeholder={t(locale, 'home.searchPlaceholder')} />
              </div>

              {/* Category Quick CTA Chips */}
              <div className="pt-2 space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--ink-soft)' }}>
                  {t(locale, 'home.exploreByCategory')}
                </span>
                <div className="flex flex-wrap gap-2">
                  {localizedCategories.map((cat) => (
                    <Chip
                      key={cat.slug}
                      href={getLocalizedPath(locale, getCategoryUrl(cat))}
                      accentColor={`var(--color-${cat.color})`}
                    >
                      {cat.displayName.split(' ')[0]}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: 3D Interactive Scene Container */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="absolute -inset-2.5 rounded-[28px] bg-gradient-to-tr from-emerald-500/40 via-amber-500/30 to-purple-500/40 blur-xl opacity-90 dark:opacity-95 animate-pulse-slow" />

              <div
                className="w-full max-w-[400px] h-[340px] sm:h-[420px] rounded-[22px] overflow-hidden relative border shadow-2xl bg-stone-950/10 dark:bg-stone-950/70 backdrop-blur-md"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(44,110,89,0.3)_0%,transparent_75%)] dark:bg-[radial-gradient(circle_at_center,rgba(61,214,160,0.35)_0%,transparent_75%)]" />
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,rgba(44,110,89,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(44,110,89,0.18)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:20px_20px]" />

                <Hero3DWrapper />
                <div className="absolute bottom-3 left-0 right-0 text-center pointer-events-none z-20">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-950/85 text-white dark:bg-stone-900/90 backdrop-blur-md text-[11px] font-mono font-medium shadow-md border border-white/15">
                    <Sparkles className="h-3 w-3 text-emerald-400 animate-pulse" />
                    Interactive 3D Soft Workshop
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 2. POPULAR TOOLS STRIP ─── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--ink)' }}>
              <Sparkles size={20} className="text-amber-500" />
              <span>{t(locale, 'home.popularTools')}</span>
            </h2>
            <Link
              href={getLocalizedPath(locale, '/tools')}
              className="text-xs sm:text-sm font-semibold hover:underline flex items-center gap-1"
              style={{ color: 'var(--color-accent-primary)' }}
            >
              <span>{t(locale, 'home.viewAllTools')}</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3">
            {localizedPopularTools.map((tool) => (
              <Link
                key={tool.slug}
                href={getLocalizedPath(locale, getToolUrl(tool))}
                className="clay-chip hover:-translate-y-0.5 no-underline py-2 px-3.5 text-xs sm:text-sm"
              >
                <Wrench size={13} className="text-emerald-700 dark:text-emerald-400" />
                <span className="font-semibold">{tool.displayName}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ─── 3. CATEGORY GRID ─── */}
        <section className="space-y-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--ink)' }}>
              {t(locale, 'home.fiveWorkbenches')}
            </h2>
            <p className="text-sm sm:text-base font-semibold" style={{ color: 'var(--ink-soft)' }}>
              {t(locale, 'home.workbenchSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {localizedCategories.map((cat) => {
              const IconComp = categoryIconMap[cat.slug] || Layers;
              const count = getToolCount(cat.slug);
              return (
                <Link
                  key={cat.slug}
                  href={getLocalizedPath(locale, getCategoryUrl(cat))}
                  className="group block no-underline"
                >
                  <ClayCard
                    interactive
                    className="h-full flex flex-col justify-between hover:shadow-xl transition-all duration-200 border border-black/5 dark:border-white/10"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-[12px] text-white shadow-sm"
                          style={{ background: `var(--color-${cat.color})` }}
                        >
                          <IconComp size={22} />
                        </div>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-[8px] bg-stone-200/80 dark:bg-stone-800 text-stone-900 dark:text-stone-100">
                          {t(locale, 'tools.toolsAvailable', { count })}
                        </span>
                      </div>

                      <h3
                        className="text-lg font-bold mb-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors"
                        style={{ color: 'var(--ink)' }}
                      >
                        {cat.displayName}
                      </h3>
                      <p className="text-xs sm:text-sm leading-relaxed font-medium" style={{ color: 'var(--ink-soft)' }}>
                        {cat.displayDescription}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t flex items-center justify-between text-xs font-bold" style={{ borderColor: 'var(--border)' }}>
                      <span style={{ color: `var(--color-${cat.color})` }}>
                        {t(locale, 'tools.openWorkbench')}
                      </span>
                      <ArrowRight size={14} className="text-stone-500 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </ClayCard>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ─── 3.5. COMPLETE CRAWLABLE TOOL DIRECTORY (DISCOVERY & INTERNAL LINKING ENGINE) ─── */}
        <section className="space-y-8" id="tools-directory">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="max-w-2xl">
              <div
                className="inline-flex items-center gap-2 rounded-[10px] px-3.5 py-1 text-xs font-bold uppercase tracking-wider mb-2"
                style={{
                  background: 'var(--color-accent-primary-soft)',
                  color: 'var(--color-accent-primary)',
                }}
              >
                <Layers size={13} />
                <span>Full Directory • 156 In-Browser Tools</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--ink)' }}>
                Complete Directory of All 156 Free Utility Tools
              </h2>
              <p className="text-xs sm:text-sm font-medium" style={{ color: 'var(--ink-soft)' }}>
                Zero paywalls, zero accounts, and zero file uploads. Every utility runs directly inside your browser memory for maximum privacy and speed.
              </p>
            </div>
            <Link
              href={getLocalizedPath(locale, '/tools')}
              className="text-xs sm:text-sm font-semibold flex items-center gap-1 hover:underline shrink-0"
              style={{ color: 'var(--color-accent-primary)' }}
            >
              <span>{t(locale, 'home.viewAllTools')} (156)</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="space-y-6">
            {categories.map((cat) => {
              const catTools = getToolsByCategory(cat.slug);
              const catSubs = getSubcategoriesByCategory(cat.slug);
              const flatTools = catTools.filter((t) => !t.subcategory);
              const IconComp = categoryIconMap[cat.slug] || Layers;

              return (
                <div
                  key={cat.slug}
                  className="rounded-[20px] border p-6 sm:p-8 space-y-6 shadow-sm transition-all"
                  style={{
                    background: 'var(--surface)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-[10px] text-white shadow-sm shrink-0"
                        style={{ background: `var(--color-${cat.color})` }}
                      >
                        <IconComp size={20} />
                      </div>
                      <div>
                        <Link
                          href={getLocalizedPath(locale, getCategoryUrl(cat))}
                          className="text-lg sm:text-xl font-bold hover:underline no-underline"
                          style={{ color: 'var(--ink)' }}
                        >
                          {cat.name}
                        </Link>
                        <p className="text-xs text-stone-500 font-medium">
                          {cat.description}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={getLocalizedPath(locale, getCategoryUrl(cat))}
                      className="text-xs font-bold hover:underline flex items-center gap-1"
                      style={{ color: `var(--color-${cat.color})` }}
                    >
                      <span>Explore Category</span>
                      <ArrowRight size={12} />
                    </Link>
                  </div>

                  {/* Subcategories grouping */}
                  {catSubs.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {catSubs.map((sub) => {
                        const subTools = catTools.filter((t) => t.subcategory === sub.slug);
                        return (
                          <div key={sub.slug} className="space-y-2.5">
                            <Link
                              href={getLocalizedPath(locale, getSubcategoryUrl(sub))}
                              className="text-xs font-bold uppercase tracking-wider block hover:underline no-underline"
                              style={{ color: `var(--color-${cat.color})` }}
                            >
                              {sub.name}
                            </Link>
                            <ul className="space-y-1.5 list-none p-0 m-0">
                              {subTools.map((tool) => (
                                <li key={tool.slug}>
                                  <Link
                                    href={getLocalizedPath(locale, getToolUrl(tool))}
                                    className="text-xs font-medium no-underline hover:underline flex items-center gap-1.5 group py-0.5"
                                    style={{ color: 'var(--ink)' }}
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-stone-300 dark:bg-stone-600 group-hover:bg-emerald-600 transition-colors shrink-0" />
                                    <span className="group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                                      {tool.name}
                                    </span>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Flat tools list (e.g. PDF Toolkit) */}
                  {flatTools.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {flatTools.map((tool) => (
                        <Link
                          key={tool.slug}
                          href={getLocalizedPath(locale, getToolUrl(tool))}
                          className="flex items-center gap-2 p-2.5 rounded-[10px] border border-black/5 dark:border-white/5 hover:border-emerald-500/40 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 no-underline transition-all group"
                          style={{ background: 'var(--bg)' }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                          <span className="text-xs font-medium group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-1" style={{ color: 'var(--ink)' }}>
                            {tool.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── 4. VALUE SECTION: WHY ALEE ─── */}
        <section className="space-y-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--ink)' }}>
              {t(locale, 'home.builtForSpeed')}
            </h2>
            <p className="text-sm sm:text-base font-semibold" style={{ color: 'var(--ink-soft)' }}>
              {t(locale, 'home.builtForSpeedSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-6 rounded-[16px] border space-y-3 shadow-sm" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                <Zap size={20} />
              </div>
              <h3 className="text-base font-bold" style={{ color: 'var(--ink)' }}>
                {t(locale, 'features.instantExecution')}
              </h3>
              <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed font-medium">
                {t(locale, 'features.instantExecutionDesc')}
              </p>
            </div>

            <div className="p-6 rounded-[16px] border space-y-3 shadow-sm" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400">
                <Lock size={20} />
              </div>
              <h3 className="text-base font-bold" style={{ color: 'var(--ink)' }}>
                {t(locale, 'features.noAccounts')}
              </h3>
              <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed font-medium">
                {t(locale, 'features.noAccountsDesc')}
              </p>
            </div>

            <div className="p-6 rounded-[16px] border space-y-3 shadow-sm" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400">
                <CheckCircle size={20} />
              </div>
              <h3 className="text-base font-bold" style={{ color: 'var(--ink)' }}>
                {t(locale, 'features.zeroWatermarks')}
              </h3>
              <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed font-medium">
                {t(locale, 'features.zeroWatermarksDesc')}
              </p>
            </div>

            <div className="p-6 rounded-[16px] border space-y-3 shadow-sm" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400">
                <Sparkles size={20} />
              </div>
              <h3 className="text-base font-bold" style={{ color: 'var(--ink)' }}>
                {t(locale, 'features.freeForever')}
              </h3>
              <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed font-medium">
                {t(locale, 'features.freeForeverDesc')}
              </p>
            </div>
          </div>
        </section>

        {/* ─── 5. HOW IT WORKS ─── */}
        <section className="p-8 sm:p-12 rounded-[20px] border shadow-sm" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--ink)' }}>
              {t(locale, 'home.threeSteps')}
            </h2>
            <p className="text-sm text-stone-800 dark:text-stone-300 font-semibold">
              {t(locale, 'home.threeStepsSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="flex flex-col items-center text-center space-y-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full text-base font-bold text-white shadow-sm"
                style={{ background: 'var(--color-accent-primary)' }}
              >
                1
              </div>
              <h3 className="text-base font-bold" style={{ color: 'var(--ink)' }}>
                {t(locale, 'home.step1Title')}
              </h3>
              <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-300 leading-relaxed max-w-xs font-semibold">
                {t(locale, 'home.step1Desc')}
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full text-base font-bold text-white shadow-sm"
                style={{ background: 'var(--color-accent-secondary)' }}
              >
                2
              </div>
              <h3 className="text-base font-bold" style={{ color: 'var(--ink)' }}>
                {t(locale, 'home.step2Title')}
              </h3>
              <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-300 leading-relaxed max-w-xs font-semibold">
                {t(locale, 'home.step2Desc')}
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full text-base font-bold text-white shadow-sm"
                style={{ background: 'var(--color-accent-quaternary)' }}
              >
                3
              </div>
              <h3 className="text-base font-bold" style={{ color: 'var(--ink)' }}>
                {t(locale, 'home.step3Title')}
              </h3>
              <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-300 leading-relaxed max-w-xs font-semibold">
                {t(locale, 'home.step3Desc')}
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
