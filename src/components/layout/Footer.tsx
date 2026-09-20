'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { categories, subcategories, getSubcategoriesByCategory, getCategoryUrl, getSubcategoryUrl } from '@/lib/tool-registry';
import { DEFAULT_LOCALE, isValidLocale, getLocalizedPath, type Locale } from '@/lib/i18n';
import { t } from '@/lib/translations';

const categoryColors: Record<string, string> = {
  'accent-primary': 'var(--color-accent-primary)',
  'accent-secondary': 'var(--color-accent-secondary)',
  'accent-tertiary': 'var(--color-accent-tertiary)',
  'accent-quaternary': 'var(--color-accent-quaternary)',
  'accent-quinary': 'var(--color-accent-quinary)',
};

export function Footer() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const currentLocale: Locale = segments.length > 0 && isValidLocale(segments[0])
    ? (segments[0] as Locale)
    : DEFAULT_LOCALE;

  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t mt-20" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Full sitemap link block by category */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
          {categories.map((cat) => {
            const subs = getSubcategoriesByCategory(cat.slug);
            return (
              <div key={cat.slug}>
                <Link
                  href={getLocalizedPath(currentLocale, getCategoryUrl(cat))}
                  className="text-sm font-semibold no-underline mb-3 block hover:underline"
                  style={{ color: categoryColors[cat.color] || 'var(--ink)', fontFamily: 'var(--font-display)' }}
                >
                  {cat.name}
                </Link>
                {subs.length > 0 ? (
                  <ul className="space-y-1.5 list-none p-0 m-0">
                    {subs.map((sub) => (
                      <li key={sub.slug}>
                        <Link
                          href={getLocalizedPath(currentLocale, getSubcategoryUrl(sub))}
                          className="text-xs no-underline transition-colors hover:text-emerald-700 dark:hover:text-emerald-400"
                          style={{ color: 'var(--ink-soft)' }}
                        >
                          {sub.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>
                    {t(currentLocale, 'tools.totalTools', { count: 26 })}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom bar */}
        <div className="border-t pt-8 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-4">
            <Link
              href={getLocalizedPath(currentLocale, '/about')}
              className="text-xs font-medium no-underline hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
              style={{ color: 'var(--ink-soft)' }}
            >
              {t(currentLocale, 'common.about')}
            </Link>
            <Link
              href={getLocalizedPath(currentLocale, '/privacy')}
              className="text-xs font-medium no-underline hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
              style={{ color: 'var(--ink-soft)' }}
            >
              {t(currentLocale, 'common.privacy')}
            </Link>
            <Link
              href={getLocalizedPath(currentLocale, '/contact')}
              className="text-xs font-medium no-underline hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
              style={{ color: 'var(--ink-soft)' }}
            >
              {t(currentLocale, 'common.contact')}
            </Link>
          </div>
          <p className="text-xs font-medium" style={{ color: 'var(--ink-soft)' }}>
            {t(currentLocale, 'footer.copyright', { year: currentYear })}
          </p>
        </div>

        {/* Disclaimer */}
        <p className="text-xs mt-4 text-center font-medium" style={{ color: 'var(--ink-soft)', opacity: 0.85 }}>
          {t(currentLocale, 'footer.disclaimer')}
        </p>
      </div>
    </footer>
  );
}
