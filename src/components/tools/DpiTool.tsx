'use client';

import { useState, useRef, type ChangeEvent } from 'react';
import {
  UploadCloud,
  Sliders,
  Printer,
  Sparkles,
  Download,
  Info,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Maximize,
} from 'lucide-react';
import { ClayButton } from '@/components/ui/ClayButton';
import type { Tool } from '@/lib/tool-registry';

interface DpiToolProps {
  tool: Tool;
}

const COMMON_PRINT_SIZES = [
  { label: '4 × 6 in (Wallet/Snapshot)', wIn: 4, hIn: 6 },
  { label: '5 × 7 in (Framed Photo)', wIn: 5, hIn: 7 },
  { label: '8 × 10 in (Portrait)', wIn: 8, hIn: 10 },
  { label: '8.5 × 11 in (US Letter)', wIn: 8.5, hIn: 11 },
  { label: 'A4 (210 × 297 mm)', wIn: 8.27, hIn: 11.69 },
  { label: 'A3 (297 × 420 mm)', wIn: 11.69, hIn: 16.54 },
  { label: '11 × 14 in (Small Poster)', wIn: 11, hIn: 14 },
  { label: '16 × 20 in (Gallery Print)', wIn: 16, hIn: 20 },
  { label: '18 × 24 in (Medium Poster)', wIn: 18, hIn: 24 },
  { label: '24 × 36 in (Full Poster)', wIn: 24, hIn: 36 },
];

