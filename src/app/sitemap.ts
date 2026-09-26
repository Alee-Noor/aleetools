import { MetadataRoute } from 'next';
import { categories, subcategories, tools, getToolUrl, getCategoryUrl, getSubcategoryUrl } from '@/lib/tool-registry';
import { LOCALES, getLocalizedPath, buildHreflangAlternates } from '@/lib/i18n';

export const dynamic = 'force-static';

const BASE = 'https://alee.software';

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  const now = new Date();

  // 1. Static Pages
  const staticPaths = ['', '/tools', '/about', '/privacy', '/contact'];
  for (const path of staticPaths) {
    const alternates = { languages: buildHreflangAlternates(path) };
    for (const locale of LOCALES) {
      entries.push({
        url: `${BASE}${getLocalizedPath(locale, path)}`,
        changeFrequency: 'weekly',
        priority: path === '' ? (locale === 'en' ? 1.0 : 0.9) : (path === '/tools' ? 0.9 : 0.6),
        lastModified: now,
        alternates,
      });
    }
  }

  // 2. Category Pages
  for (const cat of categories) {
    const path = getCategoryUrl(cat);
    const alternates = { languages: buildHreflangAlternates(path) };
    for (const locale of LOCALES) {
      entries.push({
        url: `${BASE}${getLocalizedPath(locale, path)}`,
        changeFrequency: 'weekly',
        priority: 0.8,
        lastModified: now,
        alternates,
      });
    }
  }

  // 3. Subcategory Pages
  for (const sub of subcategories) {
    const path = getSubcategoryUrl(sub);
    const alternates = { languages: buildHreflangAlternates(path) };
    for (const locale of LOCALES) {
      entries.push({
        url: `${BASE}${getLocalizedPath(locale, path)}`,
        changeFrequency: 'weekly',
        priority: 0.7,
        lastModified: now,
        alternates,
      });
    }
  }

  // 4. Tool Pages
  for (const tool of tools) {
    const path = getToolUrl(tool);
    const alternates = { languages: buildHreflangAlternates(path) };
    for (const locale of LOCALES) {
      entries.push({
        url: `${BASE}${getLocalizedPath(locale, path)}`,
        changeFrequency: 'monthly',
        priority: 0.9,
        lastModified: now,
        alternates,
      });
    }
  }

  return entries;
}
