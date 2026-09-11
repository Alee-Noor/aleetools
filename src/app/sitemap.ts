import { MetadataRoute } from 'next';
import { categories, subcategories, tools, getToolUrl } from '@/lib/tool-registry';

export const dynamic = 'force-static';

const BASE = 'https://alee.software';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ['', '/tools', '/about', '/privacy', '/contact'].map((p) => ({
    url: `${BASE}${p}`,
    changeFrequency: 'weekly' as const,
    priority: p === '' ? 1.0 : 0.7,
  }));

  const categoryPages = categories.map((c) => ({
    url: `${BASE}/tools/${c.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const subcategoryPages = subcategories.map((s) => ({
    url: `${BASE}/tools/${s.categorySlug}/${s.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const toolPages = tools.map((t) => ({
    url: `${BASE}${getToolUrl(t)}`,
    changeFrequency: 'monthly' as const,
    priority: 0.9,
    lastModified: new Date(),
  }));

  return [...staticPages, ...categoryPages, ...subcategoryPages, ...toolPages];
}
