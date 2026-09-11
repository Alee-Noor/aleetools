'use client';

import { useState } from 'react';
import { Copy, Check, ArrowDownUp } from 'lucide-react';
import { ClayButton } from '@/components/ui/ClayButton';
import { encodeBase64, decodeBase64 } from '@/lib/engines/text-engine';
import type { Tool } from '@/lib/tool-registry';

interface Base64ToolProps {
  tool: Tool;
}

export function Base64Tool({ tool }: Base64ToolProps) {
  const isDecoder = tool.slug.includes('decode');
  const [mode, setMode] = useState<'encode' | 'decode'>(isDecoder ? 'decode' : 'encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleConvert = (textToConvert = input, currentMode = mode) => {
    setError(null);
    if (!textToConvert.trim()) {
      setOutput('');
      return;
    }

    if (currentMode === 'encode') {
      setOutput(encodeBase64(textToConvert));
    } else {
      const res = decodeBase64(textToConvert);
      if (res.success) {
        setOutput(res.result);
      } else {
        setError(res.error || 'Failed to decode Base64 string');
      }
    }
  };

  const handleSwitchMode = () => {
    const nextMode = mode === 'encode' ? 'decode' : 'encode';
    setMode(nextMode);
    setInput(output);
    handleConvert(output, nextMode);
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Mode Bar */}
      <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <ClayButton
            onClick={() => {
              setMode('encode');
              handleConvert(input, 'encode');
            }}
            variant={mode === 'encode' ? 'primary' : 'outline'}
            size="sm"
          >
            Encode to Base64
          </ClayButton>
          <ClayButton
            onClick={() => {
              setMode('decode');
              handleConvert(input, 'decode');
            }}
            variant={mode === 'decode' ? 'primary' : 'outline'}
            size="sm"
          >
            Decode Base64
          </ClayButton>
          <button
            type="button"
            onClick={handleSwitchMode}
            className="p-1.5 rounded-[10px] border text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
            title="Swap input and output"
            style={{ borderColor: 'var(--border)' }}
          >
            <ArrowDownUp size={16} />
          </button>
        </div>

        {output && (
          <ClayButton
            onClick={handleCopy}
            variant="outline"
            size="sm"
            icon={copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
          >
            {copied ? 'Copied!' : 'Copy'}
          </ClayButton>
        )}
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            {mode === 'encode' ? 'Plain Text' : 'Base64 Encoded Text'}
          </label>
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              handleConvert(e.target.value, mode);
            }}
            rows={10}
            placeholder={
              mode === 'encode'
                ? 'Type or paste plain text to encode...'
                : 'Paste Base64 string to decode...'
            }
            className="w-full p-3.5 text-xs sm:text-sm font-mono rounded-[12px] border outline-none resize-y bg-stone-50 dark:bg-stone-900/60 leading-relaxed"
            style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            {mode === 'encode' ? 'Base64 Output' : 'Decoded Text'}
          </label>
          <textarea
            readOnly
            value={output}
            rows={10}
            placeholder="Result will appear here in real time..."
            className="w-full p-3.5 text-xs sm:text-sm font-mono rounded-[12px] border outline-none resize-y bg-stone-100/50 dark:bg-stone-900/90 leading-relaxed"
            style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
          />
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-[12px] text-xs font-medium text-red-700 bg-red-50 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900">
          {error}
        </div>
      )}
    </div>
  );
}
