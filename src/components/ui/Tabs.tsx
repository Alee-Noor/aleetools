'use client';

interface TabItem {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
  accentColor?: string;
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  className = '',
  accentColor = 'var(--color-accent-primary)',
}: TabsProps) {
  return (
    <div
      className={`inline-flex p-1.5 rounded-[14px] clay-surface gap-1.5 ${className}`}
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-[10px] transition-all duration-150 select-none flex items-center gap-2 ${
              isActive
                ? 'shadow-sm font-semibold'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
            style={
              isActive
                ? {
                    background: accentColor,
                    color: '#FFFFFF',
                  }
                : {}
            }
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  isActive
                    ? 'bg-white/25 text-white'
                    : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
