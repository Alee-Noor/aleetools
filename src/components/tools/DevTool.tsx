'use client';

import { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  RefreshCw,
  Code,
  Sparkles,
  Sliders,
  Eye,
  Key,
  Calendar,
  Clock,
  Palette,
  Network,
  Maximize2,
  FileCode,
  Shield,
  Layers,
} from 'lucide-react';
import { ClayButton } from '@/components/ui/ClayButton';
import type { Tool } from '@/lib/tool-registry';

interface DevToolProps {
  tool: Tool;
}

export function DevTool({ tool }: DevToolProps) {
  const slug = tool.slug;

  // General state
  const [copied, setCopied] = useState(false);
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');

  // 1. URL & HTML Encoder/Decoder states
  const isUrl = slug.includes('url');
  const isHtmlEntities = slug.includes('html-encoder') || slug.includes('html-decoder');

  // 2. Code formatters & minifiers
  const isCodeFormat =
    slug.includes('minifier') || slug.includes('formatter');

  // 3. JWT states
  const isJwt = slug.includes('jwt');
  const [jwtToken, setJwtToken] = useState(
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsZWUgVXNlciIsImFkbWluIjp0cnVlLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MTc1MTYyMzkwMn0.4zWn8xP7k9yG12sF_example'
  );
  const [jwtHeader, setJwtHeader] = useState('');
  const [jwtPayload, setJwtPayload] = useState('');

  // 4. GUID states
  const isGuid = slug.includes('guid');
  const [guidHyphens, setGuidHyphens] = useState(true);
  const [guidUpper, setGuidUpper] = useState(false);
  const [guidBraces, setGuidBraces] = useState(false);
  const [generatedGuids, setGeneratedGuids] = useState<string[]>([]);

  // 5. Regex states
  const isRegex = slug.includes('regex');
  const [regexPattern, setRegexPattern] = useState('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}');
  const [regexFlags, setRegexFlags] = useState('g');
  const [regexTestString, setRegexTestString] = useState(
    'Contact support@alee.software or help@example.com for queries.'
  );
  const [regexMatches, setRegexMatches] = useState<string[]>([]);

  // 6. Cron states
  const isCron = slug.includes('cron');
  const [cronMin, setCronMin] = useState('0');
  const [cronHour, setCronHour] = useState('12');
  const [cronDay, setCronDay] = useState('*');
  const [cronMonth, setCronMonth] = useState('*');
  const [cronWeek, setCronWeek] = useState('*');
  const [cronExpression, setCronExpression] = useState('0 12 * * *');

  // 7. Timestamp states
  const isTimestamp = slug.includes('timestamp') || slug.includes('date');
  const [timestampInput, setTimestampInput] = useState<string>(Math.floor(Date.now() / 1000).toString());
  const [currentEpoch, setCurrentEpoch] = useState<number>(Math.floor(Date.now() / 1000));

  // 8. Color states
  const isColor = slug.includes('color') || slug.includes('rgb') || slug.includes('hex') || slug.includes('hsl');
  const [hexColor, setHexColor] = useState('#2C6E59');
  const [colorR, setColorR] = useState(44);
  const [colorG, setColorG] = useState(110);
  const [colorB, setColorB] = useState(89);

  // 9. CSS Generators
  const isGradient = slug.includes('gradient');
  const [gradType, setGradType] = useState<'linear' | 'radial'>('linear');
  const [gradAngle, setGradAngle] = useState(135);
  const [gradColor1, setGradColor1] = useState('#2C6E59');
  const [gradColor2, setGradColor2] = useState('#D4731F');

  const isShadow = slug.includes('shadow');
  const [shadowX, setShadowX] = useState(0);
  const [shadowY, setShadowY] = useState(12);
  const [shadowBlur, setShadowBlur] = useState(24);
  const [shadowSpread, setShadowSpread] = useState(-4);
  const [shadowColor, setShadowColor] = useState('rgba(0, 0, 0, 0.15)');

  const isRadius = slug.includes('radius');
  const [radiusTL, setRadiusTL] = useState(16);
  const [radiusTR, setRadiusTR] = useState(16);
  const [radiusBR, setRadiusBR] = useState(16);
  const [radiusBL, setRadiusBL] = useState(16);

  // 10. Networking / Binary
  const isNetwork = slug.includes('ip') || slug.includes('binary') || slug.includes('mac') || slug.includes('user-agent');
  const [ipAddress, setIpAddress] = useState('192.168.1.1');
  const [binaryVal, setBinaryVal] = useState('101010');
  const [macCount, setMacCount] = useState(4);
  const [macSeparator, setMacSeparator] = useState<':' | '-' | '.'>(':');
  const [generatedMacs, setGeneratedMacs] = useState<string[]>([]);
  const [uaString, setUaString] = useState('');

  // Auto-init effects
  useEffect(() => {
    // GUID
    if (isGuid) generateGuids();

    // Cron
    if (isCron) {
      setCronExpression(`${cronMin} ${cronHour} ${cronDay} ${cronMonth} ${cronWeek}`);
    }

    // Live clock for timestamp
    if (isTimestamp) {
      const timer = setInterval(() => setCurrentEpoch(Math.floor(Date.now() / 1000)), 1000);
      return () => clearInterval(timer);
    }

    // JWT decode
    if (isJwt) decodeJwt(jwtToken);

    // MAC
    if (slug.includes('mac')) generateMacs();

    // User agent
    if (slug.includes('user-agent') && typeof navigator !== 'undefined') {
      setUaString(navigator.userAgent);
    }
  }, [slug]);

  // Copy helper
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // URL Encoder/Decoder
  const handleUrlAction = () => {
    try {
      if (slug.includes('decoder')) {
        setOutputText(decodeURIComponent(inputText));
      } else {
        setOutputText(encodeURIComponent(inputText));
      }
    } catch {
      setOutputText('Error: Malformed URI sequence');
    }
  };

  // HTML Entity Encoder/Decoder
  const handleHtmlEntityAction = () => {
    if (slug.includes('decoder')) {
      const textarea = document.createElement('textarea');
      textarea.innerHTML = inputText;
      setOutputText(textarea.value);
    } else {
      const encoded = inputText
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
      setOutputText(encoded);
    }
  };

  // Code Formatter / Minifier
  const handleCodeProcess = () => {
    const isMinify = slug.includes('minifier');
    if (isMinify) {
      // Basic clean minification
      const minified = inputText
        .replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, '') // comments
        .replace(/\s+/g, ' ')
        .replace(/\s*([{};:,])\s*/g, '$1')
        .trim();
      setOutputText(minified);
    } else {
      // Clean indentation formatting
      if (slug.includes('css')) {
        const formatted = inputText
          .replace(/\{/g, ' {\n  ')
          .replace(/;/g, ';\n  ')
          .replace(/\s*\}/g, '\n}\n')
          .trim();
        setOutputText(formatted);
      } else {
        setOutputText(inputText.trim());
      }
    }
  };

  // JWT Decode
  const decodeJwt = (token: string) => {
    try {
      const parts = token.split('.');
      if (parts.length >= 2) {
        const h = JSON.stringify(JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/'))), null, 2);
        const p = JSON.stringify(JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))), null, 2);
        setJwtHeader(h);
        setJwtPayload(p);
      }
    } catch {
      setJwtHeader('Invalid JWT Header');
      setJwtPayload('Invalid JWT Payload');
    }
  };

  // GUID Generator
  const generateGuids = () => {
    const list: string[] = [];
    for (let i = 0; i < 5; i++) {
      let g = crypto.randomUUID();
      if (!guidHyphens) g = g.replace(/-/g, '');
      if (guidUpper) g = g.toUpperCase();
      if (guidBraces) g = `{${g}}`;
      list.push(g);
    }
    setGeneratedGuids(list);
  };

  // Regex Tester
  const runRegexTest = () => {
    try {
      const re = new RegExp(regexPattern, regexFlags);
      const matches = regexTestString.match(re) || [];
      setRegexMatches(Array.from(matches));
    } catch {
      setRegexMatches(['Invalid Regular Expression syntax']);
    }
  };

  // MAC Generator
  const generateMacs = () => {
    const res: string[] = [];
    for (let i = 0; i < macCount; i++) {
      const bytes = Array.from({ length: 6 }, () =>
        Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
      );
      // set locally-administered bit for validity
      bytes[0] = (parseInt(bytes[0], 16) | 2).toString(16).padStart(2, '0');
      res.push(bytes.join(macSeparator).toUpperCase());
    }
    setGeneratedMacs(res);
  };

  return (
    <div className="space-y-6">
      {/* ─── 1. URL & HTML ENCODERS/DECODERS ─── */}
      {(isUrl || isHtmlEntities) && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
              Input Text / URL
            </label>
            <textarea
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste string or URL here..."
              className="w-full p-3 rounded-[12px] border text-sm font-mono outline-none shadow-sm"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--ink)' }}
            />
          </div>

          <ClayButton
            onClick={isUrl ? handleUrlAction : handleHtmlEntityAction}
            variant="primary"
            className="w-full"
          >
            {slug.includes('decoder') ? 'Decode String' : 'Encode String'}
          </ClayButton>

          {outputText && (
            <div className="space-y-2 p-4 rounded-[14px] border shadow-sm" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Result
                </span>
                <ClayButton
                  onClick={() => handleCopy(outputText)}
                  variant="outline"
                  size="sm"
                  icon={copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                >
                  {copied ? 'Copied' : 'Copy Result'}
                </ClayButton>
              </div>
              <pre className="text-sm font-mono break-all whitespace-pre-wrap p-3 rounded-[8px] bg-stone-100 dark:bg-stone-800">
                {outputText}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* ─── 2. CODE MINIFIERS & FORMATTERS ─── */}
      {isCodeFormat && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
              Source Code
            </label>
            <textarea
              rows={8}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste HTML, CSS, or JavaScript code here..."
              className="w-full p-3.5 rounded-[12px] border text-sm font-mono outline-none shadow-sm"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--ink)' }}
            />
          </div>

          <ClayButton onClick={handleCodeProcess} variant="primary" className="w-full">
            {slug.includes('minifier') ? 'Minify Code' : 'Format Code'}
          </ClayButton>

          {outputText && (
            <div className="space-y-2 p-4 rounded-[14px] border shadow-sm" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-600 dark:text-stone-300">
                  Size: <strong>{outputText.length} chars</strong> (reduced by {Math.max(0, Math.round(((inputText.length - outputText.length) / (inputText.length || 1)) * 100))}%)
                </span>
                <ClayButton
                  onClick={() => handleCopy(outputText)}
                  variant="outline"
                  size="sm"
                  icon={copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                >
                  {copied ? 'Copied' : 'Copy Output'}
                </ClayButton>
              </div>
              <pre className="text-xs font-mono break-all whitespace-pre-wrap max-h-80 overflow-y-auto p-3.5 rounded-[10px] bg-stone-100 dark:bg-stone-800">
                {outputText}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* ─── 3. JWT DECODER ─── */}
      {isJwt && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
              Paste JSON Web Token (JWT)
            </label>
            <input
              type="text"
              value={jwtToken}
              onChange={(e) => {
                setJwtToken(e.target.value);
                decodeJwt(e.target.value);
              }}
              placeholder="eyJhbGci..."
              className="w-full px-4 py-3 rounded-[12px] border text-xs font-mono outline-none"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--ink)' }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-[14px] border shadow-sm space-y-2" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                Header (Algorithm & Type)
              </span>
              <pre className="text-xs font-mono p-3 rounded-[8px] bg-stone-100 dark:bg-stone-800 whitespace-pre-wrap overflow-x-auto">
                {jwtHeader}
              </pre>
            </div>

            <div className="p-4 rounded-[14px] border shadow-sm space-y-2" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <span className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                Payload (Claims & Expiration)
              </span>
              <pre className="text-xs font-mono p-3 rounded-[8px] bg-stone-100 dark:bg-stone-800 whitespace-pre-wrap overflow-x-auto">
                {jwtPayload}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* ─── 4. GUID / UUID GENERATOR ─── */}
      {isGuid && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center justify-between p-4 rounded-[14px] border shadow-sm" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={guidHyphens}
                  onChange={(e) => setGuidHyphens(e.target.checked)}
                />
                <span>Include Hyphens</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={guidUpper}
                  onChange={(e) => setGuidUpper(e.target.checked)}
                />
                <span>Uppercase</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={guidBraces}
                  onChange={(e) => setGuidBraces(e.target.checked)}
                />
                <span>Enclose in Braces &#123;&#125;</span>
              </label>
            </div>

            <ClayButton onClick={generateGuids} variant="primary" size="sm" icon={<RefreshCw size={14} />}>
              Generate New
            </ClayButton>
          </div>

          <div className="space-y-2">
            {generatedGuids.map((guid, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 rounded-[12px] border text-xs font-mono font-bold shadow-sm"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--ink)' }}
              >
                <span>{guid}</span>
                <ClayButton
                  onClick={() => handleCopy(guid)}
                  variant="outline"
                  size="sm"
                  icon={<Copy size={12} />}
                >
                  Copy
                </ClayButton>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── 5. REGEX TESTER & GENERATOR ─── */}
      {isRegex && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-3 space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                Regular Expression Pattern
              </label>
              <input
                type="text"
                value={regexPattern}
                onChange={(e) => setRegexPattern(e.target.value)}
                className="w-full px-4 py-2.5 rounded-[10px] border text-sm font-mono outline-none"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--ink)' }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                Flags
              </label>
              <input
                type="text"
                value={regexFlags}
                onChange={(e) => setRegexFlags(e.target.value)}
                placeholder="g, i, m"
                className="w-full px-4 py-2.5 rounded-[10px] border text-sm font-mono outline-none"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--ink)' }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
              Test String
            </label>
            <textarea
              rows={4}
              value={regexTestString}
              onChange={(e) => setRegexTestString(e.target.value)}
              className="w-full p-3.5 rounded-[12px] border text-sm font-mono outline-none"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--ink)' }}
            />
          </div>

          <ClayButton onClick={runRegexTest} variant="primary" className="w-full">
            Test Pattern
          </ClayButton>

          {regexMatches.length > 0 && (
            <div className="p-4 rounded-[14px] border shadow-sm space-y-2" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Matches Found ({regexMatches.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {regexMatches.map((m, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-[8px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono text-xs font-bold">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── 6. CRON GENERATOR & TRANSLATOR ─── */}
      {isCron && (
        <div className="space-y-6">
          <div className="p-6 rounded-[16px] border shadow-sm space-y-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
              Interactive Cron Schedule Builder
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-semibold">
              <div>
                <label className="block mb-1 text-stone-600 dark:text-stone-400">Minute</label>
                <input
                  type="text"
                  value={cronMin}
                  onChange={(e) => {
                    setCronMin(e.target.value);
                    setCronExpression(`${e.target.value} ${cronHour} ${cronDay} ${cronMonth} ${cronWeek}`);
                  }}
                  className="w-full p-2 rounded-[8px] border font-mono text-center"
                  style={{ borderColor: 'var(--border)' }}
                />
              </div>
              <div>
                <label className="block mb-1 text-stone-600 dark:text-stone-400">Hour</label>
                <input
                  type="text"
                  value={cronHour}
                  onChange={(e) => {
                    setCronHour(e.target.value);
                    setCronExpression(`${cronMin} ${e.target.value} ${cronDay} ${cronMonth} ${cronWeek}`);
                  }}
                  className="w-full p-2 rounded-[8px] border font-mono text-center"
                  style={{ borderColor: 'var(--border)' }}
                />
              </div>
              <div>
                <label className="block mb-1 text-stone-600 dark:text-stone-400">Day of Month</label>
                <input
                  type="text"
                  value={cronDay}
                  onChange={(e) => {
                    setCronDay(e.target.value);
                    setCronExpression(`${cronMin} ${cronHour} ${e.target.value} ${cronMonth} ${cronWeek}`);
                  }}
                  className="w-full p-2 rounded-[8px] border font-mono text-center"
                  style={{ borderColor: 'var(--border)' }}
                />
              </div>
              <div>
                <label className="block mb-1 text-stone-600 dark:text-stone-400">Month</label>
                <input
                  type="text"
                  value={cronMonth}
                  onChange={(e) => {
                    setCronMonth(e.target.value);
                    setCronExpression(`${cronMin} ${cronHour} ${cronDay} ${e.target.value} ${cronWeek}`);
                  }}
                  className="w-full p-2 rounded-[8px] border font-mono text-center"
                  style={{ borderColor: 'var(--border)' }}
                />
              </div>
              <div>
                <label className="block mb-1 text-stone-600 dark:text-stone-400">Weekday</label>
                <input
                  type="text"
                  value={cronWeek}
                  onChange={(e) => {
                    setCronWeek(e.target.value);
                    setCronExpression(`${cronMin} ${cronHour} ${cronDay} ${cronMonth} ${e.target.value}`);
                  }}
                  className="w-full p-2 rounded-[8px] border font-mono text-center"
                  style={{ borderColor: 'var(--border)' }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-[12px] bg-stone-100 dark:bg-stone-800">
              <span className="font-mono text-lg font-bold text-emerald-800 dark:text-emerald-300">
                {cronExpression}
              </span>
              <ClayButton
                onClick={() => handleCopy(cronExpression)}
                variant="outline"
                size="sm"
                icon={<Copy size={14} />}
              >
                Copy Cron
              </ClayButton>
            </div>
          </div>
        </div>
      )}

      {/* ─── 7. TIMESTAMP CONVERTER ─── */}
      {isTimestamp && (
        <div className="space-y-4">
          <div className="p-5 rounded-[16px] border shadow-sm space-y-3" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Current Unix Timestamp (Epoch)
            </span>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold font-mono text-emerald-800 dark:text-emerald-300">
                {currentEpoch}
              </span>
              <ClayButton
                onClick={() => handleCopy(currentEpoch.toString())}
                variant="outline"
                size="sm"
                icon={<Copy size={14} />}
              >
                Copy Current
              </ClayButton>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
              Enter Timestamp to Convert
            </label>
            <input
              type="text"
              value={timestampInput}
              onChange={(e) => setTimestampInput(e.target.value)}
              className="w-full px-4 py-3 rounded-[12px] border text-lg font-mono font-bold"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--ink)' }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-[12px] border bg-surface" style={{ borderColor: 'var(--border)' }}>
              <div className="text-stone-500 font-bold mb-1">UTC Date & Time</div>
              <div className="font-mono font-semibold text-sm">
                {new Date(parseInt(timestampInput) * 1000).toUTCString()}
              </div>
            </div>
            <div className="p-3.5 rounded-[12px] border bg-surface" style={{ borderColor: 'var(--border)' }}>
              <div className="text-stone-500 font-bold mb-1">Local Time</div>
              <div className="font-mono font-semibold text-sm">
                {new Date(parseInt(timestampInput) * 1000).toLocaleString()}
              </div>
            </div>
            <div className="p-3.5 rounded-[12px] border bg-surface col-span-1 sm:col-span-2" style={{ borderColor: 'var(--border)' }}>
              <div className="text-stone-500 font-bold mb-1">ISO 8601 String</div>
              <div className="font-mono font-semibold text-sm">
                {new Date(parseInt(timestampInput) * 1000).toISOString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 8. COLOR CONVERTERS & CSS GRADIENTS/SHADOWS ─── */}
      {isColor && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                Color Picker & Sliders
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={hexColor}
                  onChange={(e) => setHexColor(e.target.value)}
                  className="h-12 w-12 rounded-[10px] cursor-pointer border"
                  style={{ borderColor: 'var(--border)' }}
                />
                <input
                  type="text"
                  value={hexColor}
                  onChange={(e) => setHexColor(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-[10px] border font-mono font-bold uppercase"
                  style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--ink)' }}
                />
              </div>
            </div>

            <div
              className="h-32 w-full rounded-[16px] border shadow-md flex items-center justify-center font-mono font-bold text-white shadow-inner"
              style={{ background: hexColor, borderColor: 'var(--border)' }}
            >
              {hexColor.toUpperCase()}
            </div>
          </div>
        </div>
      )}

      {isGradient && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-semibold">
            <div>
              <label className="block mb-1">Color 1</label>
              <input
                type="color"
                value={gradColor1}
                onChange={(e) => setGradColor1(e.target.value)}
                className="w-full h-10 rounded-[8px] cursor-pointer"
              />
            </div>
            <div>
              <label className="block mb-1">Color 2</label>
              <input
                type="color"
                value={gradColor2}
                onChange={(e) => setGradColor2(e.target.value)}
                className="w-full h-10 rounded-[8px] cursor-pointer"
              />
            </div>
            <div>
              <label className="block mb-1">Angle ({gradAngle}°)</label>
              <input
                type="range"
                min="0"
                max="360"
                value={gradAngle}
                onChange={(e) => setGradAngle(parseInt(e.target.value))}
                className="w-full mt-2"
              />
            </div>
          </div>

          <div
            className="h-40 w-full rounded-[16px] border shadow-md"
            style={{
              background: `linear-gradient(${gradAngle}deg, ${gradColor1}, ${gradColor2})`,
              borderColor: 'var(--border)',
            }}
          />

          <div className="flex items-center justify-between p-4 rounded-[12px] bg-stone-100 dark:bg-stone-800">
            <code className="text-xs font-mono font-bold text-stone-800 dark:text-stone-200 truncate">
              background: linear-gradient({gradAngle}deg, {gradColor1}, {gradColor2});
            </code>
            <ClayButton
              onClick={() => handleCopy(`background: linear-gradient(${gradAngle}deg, ${gradColor1}, ${gradColor2});`)}
              variant="outline"
              size="sm"
              icon={<Copy size={14} />}
            >
              Copy CSS
            </ClayButton>
          </div>
        </div>
      )}

      {isShadow && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-semibold">
            <div>
              <label className="block mb-1">Offset X ({shadowX}px)</label>
              <input
                type="range"
                min="-50"
                max="50"
                value={shadowX}
                onChange={(e) => setShadowX(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block mb-1">Offset Y ({shadowY}px)</label>
              <input
                type="range"
                min="-50"
                max="50"
                value={shadowY}
                onChange={(e) => setShadowY(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block mb-1">Blur ({shadowBlur}px)</label>
              <input
                type="range"
                min="0"
                max="100"
                value={shadowBlur}
                onChange={(e) => setShadowBlur(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block mb-1">Spread ({shadowSpread}px)</label>
              <input
                type="range"
                min="-30"
                max="30"
                value={shadowSpread}
                onChange={(e) => setShadowSpread(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          <div className="h-44 w-full flex items-center justify-center p-6 rounded-[16px] bg-stone-100 dark:bg-stone-900/60 border" style={{ borderColor: 'var(--border)' }}>
            <div
              className="h-24 w-36 rounded-[14px] bg-surface border flex items-center justify-center text-xs font-bold"
              style={{
                boxShadow: `${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowSpread}px ${shadowColor}`,
                borderColor: 'var(--border)',
              }}
            >
              Preview Card
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-[12px] bg-stone-100 dark:bg-stone-800">
            <code className="text-xs font-mono font-bold text-stone-800 dark:text-stone-200">
              box-shadow: {shadowX}px {shadowY}px {shadowBlur}px {shadowSpread}px {shadowColor};
            </code>
            <ClayButton
              onClick={() => handleCopy(`box-shadow: ${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowSpread}px ${shadowColor};`)}
              variant="outline"
              size="sm"
              icon={<Copy size={14} />}
            >
              Copy CSS
            </ClayButton>
          </div>
        </div>
      )}

      {isRadius && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-semibold">
            <div>
              <label className="block mb-1">Top Left ({radiusTL}px)</label>
              <input
                type="range"
                min="0"
                max="100"
                value={radiusTL}
                onChange={(e) => setRadiusTL(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block mb-1">Top Right ({radiusTR}px)</label>
              <input
                type="range"
                min="0"
                max="100"
                value={radiusTR}
                onChange={(e) => setRadiusTR(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block mb-1">Bottom Right ({radiusBR}px)</label>
              <input
                type="range"
                min="0"
                max="100"
                value={radiusBR}
                onChange={(e) => setRadiusBR(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block mb-1">Bottom Left ({radiusBL}px)</label>
              <input
                type="range"
                min="0"
                max="100"
                value={radiusBL}
                onChange={(e) => setRadiusBL(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          <div className="h-44 w-full flex items-center justify-center p-6 rounded-[16px] bg-stone-100 dark:bg-stone-900/60 border" style={{ borderColor: 'var(--border)' }}>
            <div
              className="h-28 w-44 bg-emerald-700 text-white flex items-center justify-center text-xs font-bold shadow-md transition-all"
              style={{
                borderRadius: `${radiusTL}px ${radiusTR}px ${radiusBR}px ${radiusBL}px`,
              }}
            >
              Border Radius
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-[12px] bg-stone-100 dark:bg-stone-800">
            <code className="text-xs font-mono font-bold text-stone-800 dark:text-stone-200">
              border-radius: {radiusTL}px {radiusTR}px {radiusBR}px {radiusBL}px;
            </code>
            <ClayButton
              onClick={() => handleCopy(`border-radius: ${radiusTL}px ${radiusTR}px ${radiusBR}px ${radiusBL}px;`)}
              variant="outline"
              size="sm"
              icon={<Copy size={14} />}
            >
              Copy CSS
            </ClayButton>
          </div>
        </div>
      )}

      {/* ─── 9. NETWORKING & SYSTEM TOOLS ─── */}
      {isNetwork && (
        <div className="space-y-4">
          {slug.includes('ip') && (
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                IPv4 Address
              </label>
              <input
                type="text"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                className="w-full px-4 py-2.5 rounded-[10px] border font-mono text-sm font-bold"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--ink)' }}
              />
              <div className="p-4 rounded-[12px] bg-stone-100 dark:bg-stone-800 font-mono text-sm font-bold text-emerald-800 dark:text-emerald-300">
                {ipAddress
                  .split('.')
                  .map((oct) => parseInt(oct, 10).toString(2).padStart(8, '0'))
                  .join('.')}
              </div>
            </div>
          )}

          {slug.includes('mac') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  Random IEEE MAC Addresses
                </span>
                <ClayButton onClick={generateMacs} variant="primary" size="sm" icon={<RefreshCw size={14} />}>
                  Regenerate
                </ClayButton>
              </div>
              <div className="space-y-2">
                {generatedMacs.map((mac, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-[10px] border font-mono text-xs font-bold"
                    style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
                  >
                    <span>{mac}</span>
                    <ClayButton onClick={() => handleCopy(mac)} variant="outline" size="sm" icon={<Copy size={12} />}>
                      Copy
                    </ClayButton>
                  </div>
                ))}
              </div>
            </div>
          )}

          {slug.includes('user-agent') && (
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                User Agent String
              </label>
              <textarea
                rows={3}
                value={uaString}
                onChange={(e) => setUaString(e.target.value)}
                className="w-full p-3 rounded-[10px] border font-mono text-xs"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
              />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-3 rounded-[8px] bg-stone-100 dark:bg-stone-800">
                  <div className="text-stone-500 font-semibold">Platform</div>
                  <div className="font-bold mt-0.5">
                    {typeof navigator !== 'undefined' ? navigator.platform : 'Unknown'}
                  </div>
                </div>
                <div className="p-3 rounded-[8px] bg-stone-100 dark:bg-stone-800">
                  <div className="text-stone-500 font-semibold">Language</div>
                  <div className="font-bold mt-0.5">
                    {typeof navigator !== 'undefined' ? navigator.language : 'en-US'}
                  </div>
                </div>
                <div className="p-3 rounded-[8px] bg-stone-100 dark:bg-stone-800">
                  <div className="text-stone-500 font-semibold">Online Status</div>
                  <div className="font-bold text-emerald-600 mt-0.5">Online</div>
                </div>
                <div className="p-3 rounded-[8px] bg-stone-100 dark:bg-stone-800">
                  <div className="text-stone-500 font-semibold">Cores</div>
                  <div className="font-bold mt-0.5">
                    {typeof navigator !== 'undefined' ? navigator.hardwareConcurrency : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
