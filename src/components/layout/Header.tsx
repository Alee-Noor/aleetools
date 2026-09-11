'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Search, Menu, X, Sun, Moon, Wrench } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { tools, getToolUrl, type Tool } from '@/lib/tool-registry';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Tool[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Simple fuzzy search - no Fuse.js needed for this
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const results = tools
      .filter((t) => t.name.toLowerCase().includes(q) || t.keywords.some((k) => k.includes(q)))
      .slice(0, 8);
    setSearchResults(results);
  }, [searchQuery]);

  // Close search on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setSearchQuery('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchOpen]);

  return (
    <header className="sticky top-0 z-50 border-b backdrop-blur-md transition-colors" style={{ background: 'color-mix(in srgb, var(--bg) 85%, transparent)', borderColor: 'var(--border)' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 no-underline group" style={{ color: 'var(--ink)' }}>
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] shadow-sm transition-transform group-hover:scale-105" style={{ background: 'var(--color-accent-primary)', color: 'white' }}>
              <Wrench size={18} />
            </div>
            <span className="text-xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>alee</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/tools" className="text-sm font-semibold no-underline transition-colors hover:text-emerald-700 dark:hover:text-emerald-400" style={{ color: 'var(--ink)' }}>
              Browse Tools
            </Link>
            <Link href="/about" className="text-sm font-semibold no-underline transition-colors hover:text-emerald-700 dark:hover:text-emerald-400" style={{ color: 'var(--ink)' }}>
              About
            </Link>
          </nav>

          {/* Right side: search + theme + mobile menu */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div ref={searchRef} className="relative">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="clay-button flex h-9 w-9 items-center justify-center"
                style={{ background: 'var(--surface)', color: 'var(--ink)' }}
                aria-label="Search tools"
              >
                <Search size={16} />
              </button>

              {searchOpen && (
                <div
                  className="absolute right-0 top-12 w-80 rounded-[20px] p-3 shadow-lg"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search 156 tools..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-[14px] px-4 py-2.5 text-sm outline-none"
                    style={{
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      color: 'var(--ink)',
                      fontFamily: 'var(--font-body)',
                    }}
                  />
                  {searchResults.length > 0 && (
                    <div className="mt-2 max-h-64 overflow-y-auto">
                      {searchResults.map((tool) => (
                        <Link
                          key={`${tool.category}-${tool.slug}`}
                          href={getToolUrl(tool)}
                          className="flex items-center gap-3 rounded-[10px] px-3 py-2 text-sm no-underline transition-colors"
                          style={{ color: 'var(--ink)' }}
                          onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                          onMouseOver={(e) => (e.currentTarget.style.background = 'var(--hover)')}
                          onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          <span className="font-medium">{tool.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                  {searchQuery && searchResults.length === 0 && (
                    <p className="mt-2 px-3 py-2 text-sm" style={{ color: 'var(--ink-soft)' }}>
                      No tools found for &ldquo;{searchQuery}&rdquo;
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="clay-button flex h-9 w-9 items-center justify-center"
              style={{ background: 'var(--surface)', color: 'var(--ink)' }}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="clay-button flex h-9 w-9 items-center justify-center md:hidden"
              style={{ background: 'var(--surface)', color: 'var(--ink)' }}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <nav className="border-t py-4 md:hidden" style={{ borderColor: 'var(--border)' }}>
            <div className="flex flex-col gap-3">
              <Link href="/tools" className="text-sm font-medium no-underline py-2" style={{ color: 'var(--ink)' }} onClick={() => setMenuOpen(false)}>
                Browse Tools
              </Link>
              <Link href="/about" className="text-sm font-medium no-underline py-2" style={{ color: 'var(--ink)' }} onClick={() => setMenuOpen(false)}>
                About
              </Link>
              <Link href="/privacy" className="text-sm font-medium no-underline py-2" style={{ color: 'var(--ink)' }} onClick={() => setMenuOpen(false)}>
                Privacy
              </Link>
              <Link href="/contact" className="text-sm font-medium no-underline py-2" style={{ color: 'var(--ink)' }} onClick={() => setMenuOpen(false)}>
                Contact
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
