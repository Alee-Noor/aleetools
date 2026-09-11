'use client';

import { useState } from 'react';
import { Copy, Download, Check, AlertCircle, Sparkles, Minimize2 } from 'lucide-react';
import { ClayButton } from '@/components/ui/ClayButton';
import { formatJson, minifyJson } from '@/lib/engines/text-engine';
import type { Tool } from '@/lib/tool-registry';

interface JsonToolProps {
  tool: Tool;
}

export function JsonTool({ tool }: JsonToolProps) {
  const [input, setInput] = useState('{\n  "title": "Alee Tools",\n  "status": "online",\n  "count": 156,\n  "clientSide": true\n}');
  const [output, setOutput] = useState('');
  const [indent, setIndent] = useState<number>(2);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFormat = () => {
    setError(null);
    const res = formatJson(input, indent);
    if (res.isValid && res.formatted !== undefined) {
      setOutput(res.formatted);
    } else {
      setError(res.error || 'Invalid JSON format');
    }
  };

  const handleMinify = () => {
    setError(null);
    const res = minifyJson(input);
    if (res.isValid && res.formatted !== undefined) {
      setOutput(res.formatted);
    } else {
      setError(res.error || 'Invalid JSON format');
    }
  };

  const handleCopy = () => {
    const textToCopy = output || input;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const textToDownload = output || input;
    const blob = new Blob([textToDownload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <ClayButton
            onClick={handleFormat}
            variant="primary"
            size="sm"
            icon={<Sparkles size={14} />}
          >
            Format / Prettify
          </ClayButton>
          <ClayButton
            onClick={handleMinify}
            variant="outline"
            size="sm"
            icon={<Minimize2 size={14} />}
          >
            Minify (Compact)
          </ClayButton>
          <select
            value={indent}
            onChange={(e) => setIndent(Number(e.target.value))}
            className="px-2.5 py-1.5 text-xs rounded-[10px] border outline-none bg-transparent"
            style={{ borderColor: 'var(--border)' }}
          >
            <option value={2}>2 Spaces</option>
            <option value={4}>4 Spaces</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <ClayButton
            onClick={handleCopy}
            variant="outline"
            size="sm"
            icon={copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
          >
            {copied ? 'Copied!' : 'Copy'}
          </ClayButton>
          <ClayButton
            onClick={handleDownload}
            variant="outline"
            size="sm"
            icon={<Download size={14} />}
          >
            Save .json
          </ClayButton>
        </div>
      </div>

      {/* Editor panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            JSON Input
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={12}
            placeholder="Paste your raw JSON here..."
            className="w-full p-3.5 text-xs sm:text-sm font-mono rounded-[12px] border outline-none resize-y bg-stone-50 dark:bg-stone-900/60 leading-relaxed"
            style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
          />
        </div>

        {/* Output */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Formatted Output
          </label>
          <textarea
            readOnly
            value={output}
            rows={12}
            placeholder="Formatted or minified output will appear here..."
            className="w-full p-3.5 text-xs sm:text-sm font-mono rounded-[12px] border outline-none resize-y bg-stone-100/50 dark:bg-stone-900/90 leading-relaxed"
            style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
          />
        </div>
      </div>

      {/* Error alert if invalid JSON */}
      {error && (
        <div className="flex items-center gap-2 p-3.5 rounded-[12px] text-xs font-medium text-red-700 bg-red-50 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
