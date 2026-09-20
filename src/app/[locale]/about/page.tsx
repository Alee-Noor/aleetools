import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Wrench, Shield, Zap, Sparkles } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import {
  NON_DEFAULT_LOCALES,
  isValidLocale,
  getLocalizedPath,
  buildHreflangAlternates,
  OG_LOCALES,
  type Locale,
} from '@/lib/i18n';
import { t } from '@/lib/translations';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateStaticParams() {
  return NON_DEFAULT_LOCALES.map((locale) => ({
    locale,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};
  const loc = locale as Locale;

  const canonicalUrl = `https://alee.software${getLocalizedPath(loc, '/about')}`;
  const title = `${t(loc, 'header.about')} – Alee Tools`;
  const description = t(loc, 'home.heroSubtitle');

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: buildHreflangAlternates('/about'),
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Alee Tools',
      type: 'website',
      locale: OG_LOCALES[loc] || 'en_US',
    },
  };
}

export default async function LocalizedAboutPage({ params }: Props) {
  const { locale } = await params;
  if (!isValidLocale(locale)) {
    notFound();
  }
  const loc = locale as Locale;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6">
        <Breadcrumbs
          items={[
            { label: t(loc, 'breadcrumbs.home'), href: getLocalizedPath(loc, '/') },
            { label: t(loc, 'header.about'), href: getLocalizedPath(loc, '/about') },
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
          <span>{t(loc, 'header.about')} • Alee Tools</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4" style={{ color: 'var(--ink)' }}>
          {t(loc, 'home.badge')}
        </h1>
        <p className="text-base sm:text-lg text-stone-700 dark:text-stone-300 leading-relaxed font-medium">
          {t(loc, 'home.heroSubtitle')}
        </p>
      </header>

      <div className="space-y-8 text-sm sm:text-base leading-relaxed text-stone-700 dark:text-stone-300">
        <div className="p-6 sm:p-8 rounded-[18px] border space-y-4 shadow-sm" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h2 className="text-xl font-bold" style={{ color: 'var(--ink)' }}>
            {t(loc, 'home.builtForSpeed')}
          </h2>
          <p>
            {t(loc, 'home.builtForSpeedSubtitle')}
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-[18px] border space-y-4 shadow-sm" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h2 className="text-xl font-bold" style={{ color: 'var(--ink)' }}>
            {t(loc, 'features.freeForever')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-bold" style={{ color: 'var(--ink)' }}>
                <Zap size={18} className="text-emerald-600" />
                <span>{t(loc, 'features.instantExecution')}</span>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
                {t(loc, 'features.instantExecutionDesc')}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-bold" style={{ color: 'var(--ink)' }}>
                <Shield size={18} className="text-emerald-600" />
                <span>{t(loc, 'features.noAccounts')}</span>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
                {t(loc, 'features.noAccountsDesc')}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-bold" style={{ color: 'var(--ink)' }}>
                <Sparkles size={18} className="text-emerald-600" />
                <span>{t(loc, 'features.zeroWatermarks')}</span>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
                {t(loc, 'features.zeroWatermarksDesc')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
