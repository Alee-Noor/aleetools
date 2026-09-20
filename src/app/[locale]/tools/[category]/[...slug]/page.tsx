import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  tools,
  subcategories,
  getCategoryBySlug,
  getSubcategoryBySlug,
  getToolBySlug,
} from '@/lib/tool-registry';
import { buildToolMetadata, buildSubcategoryMetadata } from '@/lib/seo';
import { DynamicToolOrSubcategoryView } from '@/components/tools/DynamicToolOrSubcategoryView';
import { NON_DEFAULT_LOCALES, isValidLocale, type Locale } from '@/lib/i18n';

type Props = {
  params: Promise<{ locale: string; category: string; slug: string[] }>;
};

export async function generateStaticParams() {
  const params: { locale: string; category: string; slug: string[] }[] = [];

  for (const locale of NON_DEFAULT_LOCALES) {
    // 1. Subcategory hubs
    for (const sub of subcategories) {
      params.push({
        locale,
        category: sub.categorySlug,
        slug: [sub.slug],
      });
    }

    // 2. Tools
    for (const tool of tools) {
      if (!tool.subcategory) {
        params.push({
          locale,
          category: tool.category,
          slug: [tool.slug],
        });
      } else {
        params.push({
          locale,
          category: tool.category,
          slug: [tool.subcategory, tool.slug],
        });
      }
    }
  }

  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category: categorySlug, slug } = await params;
  if (!isValidLocale(locale)) return {};
  const loc = locale as Locale;

  const category = getCategoryBySlug(categorySlug);
  if (!category || !slug || slug.length === 0) return {};

  if (slug.length === 1) {
    const subcategory = getSubcategoryBySlug(categorySlug, slug[0]);
    if (subcategory) {
      return buildSubcategoryMetadata(subcategory, category, loc);
    }
    const flatTool = getToolBySlug(categorySlug, slug[0]);
    if (flatTool) {
      return buildToolMetadata(flatTool, loc);
    }
  } else if (slug.length === 2) {
    const nestedTool = getToolBySlug(categorySlug, slug[1], slug[0]);
    if (nestedTool) {
      return buildToolMetadata(nestedTool, loc);
    }
  }

  return {};
}

export default async function LocalizedToolOrSubcategoryPage({ params }: Props) {
  const { locale, category: categorySlug, slug } = await params;
  if (!isValidLocale(locale)) {
    notFound();
  }

  return (
    <DynamicToolOrSubcategoryView
      categorySlug={categorySlug}
      slug={slug}
      locale={locale as Locale}
    />
  );
}
