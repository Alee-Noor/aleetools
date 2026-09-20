import type { Metadata } from 'next';
import { HomeView } from '@/components/home/HomeView';
import { buildHomeMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return buildHomeMetadata('en');
}

export default function HomePage() {
  return <HomeView locale="en" />;
}
