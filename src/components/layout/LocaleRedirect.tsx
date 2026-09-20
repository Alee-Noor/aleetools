'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { type Locale, isValidLocale } from '@/lib/i18n';

export function LocaleRedirect() {
  const router = useRouter();

  useEffect(() => {
    try {
      // 1. If already checked in this session, don't auto-redirect again
      if (sessionStorage.getItem('alee_locale_checked')) {
        return;
      }
      sessionStorage.setItem('alee_locale_checked', '1');

      // 2. Check explicitly stored user preference
      const stored = localStorage.getItem('alee_user_locale');
      if (stored && isValidLocale(stored) && stored !== 'en') {
        router.replace(`/${stored}`);
        return;
      }

      // 3. If stored is explicitly 'en', don't redirect
      if (stored === 'en') {
        return;
      }

      // 4. Inspect browser languages
      const languages = navigator.languages?.length ? navigator.languages : [navigator.language || ''];
      for (const lang of languages) {
        const lower = lang.toLowerCase();
        if (lower.startsWith('fr')) {
          router.replace('/fr');
          return;
        }
        if (lower.startsWith('es')) {
          router.replace('/es');
          return;
        }
        if (lower.startsWith('de')) {
          router.replace('/de');
          return;
        }
        if (lower.startsWith('pt')) {
          router.replace('/pt-BR');
          return;
        }
        if (lower.startsWith('ar')) {
          router.replace('/ar');
          return;
        }
      }
    } catch {
      // Ignore browser restrictions
    }
  }, [router]);

  return null;
}
