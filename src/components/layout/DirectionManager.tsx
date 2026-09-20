'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { DEFAULT_LOCALE, isValidLocale, getDirection, getHtmlLang, type Locale } from '@/lib/i18n';

export function DirectionManager() {
  const pathname = usePathname();

  useEffect(() => {
    const segments = pathname.split('/').filter(Boolean);
    const locale: Locale = segments.length > 0 && isValidLocale(segments[0])
      ? (segments[0] as Locale)
      : DEFAULT_LOCALE;

    const dir = getDirection(locale);
    const lang = getHtmlLang(locale);

    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', lang);
  }, [pathname]);

  return null;
}
