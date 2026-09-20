import { notFound } from 'next/navigation';
import { NON_DEFAULT_LOCALES, isValidLocale, type Locale } from '@/lib/i18n';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateStaticParams() {
  return NON_DEFAULT_LOCALES.map((locale) => ({
    locale,
  }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  return <>{children}</>;
}