export function DpiTool({ tool }: DpiToolProps) {
  // Image Dimensions in Pixels
  const [pixelWidth, setPixelWidth] = useState<number>(3000);
  const [pixelHeight, setPixelHeight] = useState<number>(2000);

  // Target DPI
  const [targetDpi, setTargetDpi] = useState<number>(300);

  // Custom Print Size (Inches)
  const [printWidthIn, setPrintWidthIn] = useState<number>(10);
  const [printHeightIn, setPrintHeightIn] = useState<number>(6.67);
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');

  // Active Tab
  const [mode, setMode] = useState<'calcDpi' | 'calcSize'>('calcSize');

  // File Upload State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculations
  // Mode: Given Pixels + Target DPI -> Calculate Max Print Size
  const calcPrintWidthIn = pixelWidth / (targetDpi || 1);
  const calcPrintHeightIn = pixelHeight / (targetDpi || 1);

  const calcPrintWidthCm = calcPrintWidthIn * 2.54;
  const calcPrintHeightCm = calcPrintHeightIn * 2.54;

  // Mode: Given Pixels + Target Print Size -> Calculate Resulting DPI
  const effectivePrintWIn = unit === 'cm' ? printWidthIn / 2.54 : printWidthIn;
  const effectivePrintHIn = unit === 'cm' ? printHeightIn / 2.54 : printHeightIn;

  const calculatedDpiW = Math.round(pixelWidth / (effectivePrintWIn || 1));
  const calculatedDpiH = Math.round(pixelHeight / (effectivePrintHIn || 1));
  const avgCalculatedDpi = Math.round((calculatedDpiW + calculatedDpiH) / 2);

  // Quality Assessment
  const evalDpi = mode === 'calcSize' ? targetDpi : avgCalculatedDpi;
  let qualityBadge = {
    label: 'Optimal Print Quality (300+ DPI)',
    color: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
    desc: 'Razor-sharp, commercial lab & photographic print quality.',
  };
  if (evalDpi < 150) {
    qualityBadge = {
      label: 'Low / Pixelated (<150 DPI)',
      color: 'bg-rose-500/15 text-rose-500 border-rose-500/30',
      desc: 'Pixelation and blurriness will likely be visible when viewed up close.',
    };
  } else if (evalDpi < 240) {
    qualityBadge = {
      label: 'Acceptable / Good (150-239 DPI)',
      color: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
      desc: 'Suitable for canvas, billboards, or viewing from an arm’s length away.',
    };
  } else if (evalDpi >= 600) {
    qualityBadge = {
      label: 'Ultra High-Res / Archival (600+ DPI)',
      color: 'bg-indigo-500/15 text-indigo-500 border-indigo-500/30',
      desc: 'Museum-grade, fine-art giclée detail exceeding standard print resolution.',
    };
  }

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);

    const img = new Image();
    img.onload = () => {
      setPixelWidth(img.naturalWidth);
      setPixelHeight(img.naturalHeight);
      // Auto compute default 300 DPI print sizes
      const wIn = Number((img.naturalWidth / 300).toFixed(2));
      const hIn = Number((img.naturalHeight / 300).toFixed(2));
      setPrintWidthIn(wIn);
      setPrintHeightIn(hIn);
    };
    img.src = url;
  };

  const handleDownloadWithDpi = () => {
    if (!imagePreview) return;
    const canvas = document.createElement('canvas');
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, pixelWidth, pixelHeight);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const baseName = imageFile ? imageFile.name.replace(/\.[^/.]+$/, '') : 'image';
        a.download = `${baseName}-${targetDpi}dpi.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 'image/jpeg', 0.95);
    };
    img.src = imagePreview;
  };

  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      <div className="flex flex-wrap gap-2 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={() => setMode('calcSize')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
            mode === 'calcSize'
              ? 'bg-emerald-500 text-white shadow-md'
              : 'text-stone-700 hover:bg-stone-200/50 dark:text-stone-300 dark:hover:bg-stone-800/50'
          }`}
        >
          <Printer className="h-4 w-4" />
          Find Max Print Size from Target DPI
        </button>
        <button
          onClick={() => setMode('calcDpi')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
            mode === 'calcDpi'
              ? 'bg-emerald-500 text-white shadow-md'
              : 'text-stone-700 hover:bg-stone-200/50 dark:text-stone-300 dark:hover:bg-stone-800/50'
          }`}
        >
          <Sliders className="h-4 w-4" />
          Calculate DPI from Print Dimensions
        </button>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Inputs & File Drop */}
        <div className="space-y-5 lg:col-span-6">
          {/* Image Upload Box */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all hover:border-emerald-500"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--surface)',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            {imagePreview ? (
              <div className="flex flex-col items-center gap-3">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-36 rounded-lg object-contain shadow-sm"
                />
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {imageFile?.name} ({pixelWidth} × {pixelHeight} px) — Click to swap
                </p>
              </div>
            ) : (
              <>
                <UploadCloud className="mb-2 h-8 w-8 text-stone-400 group-hover:text-emerald-500 transition-colors" />
                <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
                  Drop an image here to auto-detect pixel dimensions
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  PNG, JPG, WebP supported. Or type dimensions manually below.
                </p>
              </>
            )}
          </div>

          {/* Pixel Dimensions Inputs */}
          <div className="rounded-2xl border p-5 shadow-sm" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              1. Image Resolution (Pixels)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-stone-700 dark:text-stone-300">
                  WIDTH (PX)
                </label>
                <input
                  type="number"
                  min={1}
                  value={pixelWidth || ''}
                  onChange={(e) => setPixelWidth(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full rounded-xl border px-3.5 py-2.5 text-base font-semibold font-mono shadow-sm transition-all focus:border-emerald-500 focus:outline-none"
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--ink)',
                  }}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-stone-700 dark:text-stone-300">
                  HEIGHT (PX)
                </label>
                <input
                  type="number"
                  min={1}
                  value={pixelHeight || ''}
                  onChange={(e) => setPixelHeight(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full rounded-xl border px-3.5 py-2.5 text-base font-semibold font-mono shadow-sm transition-all focus:border-emerald-500 focus:outline-none"
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--ink)',
                  }}
                />
              </div>
            </div>
            <p className="mt-2 text-xs text-stone-500">
              Total Pixels: {((pixelWidth * pixelHeight) / 1_000_000).toFixed(2)} MP
            </p>
          </div>

          {/* Mode 1: Target DPI Configuration */}
          {mode === 'calcSize' ? (
            <div className="rounded-2xl border p-5 shadow-sm" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                2. Target Print DPI (Dots Per Inch)
              </h3>
              <div className="mb-4 flex flex-wrap gap-2">
                {[
                  { dpi: 72, label: '72 DPI (Screen)' },
                  { dpi: 150, label: '150 DPI (Good)' },
                  { dpi: 300, label: '300 DPI (Standard Print)' },
                  { dpi: 600, label: '600 DPI (Fine Art)' },
                ].map((item) => (
                  <button
                    key={item.dpi}
                    type="button"
                    onClick={() => setTargetDpi(item.dpi)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      targetDpi === item.dpi
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'border bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                    }`}
                    style={{ borderColor: 'var(--border)' }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min={10}
                max={2400}
                value={targetDpi || ''}
                onChange={(e) => setTargetDpi(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full rounded-xl border px-3.5 py-2.5 text-base font-semibold font-mono shadow-sm focus:border-emerald-500 focus:outline-none"
                style={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  color: 'var(--ink)',
                }}
              />
            </div>
          ) : (
            /* Mode 2: Physical Print Size Configuration */
            <div className="rounded-2xl border p-5 shadow-sm" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  2. Desired Physical Print Dimensions
                </h3>
                <div className="flex gap-1 rounded-lg border p-0.5" style={{ borderColor: 'var(--border)' }}>
                  <button
                    type="button"
                    onClick={() => setUnit('inches')}
                    className={`px-2 py-0.5 text-xs font-bold rounded ${
                      unit === 'inches' ? 'bg-emerald-500 text-white' : 'text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    Inches
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnit('cm')}
                    className={`px-2 py-0.5 text-xs font-bold rounded ${
                      unit === 'cm' ? 'bg-emerald-500 text-white' : 'text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    CM
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-stone-700 dark:text-stone-300">
                    PRINT WIDTH ({unit.toUpperCase()})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min={0.1}
                    value={printWidthIn || ''}
                    onChange={(e) => setPrintWidthIn(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border px-3.5 py-2.5 text-base font-semibold font-mono shadow-sm focus:border-emerald-500 focus:outline-none"
                    style={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                      color: 'var(--ink)',
                    }}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-stone-700 dark:text-stone-300">
                    PRINT HEIGHT ({unit.toUpperCase()})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min={0.1}
                    value={printHeightIn || ''}
                    onChange={(e) => setPrintHeightIn(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border px-3.5 py-2.5 text-base font-semibold font-mono shadow-sm focus:border-emerald-500 focus:outline-none"
                    style={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                      color: 'var(--ink)',
                    }}
                  />
                </div>
              </div>

              {/* Quick Presets */}
              <div className="mt-4">
                <p className="text-xs font-bold text-stone-500 mb-2">Standard Sizes:</p>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_PRINT_SIZES.slice(0, 5).map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => {
                        if (unit === 'cm') {
                          setPrintWidthIn(Number((s.wIn * 2.54).toFixed(1)));
                          setPrintHeightIn(Number((s.hIn * 2.54).toFixed(1)));
                        } else {
                          setPrintWidthIn(s.wIn);
                          setPrintHeightIn(s.hIn);
                        }
                      }}
                      className="rounded border px-2.5 py-1 text-[11px] font-medium transition-colors hover:border-emerald-500"
                      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Calculated Results & Quality Assessment */}
        <div className="space-y-5 lg:col-span-6">
          <div
            className="rounded-2xl border p-6 shadow-md"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Calculation Output
              </span>
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${qualityBadge.color}`}>
                <CheckCircle2 className="h-3.5 w-3.5" />
                {qualityBadge.label}
              </span>
            </div>

            {mode === 'calcSize' ? (
              <div>
                <p className="text-xs font-semibold text-stone-500 mb-1">
                  MAXIMUM PRINT SIZE AT {targetDpi} DPI:
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold font-mono" style={{ color: 'var(--ink)' }}>
                    {calcPrintWidthIn.toFixed(2)}″ × {calcPrintHeightIn.toFixed(2)}″
                  </span>
                  <span className="text-sm font-bold text-stone-500">inches</span>
                </div>
                <div className="mt-2 text-lg font-bold text-stone-600 dark:text-stone-400 font-mono">
                  {calcPrintWidthCm.toFixed(1)} cm × {calcPrintHeightCm.toFixed(1)} cm
                </div>
              </div>
            ) : (
              <div>
                <p className="text-xs font-semibold text-stone-500 mb-1">
                  EFFECTIVE PRINT DENSITY:
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                    {avgCalculatedDpi}
                  </span>
                  <span className="text-lg font-bold text-stone-600 dark:text-stone-400">DPI / PPI</span>
                </div>
                <p className="mt-2 text-xs text-stone-500">
                  Width Density: {calculatedDpiW} DPI • Height Density: {calculatedDpiH} DPI
                </p>
              </div>
            )}

            <div className="mt-5 rounded-xl border p-3.5 text-xs leading-relaxed" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}>
              <p className="font-semibold text-stone-800 dark:text-stone-200">
                {qualityBadge.desc}
              </p>
            </div>

            {/* Quick Reference Table for This Image */}
            <div className="mt-6 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-3">
                Print Size Comparison for {pixelWidth}×{pixelHeight}px:
              </h4>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-lg border p-2.5" style={{ borderColor: 'var(--border)' }}>
                  <span className="block text-[11px] font-bold text-stone-500">150 DPI (Good)</span>
                  <span className="block mt-1 font-mono font-bold text-stone-800 dark:text-stone-200">
                    {(pixelWidth / 150).toFixed(1)}″ × {(pixelHeight / 150).toFixed(1)}″
                  </span>
                </div>
                <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-2.5">
                  <span className="block text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    300 DPI (Standard)
                  </span>
                  <span className="block mt-1 font-mono font-bold text-emerald-700 dark:text-emerald-300">
                    {(pixelWidth / 300).toFixed(1)}″ × {(pixelHeight / 300).toFixed(1)}″
                  </span>
                </div>
                <div className="rounded-lg border p-2.5" style={{ borderColor: 'var(--border)' }}>
                  <span className="block text-[11px] font-bold text-stone-500">600 DPI (Archival)</span>
                  <span className="block mt-1 font-mono font-bold text-stone-800 dark:text-stone-200">
                    {(pixelWidth / 600).toFixed(1)}″ × {(pixelHeight / 600).toFixed(1)}″
                  </span>
                </div>
              </div>
            </div>

            {/* Download Option if an image was dropped */}
            {imagePreview && (
              <div className="mt-6 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
                <ClayButton
                  variant="primary"
                  onClick={handleDownloadWithDpi}
                  className="w-full flex items-center justify-center gap-2 py-3"
                >
                  <Download className="h-4 w-4" />
                  Save Image at {targetDpi} DPI ({pixelWidth}×{pixelHeight}px)
                </ClayButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
