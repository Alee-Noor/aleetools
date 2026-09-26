// lib/seo.ts — Centralized SEO metadata and JSON-LD builders
// Driven entirely by tool-registry.ts & i18n translations — never hand-write metadata per page.

import type { Metadata } from 'next';
import { type Tool, type Category, type Subcategory, getToolUrl, getCategoryUrl, getSubcategoryUrl } from './tool-registry';
import {
  type Locale,
  DEFAULT_LOCALE,
  OG_LOCALES,
  getLocalizedPath,
  buildHreflangAlternates,
} from './i18n';
import {
  getToolSeoTranslation,
  getCategorySeoTranslation,
  getSubcategorySeoTranslation,
  t,
} from './translations';

const BASE_URL = 'https://alee.software';
const SITE_NAME = 'Alee Tools';

function formatTitle(title: string): { absolute: string } {
  const clean = title.trim();
  const withSite = clean.includes(SITE_NAME) || clean.includes('|') ? clean : `${clean} | ${SITE_NAME}`;
  return { absolute: withSite };
}

// ─── METADATA BUILDERS ─────────────────────────────────────────

export async function buildHomeMetadata(locale: Locale = DEFAULT_LOCALE): Promise<Metadata> {
  const canonicalUrl = `${BASE_URL}${getLocalizedPath(locale, '')}`;
  const titleString = locale === 'en'
    ? 'Alee Tools – 156 Free, Private Utility Tools'
    : `${t(locale, 'common.appName')} – ${t(locale, 'home.badge')} | ${SITE_NAME}`;
  const description = t(locale, 'home.heroSubtitle');

  return {
    title: formatTitle(titleString),
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: buildHreflangAlternates(''),
    },
    openGraph: {
      title: titleString,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      type: 'website',
      locale: OG_LOCALES[locale] || 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: titleString,
      description,
    },
  };
}

export async function buildToolMetadata(tool: Tool, locale: Locale = DEFAULT_LOCALE): Promise<Metadata> {
  const toolPath = getToolUrl(tool);
  const canonicalUrl = `${BASE_URL}${getLocalizedPath(locale, toolPath)}`;
  const seo = await getToolSeoTranslation(locale, tool.slug);

  const titleString = seo?.title || tool.title;
  const description = seo?.metaDescription || tool.metaDescription;
  const keywords = seo?.keywords || tool.keywords;

  return {
    title: formatTitle(titleString),
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
      languages: buildHreflangAlternates(toolPath),
    },
    openGraph: {
      title: titleString,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      type: 'website',
      locale: OG_LOCALES[locale] || 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: titleString,
      description,
    },
  };
}

export async function buildCategoryMetadata(category: Category, locale: Locale = DEFAULT_LOCALE): Promise<Metadata> {
  const catPath = getCategoryUrl(category);
  const canonicalUrl = `${BASE_URL}${getLocalizedPath(locale, catPath)}`;
  const seo = await getCategorySeoTranslation(locale, category.slug);

  const titleString = seo?.title || `${category.name} – Free Online Tools | ${SITE_NAME}`;
  const description = seo?.metaDescription || category.description;

  return {
    title: formatTitle(titleString),
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: buildHreflangAlternates(catPath),
    },
    openGraph: {
      title: titleString,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      type: 'website',
      locale: OG_LOCALES[locale] || 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: titleString,
      description,
    },
  };
}

export async function buildSubcategoryMetadata(
  subcategory: Subcategory,
  category: Category,
  locale: Locale = DEFAULT_LOCALE
): Promise<Metadata> {
  const subPath = getSubcategoryUrl(subcategory);
  const canonicalUrl = `${BASE_URL}${getLocalizedPath(locale, subPath)}`;
  const seo = await getSubcategorySeoTranslation(locale, subcategory.slug);

  const titleString = seo?.name ? `${seo.name} – Free Online | ${SITE_NAME}` : `${subcategory.name} – Free Online | ${SITE_NAME}`;
  const description = seo?.description || subcategory.description;

  return {
    title: formatTitle(titleString),
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: buildHreflangAlternates(subPath),
    },
    openGraph: {
      title: titleString,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      type: 'website',
      locale: OG_LOCALES[locale] || 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: titleString,
      description,
    },
  };
}

// ─── JSON-LD BUILDERS ───────────────────────────────────────────

export async function buildToolJsonLd(tool: Tool, locale: Locale = DEFAULT_LOCALE, steps?: string[]) {
  const toolPath = getToolUrl(tool);
  const url = `${BASE_URL}${getLocalizedPath(locale, toolPath)}`;
  const seo = await getToolSeoTranslation(locale, tool.slug);

  const name = seo?.name || tool.name;
  const description = seo?.metaDescription || tool.metaDescription;
  const faqs = (seo?.faqs && seo.faqs.length > 0) ? seo.faqs : tool.faqs;

  const softwareApp = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    url,
    applicationCategory: 'UtilitiesApplication',
    inLanguage: locale,
    operatingSystem: 'Any (runs in modern browser)',
    browserRequirements: 'Requires JavaScript. Supported in Chrome, Safari, Firefox, Edge, and mobile browsers.',
    softwareVersion: '2.0',
    featureList: '100% Client-Side Processing, Zero File Uploads, Instant Execution, Free Forever',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description,
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: BASE_URL,
    },
  };

  const faqPage = faqs && faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  } : null;

  const howToSchema = steps && steps.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to use ${name}`,
    description: `Step-by-step instructions to use ${name} securely in your browser.`,
    step: steps.map((step, idx) => ({
      '@type': 'HowToStep',
      position: idx + 1,
      text: step,
    })),
  } : null;

  return { softwareApp, faqPage, howToSchema };
}

export function buildBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${BASE_URL}${item.url}`,
    })),
  };
}

export function buildWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: BASE_URL,
    description: 'Free, private, client-side tools for creators, students, and developers — nothing you upload ever leaves your device.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/tools?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function buildCollectionPageJsonLd(name: string, description: string, url: string, items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url: `${BASE_URL}${url}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        url: `${BASE_URL}${item.url}`,
      })),
    },
  };
}
