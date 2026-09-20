import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { categories, getCategoryBySlug } from '@/lib/tool-registry';
import { buildCategoryMetadata } from '@/lib/seo';
import { CategoryView } from '@/components/tools/CategoryView';
import { NON_DEFAULT_LOCALES, isValidLocale, type Locale } from '@/lib/i18n';

type Props = {
  params: Promise<{ locale: string; category: string }>;
};

export async function generateStaticParams() {
  const params: { locale: string; category: string }[] = [];
  for (const locale of NON_DEFAULT_LOCALES) {
    for (const cat of categories) {
      params.push({ locale, category: cat.slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category: categorySlug } = await params;
  if (!isValidLocale(locale)) return {};
  const category = getCategoryBySlug(categorySlug);
  if (!category) return {};
  return buildCategoryMetadata(category, locale as Locale);
}

export default async function LocalizedCategoryPage({ params }: Props) {
  const { locale, category: categorySlug } = await params;
  if (!isValidLocale(locale)) {
    notFound();
  }

  return <CategoryView categorySlug={categorySlug} locale={locale as Locale} />;
}
