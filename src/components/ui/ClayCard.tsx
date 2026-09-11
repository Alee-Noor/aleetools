import { type ReactNode, type HTMLAttributes } from 'react';

interface ClayCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  interactive?: boolean;
  pressed?: boolean;
  accentColor?: string;
  className?: string;
  showPattern?: boolean;
}

export function ClayCard({
  children,
  interactive = false,
  pressed = false,
  accentColor,
  className = '',
  showPattern = true,
  style,
  ...props
}: ClayCardProps) {
  const customStyle = {
    ...style,
    ...(accentColor ? { '--card-accent': accentColor } : {}),
  } as React.CSSProperties;

  return (
    <div
      className={`clay-surface relative overflow-hidden ${pressed ? 'clay-surface--pressed' : ''} ${
        interactive ? 'cursor-pointer' : ''
      } p-6 sm:p-7 ${className}`}
      style={customStyle}
      {...props}
    >
      {/* Replicated Glowing Pattern & Dot Matrix Backdrop */}
      {showPattern && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Ambient Glow Orbs */}
          <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-emerald-500/10 dark:bg-emerald-400/15 blur-2xl transition-all group-hover:scale-125" />
          <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-amber-500/10 dark:bg-violet-500/15 blur-2xl transition-all group-hover:scale-125" />

          {/* Geometric Glowing Scattered Dot Matrix (32px spacing for zero text interference) */}
          <div className="absolute inset-0 bg-[radial-gradient(#2C6E59_0.9px,transparent_0.9px)] dark:bg-[radial-gradient(#3DD6A0_0.9px,transparent_0.9px)] [background-size:32px_32px] opacity-15 dark:opacity-25" />

          {/* Top/Bottom Laser Edge Flares */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/40 dark:via-emerald-400/60 to-transparent" />
        </div>
      )}

      <div className="relative z-10">{children}</div>
    </div>
  );
}
