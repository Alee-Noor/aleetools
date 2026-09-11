'use client';

import { useState, useRef, type ChangeEvent } from 'react';
import {
  UploadCloud,
  Calculator,
  HardDrive,
  Monitor,
  Printer,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import { ClayButton } from '@/components/ui/ClayButton';
import type { Tool } from '@/lib/tool-registry';

interface PixelCalculatorToolProps {
  tool: Tool;
}

export function PixelCalculatorTool({ tool }: PixelCalculatorToolProps) {
  const [width, setWidth] = useState<number>(3840);
  const [height, setHeight] = useState<number>(2160);
  const [bitDepth, setBitDepth] = useState<number>(8);
  const [channels, setChannels] = useState<number>(3); // 3 for RGB, 4 for RGBA, 1 for Grayscale
  const [copied, setCopied] = useState<string | null>(null);

  // File upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculations
  const totalPixels = width * height;
  const megapixels = (totalPixels / 1_000_000).toFixed(2);
  const gigapixels = (totalPixels / 1_000_000_000).toFixed(3);

  // Aspect ratio
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(Math.round(width), Math.round(height)) || 1;
  const ratioStr = `${Math.round(width) / divisor}:${Math.round(height) / divisor}`;
  const ratioDec = (width / (height || 1)).toFixed(2);

  // Raw Memory Footprint (Uncompressed bitmap in RAM/VRAM)
  const bytesPerPixel = (bitDepth / 8) * channels;
  const rawBytes = totalPixels * bytesPerPixel;
  const rawMb = (rawBytes / (1024 * 1024)).toFixed(2);
  const rawGb = (rawBytes / (1024 * 1024 * 1024)).toFixed(2);

  // Estimated Compressed file sizes
  const estJpgMb = ((totalPixels * 0.25) / (1024 * 1024)).toFixed(2); // Typical ~0.25 bytes/pixel for JPG
  const estWebpMb = ((totalPixels * 0.18) / (1024 * 1024)).toFixed(2);
  const estPngMb = ((totalPixels * 1.2) / (1024 * 1024)).toFixed(2);

  // Standard Resolution Classification
  let resClass = 'Custom';
  if (width === 1920 && height === 1080) resClass = 'Full HD (1080p)';
  else if (width === 1280 && height === 720) resClass = 'Standard HD (720p)';
  else if (width === 2560 && height === 1440) resClass = '2K / QHD (1440p)';
  else if (width === 3840 && height === 2160) resClass = '4K UHD (2160p)';
  else if (width === 5120 && height === 2880) resClass = '5K Retina';
  else if (width === 7680 && height === 4320) resClass = '8K UHD (4320p)';
  else if (totalPixels >= 33_000_000) resClass = '8K+ Ultra High Resolution';
  else if (totalPixels >= 8_000_000) resClass = '4K Tier Resolution';
  else if (totalPixels >= 2_000_000) resClass = 'FHD Tier Resolution';
  else if (totalPixels >= 900_000) resClass = 'HD Tier Resolution';
  else resClass = 'Sub-HD Resolution';

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);

    const img = new Image();
    img.onload = () => {
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
    };
    img.src = url;
  };

  return (
    <div className="space-y-6">
      {/* File Upload Box */}
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
              {imageFile?.name} ({width} × {height} px) — Click to swap
            </p>
          </div>
        ) : (
          <>
            <UploadCloud className="mb-2 h-8 w-8 text-stone-400 group-hover:text-emerald-500 transition-colors" />
            <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
              Drop an image here to calculate its pixel metrics
            </p>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              PNG, JPG, WebP supported. Or type dimensions manually below.
            </p>
          </>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Dimension & Bit Depth Inputs */}
        <div className="space-y-5 lg:col-span-5">
          <div className="rounded-2xl border p-5 shadow-sm" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Dimensions & Color Depth
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-stone-700 dark:text-stone-300">
                  WIDTH (PX)
                </label>
                <input
                  type="number"
                  min={1}
                  value={width || ''}
                  onChange={(e) => setWidth(Math.max(1, parseInt(e.target.value) || 0))}
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
                  HEIGHT (PX)
                </label>
                <input
                  type="number"
                  min={1}
                  value={height || ''}
                  onChange={(e) => setHeight(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full rounded-xl border px-3.5 py-2.5 text-base font-semibold font-mono shadow-sm focus:border-emerald-500 focus:outline-none"
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--ink)',
                  }}
                />
              </div>
            </div>

            {/* Quick Resolution Buttons */}
            <p className="text-xs font-bold text-stone-500 mb-2">Popular Presets:</p>
            <div className="flex flex-wrap gap-1.5 mb-5">
              {[
                { label: '1080p FHD', w: 1920, h: 1080 },
                { label: '1440p 2K', w: 2560, h: 1440 },
                { label: '4K UHD', w: 3840, h: 2160 },
                { label: '8K UHD', w: 7680, h: 4320 },
                { label: 'Square 1:1', w: 2048, h: 2048 },
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setWidth(p.w);
                    setHeight(p.h);
                  }}
                  className="rounded border px-2.5 py-1 text-[11px] font-medium transition-colors hover:border-emerald-500"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Bit Depth & Color Model */}
            <div className="grid grid-cols-2 gap-3 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-stone-700 dark:text-stone-300">
                  BIT DEPTH
                </label>
                <select
                  value={bitDepth}
                  onChange={(e) => setBitDepth(parseInt(e.target.value))}
                  className="w-full rounded-xl border px-3 py-2 text-sm font-semibold shadow-sm focus:border-emerald-500 focus:outline-none"
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--ink)',
                  }}
                >
                  <option value={8}>8-bit (Standard sRGB)</option>
                  <option value={10}>10-bit (HDR Display)</option>
                  <option value={16}>16-bit (Pro Photo RAW)</option>
                  <option value={32}>32-bit (Floating Point)</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-stone-700 dark:text-stone-300">
                  CHANNELS
                </label>
                <select
                  value={channels}
                  onChange={(e) => setChannels(parseInt(e.target.value))}
                  className="w-full rounded-xl border px-3 py-2 text-sm font-semibold shadow-sm focus:border-emerald-500 focus:outline-none"
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--ink)',
                  }}
                >
                  <option value={3}>RGB (3 Channels)</option>
                  <option value={4}>RGBA (4 Channels w/ Alpha)</option>
                  <option value={1}>Grayscale (1 Channel)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Calculated Metrics Cards */}
        <div className="space-y-4 lg:col-span-7">
          {/* Primary Metric: Megapixels & Pixel Count */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border p-5 shadow-sm" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Total Pixels
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                  {totalPixels.toLocaleString()}
                </span>
                <button
                  onClick={() => copyToClipboard(totalPixels.toString(), 'pixels')}
                  className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                >
                  {copied === 'pixels' ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <span className="mt-1 block text-xs text-stone-500 font-medium">Exact sensor/canvas pixels</span>
            </div>

            <div className="rounded-2xl border p-5 shadow-sm" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Megapixels
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono" style={{ color: 'var(--ink)' }}>
                  {megapixels} MP
                </span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-500">
                  {resClass}
                </span>
              </div>
              <span className="mt-1 block text-xs text-stone-500 font-medium">
                {parseFloat(gigapixels) >= 0.05 ? `${gigapixels} Gigapixels` : 'Standard camera rating'}
              </span>
            </div>
          </div>

          {/* Secondary Metric: Memory Footprint */}
          <div className="rounded-2xl border p-5 shadow-sm" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                <HardDrive className="h-4 w-4" />
                Raw Uncompressed RAM Footprint
              </span>
              <span className="font-mono text-xs font-bold text-stone-600 dark:text-stone-400">
                {bytesPerPixel} bytes/pixel
              </span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold font-mono" style={{ color: 'var(--ink)' }}>
                {parseFloat(rawMb) > 1024 ? `${rawGb} GB` : `${rawMb} MB`}
              </span>
              <span className="text-xs text-stone-500 font-medium">
                in GPU VRAM / system buffer ({bitDepth}-bit × {channels} channels)
              </span>
            </div>

            {/* Estimated Compressed File Sizes */}
            <div className="mt-4 grid grid-cols-3 gap-2 border-t pt-3" style={{ borderColor: 'var(--border)' }}>
              <div className="rounded-lg border p-2 text-center text-xs" style={{ borderColor: 'var(--border)' }}>
                <span className="block text-[10px] font-bold text-stone-500">Est. JPEG Size</span>
                <span className="font-mono font-bold text-stone-700 dark:text-stone-300">~{estJpgMb} MB</span>
              </div>
              <div className="rounded-lg border p-2 text-center text-xs" style={{ borderColor: 'var(--border)' }}>
                <span className="block text-[10px] font-bold text-stone-500">Est. WebP Size</span>
                <span className="font-mono font-bold text-stone-700 dark:text-stone-300">~{estWebpMb} MB</span>
              </div>
              <div className="rounded-lg border p-2 text-center text-xs" style={{ borderColor: 'var(--border)' }}>
                <span className="block text-[10px] font-bold text-stone-500">Est. PNG Size</span>
                <span className="font-mono font-bold text-stone-700 dark:text-stone-300">~{estPngMb} MB</span>
              </div>
            </div>
          </div>

          {/* Tertiary Metric: Print Sizes at Standard DPI */}
          <div className="rounded-2xl border p-5 shadow-sm" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-3">
              <Printer className="h-4 w-4" />
              Maximum Print Output Sizes
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="rounded-lg border p-2" style={{ borderColor: 'var(--border)' }}>
                <span className="block text-[10px] font-bold text-stone-500">72 DPI (Web/Draft)</span>
                <span className="mt-0.5 block font-mono font-bold">
                  {(width / 72).toFixed(1)}″ × {(height / 72).toFixed(1)}″
                </span>
              </div>
              <div className="rounded-lg border p-2" style={{ borderColor: 'var(--border)' }}>
                <span className="block text-[10px] font-bold text-stone-500">150 DPI (Good)</span>
                <span className="mt-0.5 block font-mono font-bold">
                  {(width / 150).toFixed(1)}″ × {(height / 150).toFixed(1)}″
                </span>
              </div>
              <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-2">
                <span className="block text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  300 DPI (Photo Print)
                </span>
                <span className="mt-0.5 block font-mono font-bold text-emerald-700 dark:text-emerald-300">
                  {(width / 300).toFixed(1)}″ × {(height / 300).toFixed(1)}″
                </span>
              </div>
              <div className="rounded-lg border p-2" style={{ borderColor: 'var(--border)' }}>
                <span className="block text-[10px] font-bold text-stone-500">600 DPI (Archival)</span>
                <span className="mt-0.5 block font-mono font-bold">
                  {(width / 600).toFixed(1)}″ × {(height / 600).toFixed(1)}″
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
