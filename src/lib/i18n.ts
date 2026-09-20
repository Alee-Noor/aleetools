// src/lib/i18n.ts — Internationalization configuration & utilities
// Supports: English (default), French, Spanish, German, Brazilian Portuguese, Arabic

export const LOCALES = ['en', 'fr', 'es', 'de', 'pt-BR', 'ar'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';
export const NON_DEFAULT_LOCALES = LOCALES.filter((l) => l !== DEFAULT_LOCALE) as Locale[];

export const RTL_LOCALES: Locale[] = ['ar'];

// Native language names for the language switcher
export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
  es: 'Español',
  de: 'Deutsch',
  'pt-BR': 'Português',
  ar: 'العربية',
};

// OpenGraph locale codes
export const OG_LOCALES: Record<Locale, string> = {
  en: 'en_US',
  fr: 'fr_FR',
  es: 'es_ES',
  de: 'de_DE',
  'pt-BR': 'pt_BR',
  ar: 'ar_SA',
};

// hreflang mapping — includes regional variants pointing to same content
export const HREFLANG_MAP: Record<string, Locale> = {
  en: 'en',
  fr: 'fr',
  'fr-FR': 'fr',
  'fr-CA': 'fr',
  'fr-BE': 'fr',
  'fr-CH': 'fr', // Swiss French → French
  es: 'es',
  'es-ES': 'es',
  'es-MX': 'es',
  'es-AR': 'es',
  de: 'de',
  'de-DE': 'de',
  'de-AT': 'de',
  'de-CH': 'de', // Swiss German → German
  'pt-BR': 'pt-BR',
  pt: 'pt-BR', // Portuguese → Brazilian Portuguese
  'pt-PT': 'pt-BR',
  ar: 'ar',
  'x-default': 'en',
};

// ─── Path Utilities ──────────────────────────────────────────────

/** Returns the locale prefix for URLs. English has no prefix. */
export function getLocalePrefix(locale: Locale): string {
  return locale === DEFAULT_LOCALE ? '' : `/${locale}`;
}

/** Returns the full localized path. English paths have no prefix. */
export function getLocalizedPath(locale: Locale, path: string): string {
  const prefix = getLocalePrefix(locale);
  return `${prefix}${path}`;
}

/** Returns text direction for the locale */
export function getDirection(locale: Locale): 'ltr' | 'rtl' {
  return RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr';
}

/** Returns the HTML lang attribute value */
export function getHtmlLang(locale: Locale): string {
  // pt-BR stays as pt-BR for proper HTML lang attribute
  return locale;
}

/** Check if a string is a valid locale */
export function isValidLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value as Locale);
}

/** Extracts the locale from a pathname, returning DEFAULT_LOCALE ('en') if none matches */
export function getLocaleFromPathname(pathname: string): Locale {
  if (!pathname) return DEFAULT_LOCALE;
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length > 0 && isValidLocale(segments[0])) {
    return segments[0];
  }
  return DEFAULT_LOCALE;
}

/** Generate hreflang alternate links for a given path */
export function buildHreflangAlternates(path: string): Record<string, string> {
  const BASE_URL = 'https://alee.software';
  const alternates: Record<string, string> = {};

  for (const locale of LOCALES) {
    const localizedPath = getLocalizedPath(locale, path);
    alternates[locale] = `${BASE_URL}${localizedPath}`;
  }

  // Add regional variants
  alternates['fr-CH'] = alternates['fr'];
  alternates['de-CH'] = alternates['de'];
  alternates['fr-CA'] = alternates['fr'];
  alternates['es-MX'] = alternates['es'];
  alternates['es-AR'] = alternates['es'];
  alternates['pt-PT'] = alternates['pt-BR'];
  alternates['x-default'] = alternates['en'];

  return alternates;
}
