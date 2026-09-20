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

type Props = {
  params: Promise<{ category: string; slug: string[] }>;
};

export async function generateStaticParams() {
  const params: { category: string; slug: string[] }[] = [];

  // 1. Subcategory hubs (13)
  for (const sub of subcategories) {
    params.push({
      category: sub.categorySlug,
      slug: [sub.slug],
    });
  }

  // 2. Tools
  for (const tool of tools) {
    if (!tool.subcategory) {
      params.push({
        category: tool.category,
        slug: [tool.slug],
      });
    } else {
      params.push({
        category: tool.category,
        slug: [tool.subcategory, tool.slug],
      });
    }
  }

  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: categorySlug, slug } = await params;
  const category = getCategoryBySlug(categorySlug);
  if (!category || !slug || slug.length === 0) return {};

  if (slug.length === 1) {
    const subcategory = getSubcategoryBySlug(categorySlug, slug[0]);
    if (subcategory) {
      return buildSubcategoryMetadata(subcategory, category, 'en');
    }
    const flatTool = getToolBySlug(categorySlug, slug[0]);
    if (flatTool) {
      return buildToolMetadata(flatTool, 'en');
    }
  } else if (slug.length === 2) {
    const nestedTool = getToolBySlug(categorySlug, slug[1], slug[0]);
    if (nestedTool) {
      return buildToolMetadata(nestedTool, 'en');
    }
  }

  return {};
}

export default async function DynamicToolOrSubcategoryPage({ params }: Props) {
  const { category: categorySlug, slug } = await params;
  return <DynamicToolOrSubcategoryView categorySlug={categorySlug} slug={slug} locale="en" />;
}
