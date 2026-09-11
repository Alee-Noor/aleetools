// lib/seo.ts — Centralized SEO metadata and JSON-LD builders
// Driven entirely by tool-registry.ts — never hand-write metadata per page.

import type { Metadata } from 'next';
import { type Tool, type Category, type Subcategory, getToolUrl, getCategoryUrl, getSubcategoryUrl } from './tool-registry';

const BASE_URL = 'https://alee.software';
const SITE_NAME = 'Alee Tools';

// ─── METADATA BUILDERS ─────────────────────────────────────────

export function buildToolMetadata(tool: Tool): Metadata {
  const url = `${BASE_URL}${getToolUrl(tool)}`;
  return {
    title: tool.title,
    description: tool.metaDescription,
    keywords: tool.keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: tool.title,
      description: tool.metaDescription,
      url,
      siteName: SITE_NAME,
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: tool.title,
      description: tool.metaDescription,
    },
  };
}

export function buildCategoryMetadata(category: Category): Metadata {
  const url = `${BASE_URL}${getCategoryUrl(category)}`;
  const title = `${category.name} – Free Online Tools | ${SITE_NAME}`;
  const description = category.description;
  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export function buildSubcategoryMetadata(subcategory: Subcategory, category: Category): Metadata {
  const url = `${BASE_URL}${getSubcategoryUrl(subcategory)}`;
  const title = `${subcategory.name} – Free Online | ${SITE_NAME}`;
  const description = subcategory.description;
  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

// ─── JSON-LD BUILDERS ───────────────────────────────────────────

export function buildToolJsonLd(tool: Tool) {
  const url = `${BASE_URL}${getToolUrl(tool)}`;
  
  const softwareApp = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.name,
    url,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any (runs in browser)',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description: tool.metaDescription,
  };

  const faqPage = tool.faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: tool.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  } : null;

  return { softwareApp, faqPage };
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
    description: 'Free, private, private, client-side tools for creators, students, and developers — nothing you upload ever leaves your device.',
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
