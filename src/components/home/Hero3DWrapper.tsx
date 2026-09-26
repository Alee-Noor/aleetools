'use client';

import React, { useState, useEffect, Component, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { Wrench, ShieldCheck, Zap, Sparkles } from 'lucide-react';

// Error Boundary to ensure zero-crash guarantee on the home page
interface ErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class HeroErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('Hero3D caught rendering error, falling back to static presentation:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const Hero3DScene = dynamic(
  () => import('./Hero3DScene').then((mod) => mod.Hero3DScene),
  {
    ssr: false,
    loading: () => <HeroPlaceholder />,
  }
);

function HeroPlaceholder() {
  return (
    <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="relative">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-amber-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
          <Wrench size={36} />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center text-stone-900 shadow">
          <Sparkles size={13} />
        </div>
      </div>
      <div className="space-y-1">
        <span className="text-sm font-bold font-display tracking-tight text-stone-800 dark:text-stone-100">
          Soft Workshop Engine
        </span>
        <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
          100% Client-Side • In-Browser Processing
        </p>
      </div>
      <div className="flex items-center gap-2 pt-1 text-[11px] text-stone-600 dark:text-stone-300 font-semibold">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
          <ShieldCheck size={12} /> Zero Uploads
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300">
          <Zap size={12} /> Instant
        </span>
      </div>
    </div>
  );
}

export function Hero3DWrapper() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <HeroPlaceholder />;
  }

  return (
    <HeroErrorBoundary fallback={<HeroPlaceholder />}>
      <Hero3DScene />
    </HeroErrorBoundary>
  );
}
