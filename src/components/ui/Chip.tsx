import Link from 'next/link';
import { type ReactNode } from 'react';

interface ChipProps {
  children: ReactNode;
  href?: string;
  active?: boolean;
  accentColor?: string;
  onClick?: () => void;
  className?: string;
  icon?: ReactNode;
}

export function Chip({
  children,
  href,
  active = false,
  accentColor,
  onClick,
  className = '',
  icon,
}: ChipProps) {
  const customStyle: React.CSSProperties = {
    ...(active && accentColor
      ? {
          borderColor: accentColor,
          color: accentColor,
          background: 'var(--surface)',
          boxShadow: 'inset 0 0 0 1px ' + accentColor,
        }
      : active
      ? {
          borderColor: 'var(--color-accent-primary)',
          color: 'var(--color-accent-primary)',
          background: 'var(--surface)',
        }
      : {}),
  };

  const content = (
    <>
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`clay-chip no-underline ${className}`}
        style={customStyle}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`clay-chip ${className}`}
      style={customStyle}
    >
      {content}
    </button>
  );
}
