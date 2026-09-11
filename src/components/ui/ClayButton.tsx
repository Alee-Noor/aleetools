import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

interface ClayButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  icon?: ReactNode;
}

export const ClayButton = forwardRef<HTMLButtonElement, ClayButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      className = '',
      icon,
      disabled,
      style,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-7 py-3.5 text-base',
    };

    const variantStyles: Record<string, React.CSSProperties> = {
      primary: {
        background: 'var(--color-accent-primary)',
        color: '#FFFFFF',
      },
      secondary: {
        background: 'var(--color-accent-secondary)',
        color: '#FFFFFF',
      },
      danger: {
        background: 'var(--color-accent-tertiary)',
        color: '#FFFFFF',
      },
      outline: {
        background: 'var(--surface)',
        color: 'var(--ink)',
        border: '1px solid var(--border)',
      },
      ghost: {
        background: 'transparent',
        color: 'var(--ink-soft)',
        boxShadow: 'none',
      },
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`clay-button inline-flex items-center justify-center gap-2 font-medium select-none transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
          sizeClasses[size]
        } ${className}`}
        style={{
          ...variantStyles[variant],
          ...style,
        }}
        {...props}
      >
        {icon && <span className="inline-flex shrink-0">{icon}</span>}
        <span>{children}</span>
      </button>
    );
  }
);

ClayButton.displayName = 'ClayButton';
