import type { Metadata } from 'next';
import { categories, getCategoryBySlug } from '@/lib/tool-registry';
import { buildCategoryMetadata } from '@/lib/seo';
import { CategoryView } from '@/components/tools/CategoryView';

type Props = {
  params: Promise<{ category: string }>;
};

export async function generateStaticParams() {
  return categories.map((c) => ({
    category: c.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);
  if (!category) return {};
  return buildCategoryMetadata(category, 'en');
}

export default async function CategoryPage({ params }: Props) {
  const { category: categorySlug } = await params;
  return <CategoryView categorySlug={categorySlug} locale="en" />;
}
