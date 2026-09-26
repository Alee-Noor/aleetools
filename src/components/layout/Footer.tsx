'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  categories,
  getSubcategoriesByCategory,
  getToolsByCategory,
  getCategoryUrl,
  getSubcategoryUrl,
  getToolUrl,
} from '@/lib/tool-registry';
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
            const catTools = getToolsByCategory(cat.slug);

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
                  <ul className="space-y-1.5 list-none p-0 m-0">
                    {catTools.slice(0, 6).map((tool) => (
                      <li key={tool.slug}>
                        <Link
                          href={getLocalizedPath(currentLocale, getToolUrl(tool))}
                          className="text-xs no-underline transition-colors hover:text-emerald-700 dark:hover:text-emerald-400"
                          style={{ color: 'var(--ink-soft)' }}
                        >
                          {tool.name}
                        </Link>
                      </li>
                    ))}
                    <li>
                      <Link
                        href={getLocalizedPath(currentLocale, getCategoryUrl(cat))}
                        className="text-xs font-semibold hover:underline"
                        style={{ color: 'var(--color-accent-primary)' }}
                      >
                        All {catTools.length} Tools →
                      </Link>
                    </li>
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom bar */}
        <div className="border-t pt-8 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderColor: 'var(--border)' }}>
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium" style={{ color: 'var(--ink-soft)' }}>
            <Link
              href={getLocalizedPath(currentLocale, '/tools')}
              className="no-underline hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
            >
              All Tools Directory
            </Link>
            <Link
              href={getLocalizedPath(currentLocale, '/about')}
              className="no-underline hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
            >
              {t(currentLocale, 'common.about')}
            </Link>
            <Link
              href={getLocalizedPath(currentLocale, '/privacy')}
              className="no-underline hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
            >
              {t(currentLocale, 'common.privacy')}
            </Link>
            <Link
              href={getLocalizedPath(currentLocale, '/contact')}
              className="no-underline hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
            >
              {t(currentLocale, 'common.contact')}
            </Link>
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="no-underline hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
            >
              XML Sitemap
            </a>
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
