import Link from 'next/link';
import { categories, subcategories, getSubcategoriesByCategory, getCategoryUrl, getSubcategoryUrl } from '@/lib/tool-registry';

const categoryColors: Record<string, string> = {
  'accent-primary': 'var(--color-accent-primary)',
  'accent-secondary': 'var(--color-accent-secondary)',
  'accent-tertiary': 'var(--color-accent-tertiary)',
  'accent-quaternary': 'var(--color-accent-quaternary)',
  'accent-quinary': 'var(--color-accent-quinary)',
};

export function Footer() {
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
                  href={getCategoryUrl(cat)}
                  className="text-sm font-semibold no-underline mb-3 block"
                  style={{ color: categoryColors[cat.color] || 'var(--ink)', fontFamily: 'var(--font-display)' }}
                >
                  {cat.name}
                </Link>
                {subs.length > 0 ? (
                  <ul className="space-y-1.5 list-none p-0 m-0">
                    {subs.map((sub) => (
                      <li key={sub.slug}>
                        <Link
                          href={getSubcategoryUrl(sub)}
                          className="text-xs no-underline transition-colors"
                          style={{ color: 'var(--ink-soft)' }}
                        >
                          {sub.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>26 tools</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom bar */}
        <div className="border-t pt-8 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-4">
            <Link href="/about" className="text-xs font-medium no-underline hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors" style={{ color: 'var(--ink-soft)' }}>About</Link>
            <Link href="/privacy" className="text-xs font-medium no-underline hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors" style={{ color: 'var(--ink-soft)' }}>Privacy</Link>
            <Link href="/contact" className="text-xs font-medium no-underline hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors" style={{ color: 'var(--ink-soft)' }}>Contact</Link>
          </div>
          <p className="text-xs font-medium" style={{ color: 'var(--ink-soft)' }}>
            © {new Date().getFullYear()} Alee Tools. Fast, reliable, and free online utility tools.
          </p>
        </div>

        {/* Disclaimer */}
        <p className="text-xs mt-4 text-center font-medium" style={{ color: 'var(--ink-soft)', opacity: 0.85 }}>
          Alee is independent and not affiliated with Instagram, YouTube, TikTok, or any other platform mentioned.
        </p>
      </div>
    </footer>
  );
}
