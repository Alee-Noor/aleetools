import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildBreadcrumbJsonLd } from '@/lib/seo';

type BreadcrumbItem = {
  label: string;
  href: string;
};

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const allItems = [{ label: 'Home', href: '/' }, ...items];
  const jsonLdItems = allItems.map((item) => ({ name: item.label, url: item.href }));

  return (
    <>
      <JsonLd data={buildBreadcrumbJsonLd(jsonLdItems)} />
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm list-none p-0 m-0">
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1;
            return (
              <li key={item.href} className="flex items-center gap-1.5">
                {index > 0 && <ChevronRight size={14} style={{ color: 'var(--ink-soft)', opacity: 0.5 }} />}
                {isLast ? (
                  <span className="font-medium" style={{ color: 'var(--ink)' }}>
                    {index === 0 ? <Home size={14} /> : item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="no-underline transition-colors"
                    style={{ color: 'var(--ink-soft)' }}
                  >
                    {index === 0 ? <Home size={14} /> : item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
