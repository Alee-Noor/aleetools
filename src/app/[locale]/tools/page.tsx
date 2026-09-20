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
import { t, getCategorySeoTranslation, getToolSeoTranslation } from '@/lib/translations';

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

  const localizedCategories = await Promise.all(
    categories.map(async (cat) => {
      const seo = await getCategorySeoTranslation(loc, cat.slug);
      return {
        ...cat,
        displayName: seo?.name || cat.name,
      };
    })
  );

  const localizedTools = await Promise.all(
    tools.map(async (item) => {
      const seo = await getToolSeoTranslation(loc, item.slug);
      return {
        ...item,
        displayName: seo?.name || item.name,
        displayShortDescription: seo?.shortDescription || item.shortDescription,
      };
    })
  );

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: t(loc, 'breadcrumbs.home'), url: getLocalizedPath(loc, '/') },
    { name: t(loc, 'breadcrumbs.tools'), url: getLocalizedPath(loc, '/tools') },
  ]);

  const collectionJsonLd = buildCollectionPageJsonLd(
    t(loc, 'header.browseTools'),
    t(loc, 'home.heroSubtitle'),
    getLocalizedPath(loc, '/tools'),
    localizedTools.map((item) => ({
      name: item.displayName,
      url: getLocalizedPath(loc, item.subcategory ? `/tools/${item.category}/${item.subcategory}/${item.slug}` : `/tools/${item.category}/${item.slug}`),
    }))
  );

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={collectionJsonLd} />
      <ToolsDirectoryClient categories={localizedCategories} tools={localizedTools} locale={loc} />
    </>
  );
}
