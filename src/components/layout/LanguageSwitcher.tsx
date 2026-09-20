'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Globe, Check, ChevronDown } from 'lucide-react';
import {
  LOCALES,
  LOCALE_LABELS,
  DEFAULT_LOCALE,
  type Locale,
  isValidLocale,
  getLocalizedPath,
} from '@/lib/i18n';

export function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Determine current locale from pathname
  const segments = pathname.split('/').filter(Boolean);
  const currentLocale: Locale = segments.length > 0 && isValidLocale(segments[0])
    ? (segments[0] as Locale)
    : DEFAULT_LOCALE;

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute equivalent target path for chosen locale
  const getTargetPath = (targetLocale: Locale): string => {
    let unlocalizedPath = pathname;
    if (currentLocale !== DEFAULT_LOCALE) {
      // Remove prefix: e.g. /fr/tools/merge-pdf -> /tools/merge-pdf
      unlocalizedPath = pathname.replace(new RegExp(`^/${currentLocale}`), '') || '/';
    }
    return getLocalizedPath(targetLocale, unlocalizedPath);
  };

  const handleSelect = (targetLocale: Locale) => {
    setOpen(false);
    if (targetLocale === currentLocale) return;

    // Save user preference
    try {
      localStorage.setItem('alee_user_locale', targetLocale);
    } catch {
      // ignore storage errors
    }

    const targetUrl = getTargetPath(targetLocale);
    router.push(targetUrl);
  };

  return (
    <div ref={dropdownRef} className="relative inline-block text-left z-40">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="clay-button flex items-center gap-1.5 h-9 px-2.5 sm:px-3 text-xs font-semibold rounded-[10px] transition-transform active:scale-95"
        style={{
          background: 'var(--surface)',
          color: 'var(--ink)',
          border: '1px solid var(--border)',
        }}
        aria-label="Change language"
        aria-expanded={open}
      >
        <Globe size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span className="hidden sm:inline">{LOCALE_LABELS[currentLocale]}</span>
        <span className="sm:hidden uppercase">{currentLocale.replace('-BR', '')}</span>
        <ChevronDown size={13} className={`opacity-60 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-44 rounded-xl border shadow-xl py-1 z-50 backdrop-blur-md animate-in fade-in zoom-in-95 duration-100"
          style={{
            background: 'color-mix(in srgb, var(--surface) 95%, transparent)',
            borderColor: 'var(--border)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
          }}
          role="menu"
        >
          {LOCALES.map((locale) => {
            const isSelected = locale === currentLocale;
            return (
              <button
                key={locale}
                onClick={() => handleSelect(locale)}
                className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10'
                    : 'hover:bg-black/5 dark:hover:bg-white/5'
                }`}
                style={{ color: isSelected ? undefined : 'var(--ink)' }}
                role="menuitem"
              >
                <div className="flex items-center gap-2">
                  <span>{LOCALE_LABELS[locale]}</span>
                  <span className="text-[10px] opacity-50 uppercase">({locale})</span>
                </div>
                {isSelected && <Check size={14} className="text-emerald-600 dark:text-emerald-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
