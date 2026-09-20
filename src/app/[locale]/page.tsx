import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { HomeView } from '@/components/home/HomeView';
import { buildHomeMetadata } from '@/lib/seo';
import { NON_DEFAULT_LOCALES, isValidLocale, type Locale } from '@/lib/i18n';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateStaticParams() {
  return NON_DEFAULT_LOCALES.map((locale) => ({
    locale,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};
  return buildHomeMetadata(locale as Locale);
}

export default async function LocalizedHomePage({ params }: Props) {
  const { locale } = await params;
  if (!isValidLocale(locale)) {
    notFound();
  }

  return <HomeView locale={locale as Locale} />;
}
