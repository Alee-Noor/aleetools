import Link from 'next/link';
import { Wrench, ArrowRight, Search } from 'lucide-react';
import { ClayCard } from '@/components/ui/ClayCard';
import { SearchInput } from '@/components/ui/SearchInput';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:py-24 text-center">
      <ClayCard className="p-8 sm:p-12 space-y-6">
        <div
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-[16px] text-white shadow-md"
          style={{ background: 'var(--color-accent-tertiary)' }}
        >
          <Wrench size={28} />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight" style={{ color: 'var(--ink)' }}>
            404
          </h1>
          <h2 className="text-xl sm:text-2xl font-semibold" style={{ color: 'var(--ink)' }}>
            Tool Not Found
          </h2>
          <p className="text-sm sm:text-base text-stone-500 max-w-md mx-auto leading-relaxed">
            The page or tool you are looking for might have been moved or doesn&apos;t exist. Try searching our 156 tools below.
          </p>
        </div>

        <div className="max-w-md mx-auto pt-2">
          <SearchInput placeholder="Search 156 tools..." />
        </div>

        <div className="pt-4 flex items-center justify-center gap-4">
          <Link
            href="/tools"
            className="clay-chip py-2.5 px-5 text-sm font-semibold no-underline"
            style={{
              background: 'var(--color-accent-primary)',
              color: '#FFFFFF',
              borderColor: 'transparent',
            }}
          >
            <span>Browse All Tools</span>
            <ArrowRight size={14} />
          </Link>
          <Link
            href="/"
            className="clay-chip py-2.5 px-5 text-sm font-semibold no-underline"
          >
            Back to Home
          </Link>
        </div>
      </ClayCard>
    </div>
  );
}
