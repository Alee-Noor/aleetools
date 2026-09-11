import type { Metadata } from 'next';
import { ToolsDirectoryClient } from './ToolsDirectoryClient';
import { tools, categories } from '@/lib/tool-registry';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildCollectionPageJsonLd, buildBreadcrumbJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'All 156 Free Utility Tools – Search & Browse Directory | Alee Tools',
  description:
    'Browse all 156 free, private private client-side utilities. Image resizers, PDF converters, developer formatters, QR code generators, and calculators — nothing uploaded.',
  alternates: {
    canonical: 'https://alee.software/tools',
  },
  openGraph: {
    title: 'All 156 Free Utility Tools | Alee Tools',
    description:
      'Search and browse 156 fast, client-side tools across 5 categories. Free forever with zero uploads.',
    url: 'https://alee.software/tools',
    siteName: 'Alee Tools',
  },
};

export default function ToolsDirectoryPage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Tools', url: '/tools' },
  ]);

  const collectionJsonLd = buildCollectionPageJsonLd(
    'All Tools Directory',
    'Full catalog of 156 client-side utility tools across 5 categories',
    '/tools',
    tools.map((t) => ({
      name: t.name,
      url: t.subcategory ? `/tools/${t.category}/${t.subcategory}/${t.slug}` : `/tools/${t.category}/${t.slug}`,
    }))
  );

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={collectionJsonLd} />
      <ToolsDirectoryClient categories={categories} tools={tools} />
    </>
  );
}
