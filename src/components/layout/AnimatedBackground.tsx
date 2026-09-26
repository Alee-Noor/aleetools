'use client';

export function AnimatedBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{ opacity: 'var(--bg-pattern-opacity, 1)' }}
    >
      {/* 1. Ambient Breathing Color Orbs with Theme Glow */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-emerald-500/15 dark:bg-emerald-400/20 blur-3xl animate-ambient-slow" />
      <div className="absolute top-1/3 -right-40 h-[28rem] w-[28rem] rounded-full bg-amber-500/15 dark:bg-violet-500/20 blur-3xl animate-ambient-reverse" />
      <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-teal-500/15 dark:bg-cyan-500/20 blur-3xl animate-ambient-slow" />

      {/* 2. Seamless Flowing Glowing Geometric Grid of Lines */}
      <div className="absolute inset-0 animated-line-grid" />

      {/* 3. Dynamic Diagonal Vector Line Laser Beams */}
      <svg
        className="absolute inset-0 h-full w-full opacity-70 dark:opacity-85 pointer-events-none overflow-hidden"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="beamGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-accent-primary)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--color-accent-primary)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--color-accent-primary)" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="beamGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--color-accent-secondary)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--color-accent-secondary)" stopOpacity="0.85" />
            <stop offset="100%" stopColor="var(--color-accent-secondary)" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="beamGrad3" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="var(--color-accent-quinary)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--color-accent-quinary)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="var(--color-accent-quinary)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Traveling Laser Line 1 */}
        <line
          x1="-20%"
          y1="18%"
          x2="120%"
          y2="18%"
          stroke="url(#beamGrad1)"
          strokeWidth="2"
          className="animate-line-beam-1"
        />

        {/* Traveling Laser Line 2 */}
        <line
          x1="-20%"
          y1="52%"
          x2="120%"
          y2="52%"
          stroke="url(#beamGrad2)"
          strokeWidth="2"
          className="animate-line-beam-2"
        />

        {/* Traveling Laser Line 3 */}
        <line
          x1="-20%"
          y1="82%"
          x2="120%"
          y2="82%"
          stroke="url(#beamGrad3)"
          strokeWidth="2"
          className="animate-line-beam-3"
        />

        {/* Diagonal Glowing Dash Lines */}
        <line
          x1="5%"
          y1="-10%"
          x2="95%"
          y2="110%"
          stroke="var(--line-pattern-stroke)"
          strokeWidth="1.5"
          strokeDasharray="10 14"
          className="animate-line-dash"
        />
        <line
          x1="95%"
          y1="-10%"
          x2="5%"
          y2="110%"
          stroke="var(--line-pattern-stroke)"
          strokeWidth="1.5"
          strokeDasharray="8 16"
          className="animate-line-dash-reverse"
        />
      </svg>

      {/* 4. Vignette for Depth */}
      <div className="absolute inset-0 bg-radial-vignette pointer-events-none" />
    </div>
  );
}
