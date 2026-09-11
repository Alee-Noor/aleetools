'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const Hero3DScene = dynamic(
  () => import('./Hero3DScene').then((mod) => mod.Hero3DScene),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[320px] flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-emerald-600/20 border-t-emerald-600 animate-spin" />
      </div>
    ),
  }
);

export function Hero3DWrapper() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full min-h-[320px] flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-emerald-600/20 border-t-emerald-600 animate-spin" />
      </div>
    );
  }

  return <Hero3DScene />;
}
