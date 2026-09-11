'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Copy, Check, ShieldCheck } from 'lucide-react';
import { ClayButton } from '@/components/ui/ClayButton';
import {
  generateBulkUuids,
  generatePassword,
  generateHash,
  type PasswordOptions,
} from '@/lib/engines/generator-engine';
import type { Tool } from '@/lib/tool-registry';

interface GeneratorToolProps {
  tool: Tool;
}

export function GeneratorTool({ tool }: GeneratorToolProps) {
  const isUuid = tool.slug.includes('uuid');
  const isPassword = tool.slug.includes('password');
  const isHash = tool.slug.includes('hash');

  // Password state
  const [passLength, setPassLength] = useState(16);
  const [includeUpper, setIncludeUpper] = useState(true);
  const [includeLower, setIncludeLower] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [generatedPassword, setGeneratedPassword] = useState('');

  // UUID state
  const [uuidCount, setUuidCount] = useState(5);
  const [uuidUpper, setUuidUpper] = useState(false);
  const [uuidHyphens, setUuidHyphens] = useState(true);
  const [uuids, setUuids] = useState<string[]>([]);

  // Hash state
  const [hashInput, setHashInput] = useState('');
  const [hashOutput, setHashOutput] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Initialize on mount
  useEffect(() => {
    if (isUuid) {
      setUuids(generateBulkUuids(uuidCount, uuidUpper, uuidHyphens));
    } else if (isPassword) {
      setGeneratedPassword(
        generatePassword({
          length: passLength,
          includeUppercase: includeUpper,
          includeLowercase: includeLower,
          includeNumbers: includeNumbers,
          includeSymbols: includeSymbols,
        })
      );
    }
  }, [isUuid, isPassword]);

  const handleRegenPassword = () => {
    setGeneratedPassword(
      generatePassword({
        length: passLength,
        includeUppercase: includeUpper,
        includeLowercase: includeLower,
        includeNumbers: includeNumbers,
        includeSymbols: includeSymbols,
      })
    );
  };

  const handleRegenUuids = () => {
    setUuids(generateBulkUuids(uuidCount, uuidUpper, uuidHyphens));
  };

  const handleHash = async (text: string) => {
    setHashInput(text);
    if (!text.trim()) {
      setHashOutput('');
      return;
    }
    const res = await generateHash(text, 'SHA-256');
    setHashOutput(res);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {isPassword && (
        <div className="space-y-6">
          {/* Main Password Display */}
          <div className="flex items-center justify-between p-5 rounded-[14px] border bg-stone-100 dark:bg-stone-900/80 font-mono text-lg sm:text-xl font-bold break-all"
            style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
          >
            <span>{generatedPassword}</span>
            <div className="flex items-center gap-2 shrink-0 ml-4">
              <ClayButton
                onClick={() => copyToClipboard(generatedPassword, 0)}
                variant="primary"
                size="sm"
                icon={copiedIndex === 0 ? <Check size={14} /> : <Copy size={14} />}
              >
                {copiedIndex === 0 ? 'Copied' : 'Copy'}
              </ClayButton>
              <ClayButton
                onClick={handleRegenPassword}
                variant="outline"
                size="sm"
                icon={<RefreshCw size={14} />}
              >
                New
              </ClayButton>
            </div>
          </div>

          {/* Settings */}
          <div className="p-5 rounded-[14px] border space-y-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span>Password Length</span>
                <span>{passLength} characters</span>
              </div>
              <input
                type="range"
                min="8"
                max="64"
                value={passLength}
                onChange={(e) => {
                  setPassLength(Number(e.target.value));
                  setGeneratedPassword(
                    generatePassword({
                      length: Number(e.target.value),
                      includeUppercase: includeUpper,
                      includeLowercase: includeLower,
                      includeNumbers: includeNumbers,
                      includeSymbols: includeSymbols,
                    })
                  );
                }}
                className="w-full accent-emerald-700 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeUpper}
                  onChange={(e) => setIncludeUpper(e.target.checked)}
                  className="rounded accent-emerald-700"
                />
                <span>Uppercase (A-Z)</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeLower}
                  onChange={(e) => setIncludeLower(e.target.checked)}
                  className="rounded accent-emerald-700"
                />
                <span>Lowercase (a-z)</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeNumbers}
                  onChange={(e) => setIncludeNumbers(e.target.checked)}
                  className="rounded accent-emerald-700"
                />
                <span>Numbers (0-9)</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSymbols}
                  onChange={(e) => setIncludeSymbols(e.target.checked)}
                  className="rounded accent-emerald-700"
                />
                <span>Symbols (!@#$)</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {isUuid && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-4">
              <label className="text-xs font-medium flex items-center gap-2">
                <span>Quantity:</span>
                <select
                  value={uuidCount}
                  onChange={(e) => {
                    const c = Number(e.target.value);
                    setUuidCount(c);
                    setUuids(generateBulkUuids(c, uuidUpper, uuidHyphens));
                  }}
                  className="px-2.5 py-1 text-xs rounded-[8px] border outline-none bg-transparent"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <option value={1}>1 UUID</option>
                  <option value={5}>5 UUIDs</option>
                  <option value={10}>10 UUIDs</option>
                  <option value={20}>20 UUIDs</option>
                </select>
              </label>

              <label className="text-xs font-medium flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={uuidUpper}
                  onChange={(e) => {
                    setUuidUpper(e.target.checked);
                    setUuids(generateBulkUuids(uuidCount, e.target.checked, uuidHyphens));
                  }}
                  className="rounded accent-emerald-700"
                />
                <span>Uppercase</span>
              </label>

              <label className="text-xs font-medium flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={uuidHyphens}
                  onChange={(e) => {
                    setUuidHyphens(e.target.checked);
                    setUuids(generateBulkUuids(uuidCount, uuidUpper, e.target.checked));
                  }}
                  className="rounded accent-emerald-700"
                />
                <span>Hyphens</span>
              </label>
            </div>

            <ClayButton
              onClick={handleRegenUuids}
              variant="primary"
              size="sm"
              icon={<RefreshCw size={14} />}
            >
              Regenerate
            </ClayButton>
          </div>

          <div className="space-y-2.5">
            {uuids.map((uuid, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3.5 rounded-[12px] border bg-stone-50 dark:bg-stone-900/60 font-mono text-sm"
                style={{ borderColor: 'var(--border)' }}
              >
                <span style={{ color: 'var(--ink)' }}>{uuid}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(uuid, i + 1)}
                  className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                  title="Copy"
                >
                  {copiedIndex === i + 1 ? (
                    <Check size={16} className="text-emerald-600" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {isHash && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Input Text
            </label>
            <input
              type="text"
              value={hashInput}
              onChange={(e) => handleHash(e.target.value)}
              placeholder="Enter text to calculate SHA-256 hash..."
              className="w-full p-3 text-sm rounded-[12px] border outline-none bg-stone-50 dark:bg-stone-900/60 font-mono"
              style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              SHA-256 Hash
            </label>
            <div className="flex items-center justify-between p-3.5 rounded-[12px] border bg-stone-100 dark:bg-stone-900/90 font-mono text-xs sm:text-sm break-all"
              style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
            >
              <span>{hashOutput || 'Hash will appear here...'}</span>
              {hashOutput && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(hashOutput, 99)}
                  className="ml-3 shrink-0 p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                >
                  {copiedIndex === 99 ? (
                    <Check size={16} className="text-emerald-600" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
