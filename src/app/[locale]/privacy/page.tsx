import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ShieldCheck, ServerOff } from 'lucide-react';
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

  const canonicalUrl = `https://alee.software${getLocalizedPath(loc, '/privacy')}`;
  const title = `${t(loc, 'common.privacy')} – Alee Tools`;
  const description = t(loc, 'home.heroSubtitle');

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: buildHreflangAlternates('/privacy'),
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

export default async function LocalizedPrivacyPage({ params }: Props) {
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
            { label: t(loc, 'common.privacy'), href: getLocalizedPath(loc, '/privacy') },
          ]}
        />
      </div>

      <header className="mb-10">
        <div
          className="mb-3 inline-flex items-center gap-2 rounded-[10px] px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300"
          style={{ background: 'var(--color-accent-primary-soft)' }}
        >
          <ShieldCheck size={14} />
          <span>{t(loc, 'features.instantExecution')}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4" style={{ color: 'var(--ink)' }}>
          {t(loc, 'common.privacy')}
        </h1>
        <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 leading-relaxed">
          {t(loc, 'home.heroSubtitle')}
        </p>
      </header>

      <div className="space-y-8 text-sm sm:text-base leading-relaxed text-stone-700 dark:text-stone-300">
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
              {t(loc, 'features.noAccounts')}
            </h2>
          </div>
          <p>
            {t(loc, 'features.noAccountsDesc')}
          </p>
        </div>

        <div
          className="p-6 sm:p-8 rounded-[18px] border space-y-4"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          <h2 className="text-xl font-bold" style={{ color: 'var(--ink)' }}>
            {t(loc, 'features.zeroWatermarks')}
          </h2>
          <p>
            {t(loc, 'features.zeroWatermarksDesc')}
          </p>
        </div>
      </div>
    </div>
  );
}
