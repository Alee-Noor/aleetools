import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ToolsDirectoryClient } from '@/app/tools/ToolsDirectoryClient';
import { tools, categories } from '@/lib/tool-registry';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildCollectionPageJsonLd, buildBreadcrumbJsonLd } from '@/lib/seo';
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
  const canonicalUrl = `https://alee.software${getLocalizedPath(loc, '/tools')}`;
  const title = `${t(loc, 'header.browseTools')} – ${t(loc, 'tools.totalTools', { count: tools.length })} | Alee Tools`;
  const description = t(loc, 'home.heroSubtitle');

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: buildHreflangAlternates('/tools'),
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Alee Tools',
      type: 'website',
      locale: OG_LOCALES[loc] || 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function LocalizedToolsDirectoryPage({ params }: Props) {
  const { locale } = await params;
  if (!isValidLocale(locale)) {
    notFound();
  }
  const loc = locale as Locale;

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: t(loc, 'breadcrumbs.home'), url: getLocalizedPath(loc, '/') },
    { name: t(loc, 'breadcrumbs.tools'), url: getLocalizedPath(loc, '/tools') },
  ]);

  const collectionJsonLd = buildCollectionPageJsonLd(
    t(loc, 'header.browseTools'),
    t(loc, 'home.heroSubtitle'),
    getLocalizedPath(loc, '/tools'),
    tools.map((item) => ({
      name: item.name,
      url: getLocalizedPath(loc, item.subcategory ? `/tools/${item.category}/${item.subcategory}/${item.slug}` : `/tools/${item.category}/${item.slug}`),
    }))
  );

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={collectionJsonLd} />
      <ToolsDirectoryClient categories={categories} tools={tools} locale={loc} />
    </>
  );
}
