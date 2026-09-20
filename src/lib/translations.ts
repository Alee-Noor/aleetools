// src/lib/translations.ts — Translation loader & accessor utilities
// Loads UI chrome translations and SEO metadata translations per locale.

import type { Locale } from './i18n';
import { DEFAULT_LOCALE } from './i18n';

// ─── Types ──────────────────────────────────────────────────────

export type TranslationDict = Record<string, Record<string, string>>;

export type ToolSeoTranslation = {
  name: string;
  h1: string;
  title: string;
  metaDescription: string;
  shortDescription: string;
  keywords: string[];
  faqs: { q: string; a: string }[];
};

export type CategorySeoTranslation = {
  name: string;
  description: string;
  title: string;
  metaDescription: string;
};

export type SubcategorySeoTranslation = {
  name: string;
  description: string;
};

export type SeoTranslations = {
  categories: Record<string, CategorySeoTranslation>;
  subcategories: Record<string, SubcategorySeoTranslation>;
  tools: Record<string, ToolSeoTranslation>;
};

// ─── Static Imports (tree-shaken at build time) ─────────────────

import enUI from '@/messages/en.json';
import frUI from '@/messages/fr.json';
import esUI from '@/messages/es.json';
import deUI from '@/messages/de.json';
import ptBRUI from '@/messages/pt-BR.json';
import arUI from '@/messages/ar.json';

const uiTranslations: Record<Locale, TranslationDict> = {
  en: enUI as TranslationDict,
  fr: frUI as TranslationDict,
  es: esUI as TranslationDict,
  de: deUI as TranslationDict,
  'pt-BR': ptBRUI as TranslationDict,
  ar: arUI as TranslationDict,
};

// SEO translations — lazy loaded per locale
let seoCache: Partial<Record<Locale, SeoTranslations>> = {};

async function loadSeoTranslations(locale: Locale): Promise<SeoTranslations | null> {
  if (locale === DEFAULT_LOCALE) return null; // English uses tool-registry.ts directly
  if (seoCache[locale]) return seoCache[locale]!;

  try {
    let data: SeoTranslations;
    switch (locale) {
      case 'fr': data = (await import('@/messages/seo/fr.json')).default as SeoTranslations; break;
      case 'es': data = (await import('@/messages/seo/es.json')).default as SeoTranslations; break;
      case 'de': data = (await import('@/messages/seo/de.json')).default as SeoTranslations; break;
      case 'pt-BR': data = (await import('@/messages/seo/pt-BR.json')).default as SeoTranslations; break;
      case 'ar': data = (await import('@/messages/seo/ar.json')).default as SeoTranslations; break;
      default: return null;
    }
    seoCache[locale] = data;
    return data;
  } catch {
    return null;
  }
}

// ─── Public API ─────────────────────────────────────────────────

/** Get UI chrome translations for a locale */
export function getUITranslations(locale: Locale): TranslationDict {
  return uiTranslations[locale] || uiTranslations[DEFAULT_LOCALE];
}

/** Get a specific UI translation string. Supports nested keys like "header.browseTools" */
export function t(locale: Locale, key: string, replacements?: Record<string, string | number>): string {
  const dict = getUITranslations(locale);
  const parts = key.split('.');
  let value: string | undefined;

  if (parts.length === 2) {
    value = dict[parts[0]]?.[parts[1]];
  }

  // Fallback to English
  if (!value) {
    const enDict = uiTranslations[DEFAULT_LOCALE];
    if (parts.length === 2) {
      value = enDict[parts[0]]?.[parts[1]];
    }
  }

  if (!value) return key;

  // Replace {placeholders}
  if (replacements) {
    for (const [k, v] of Object.entries(replacements)) {
      value = value.replace(`{${k}}`, String(v));
    }
  }

  return value;
}

/** Get SEO translations for a tool by slug. Returns null if using default English. */
export async function getToolSeoTranslation(locale: Locale, toolSlug: string): Promise<ToolSeoTranslation | null> {
  if (locale === DEFAULT_LOCALE) return null;
  const seo = await loadSeoTranslations(locale);
  return seo?.tools?.[toolSlug] || null;
}

/** Get SEO translations for a category by slug */
export async function getCategorySeoTranslation(locale: Locale, categorySlug: string): Promise<CategorySeoTranslation | null> {
  if (locale === DEFAULT_LOCALE) return null;
  const seo = await loadSeoTranslations(locale);
  return seo?.categories?.[categorySlug] || null;
}

/** Get SEO translations for a subcategory by slug */
export async function getSubcategorySeoTranslation(locale: Locale, subcategorySlug: string): Promise<SubcategorySeoTranslation | null> {
  if (locale === DEFAULT_LOCALE) return null;
  const seo = await loadSeoTranslations(locale);
  return seo?.subcategories?.[subcategorySlug] || null;
}

/** Get all SEO translations for a locale (for batch use in sitemap, etc.) */
export async function getAllSeoTranslations(locale: Locale): Promise<SeoTranslations | null> {
  return loadSeoTranslations(locale);
}
