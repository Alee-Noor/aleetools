'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Search, X, ArrowRight } from 'lucide-react';
import { tools, getToolUrl, type Tool } from '@/lib/tool-registry';

interface SearchInputProps {
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
  onSelect?: (tool: Tool) => void;
  showDropdown?: boolean;
}

export function SearchInput({
  placeholder = 'Search 156 free utility tools (e.g. "resize", "pdf", "json")...',
  autoFocus = false,
  className = '',
  onSelect,
  showDropdown = true,
}: SearchInputProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Tool[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    const q = query.toLowerCase();
    const matches = tools
      .filter((tool) => {
        const nameMatch = tool.name.toLowerCase().includes(q);
        const kwMatch = tool.keywords.some((kw) => kw.toLowerCase().includes(q));
        const descMatch = tool.shortDescription.toLowerCase().includes(q);
        return nameMatch || kwMatch || descMatch;
      })
      .slice(0, 8);

    setResults(matches);
    setIsOpen(showDropdown && matches.length > 0);
  }, [query, showDropdown]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div
        className="clay-surface flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-3.5"
        style={{
          borderRadius: 'var(--radius-md)',
          background: 'var(--surface)',
        }}
      >
        <Search size={20} className="shrink-0 text-stone-600 dark:text-stone-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0 && showDropdown) setIsOpen(true);
          }}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full bg-transparent text-base outline-none placeholder:text-stone-500 dark:placeholder:text-stone-400 font-medium"
          style={{
            fontFamily: 'var(--font-body)',
            color: 'var(--ink)',
          }}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="p-1 text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200 transition-colors"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Instant Dropdown Results */}
      {showDropdown && isOpen && (
        <div
          className="clay-surface absolute top-full left-0 right-0 z-50 mt-2 overflow-hidden py-2 shadow-xl"
          style={{
            borderRadius: 'var(--radius-md)',
            background: 'var(--surface)',
            maxHeight: '400px',
            overflowY: 'auto',
          }}
        >
          <div className="px-4 py-1 text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400">
            {results.length} Tools found
          </div>
          {results.map((tool) => (
            <Link
              key={`${tool.category}-${tool.slug}`}
              href={getToolUrl(tool)}
              onClick={() => {
                setIsOpen(false);
                setQuery('');
                if (onSelect) onSelect(tool);
              }}
              className="flex items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-stone-100 dark:hover:bg-stone-800/80 no-underline"
              style={{ color: 'var(--ink)' }}
            >
              <div>
                <div className="font-semibold">{tool.name}</div>
                <div className="text-xs text-stone-600 dark:text-stone-400 line-clamp-1">
                  {tool.shortDescription}
                </div>
              </div>
              <ArrowRight size={14} className="shrink-0 text-stone-500 dark:text-stone-400" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
