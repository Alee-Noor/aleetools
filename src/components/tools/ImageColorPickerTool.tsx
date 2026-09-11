'use client';

import { useState, useRef, useEffect, type MouseEvent, type ChangeEvent } from 'react';
import {
  UploadCloud,
  Pipette,
  Copy,
  Check,
  Sparkles,
  Palette,
  Crosshair,
  RefreshCw,
} from 'lucide-react';
import { ClayButton } from '@/components/ui/ClayButton';
import type { Tool } from '@/lib/tool-registry';

interface ImageColorPickerToolProps {
  tool: Tool;
}

interface ColorSample {
  hex: string;
  rgb: string;
  hsl: string;
  cmyk: string;
  r: number;
  g: number;
  b: number;
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('').toUpperCase();
}

function rgbToHsl(r: number, g: number, b: number): string {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

function rgbToCmyk(r: number, g: number, b: number): string {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const k = 1 - Math.max(rNorm, gNorm, bNorm);
  if (k === 1) return 'cmyk(0%, 0%, 0%, 100%)';
  const c = (1 - rNorm - k) / (1 - k);
  const m = (1 - gNorm - k) / (1 - k);
  const y = (1 - bNorm - k) / (1 - k);
  return `cmyk(${Math.round(c * 100)}%, ${Math.round(m * 100)}%, ${Math.round(y * 100)}%, ${Math.round(k * 100)}%)`;
}

export function ImageColorPickerTool({ tool }: ImageColorPickerToolProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<ColorSample>({
    hex: '#10B981',
    rgb: 'rgb(16, 185, 129)',
    hsl: 'hsl(160, 84%, 39%)',
    cmyk: 'cmyk(91%, 0%, 30%, 27%)',
    r: 16,
    g: 185,
    b: 129,
  });

  const [hoverColor, setHoverColor] = useState<string>('#10B981');
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number } | null>(null);
  const [paletteHistory, setPaletteHistory] = useState<string[]>(['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B']);
  const [copied, setCopied] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setImageSrc(url);

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);

      // Auto sample center color
      sampleColorAt(Math.floor(img.naturalWidth / 2), Math.floor(img.naturalHeight / 2));
      // Extract dominant colors
      extractDominantColors(ctx, img.naturalWidth, img.naturalHeight);
    };
    img.src = url;
  };

  const sampleColorAt = (canvasX: number, canvasY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    if (canvasX < 0 || canvasX >= canvas.width || canvasY < 0 || canvasY >= canvas.height) return;

    const pixel = ctx.getImageData(canvasX, canvasY, 1, 1).data;
    const [r, g, b] = [pixel[0], pixel[1], pixel[2]];
    const hex = rgbToHex(r, g, b);
    const rgb = `rgb(${r}, ${g}, ${b})`;
    const hsl = rgbToHsl(r, g, b);
    const cmyk = rgbToCmyk(r, g, b);

    const sample = { hex, rgb, hsl, cmyk, r, g, b };
    setSelectedColor(sample);

    setPaletteHistory((prev) => {
      if (prev.includes(hex)) return prev;
      return [hex, ...prev.slice(0, 11)];
    });
  };

  const handleCanvasMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const canvasX = Math.floor((e.clientX - rect.left) * scaleX);
    const canvasY = Math.floor((e.clientY - rect.top) * scaleY);

    setHoverCoord({ x: canvasX, y: canvasY });

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    if (canvasX >= 0 && canvasX < canvas.width && canvasY >= 0 && canvasY < canvas.height) {
      const pixel = ctx.getImageData(canvasX, canvasY, 1, 1).data;
      setHoverColor(rgbToHex(pixel[0], pixel[1], pixel[2]));
    }
  };

  const handleCanvasClick = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const canvasX = Math.floor((e.clientX - rect.left) * scaleX);
    const canvasY = Math.floor((e.clientY - rect.top) * scaleY);
    sampleColorAt(canvasX, canvasY);
  };

  const extractDominantColors = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    // Sample a 50x50 step grid across the image
    const stepX = Math.max(1, Math.floor(w / 40));
    const stepY = Math.max(1, Math.floor(h / 40));
    const colors: { [hex: string]: number } = {};

    for (let y = 0; y < h; y += stepY) {
      for (let x = 0; x < w; x += stepX) {
        const p = ctx.getImageData(x, y, 1, 1).data;
        // Quantize slightly to cluster similar shades
        const qr = Math.round(p[0] / 24) * 24;
        const qg = Math.round(p[1] / 24) * 24;
        const qb = Math.round(p[2] / 24) * 24;
        const hex = rgbToHex(Math.min(255, qr), Math.min(255, qg), Math.min(255, qb));
        colors[hex] = (colors[hex] || 0) + 1;
      }
    }

    const sorted = Object.entries(colors)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([hex]) => hex);

    if (sorted.length > 0) {
      setPaletteHistory(sorted);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* File Upload Box */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-5 text-center transition-all hover:border-emerald-500"
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
        <UploadCloud className="mb-2 h-7 w-7 text-stone-400 group-hover:text-emerald-500 transition-colors" />
        <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
          {imageSrc ? 'Click to upload a different image' : 'Drop or upload an image to pick colors'}
        </p>
        <p className="text-xs text-stone-500 mt-0.5">Supports PNG, JPG, WebP, SVG</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Interactive Canvas */}
        <div className="space-y-4 lg:col-span-7">
          <div
            className="relative flex min-h-[380px] items-center justify-center overflow-hidden rounded-2xl border p-4 shadow-sm"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            {imageSrc ? (
              <div className="relative inline-block max-w-full">
                <canvas
                  ref={canvasRef}
                  onMouseMove={handleCanvasMouseMove}
                  onClick={handleCanvasClick}
                  className="max-h-[500px] max-w-full cursor-crosshair rounded-lg object-contain shadow-sm"
                />
                {hoverCoord && (
                  <div className="absolute top-2 left-2 flex items-center gap-2 rounded-lg bg-stone-950/80 px-2.5 py-1 text-xs text-white backdrop-blur-md shadow">
                    <span
                      className="h-3 w-3 rounded-full border border-white/40"
                      style={{ backgroundColor: hoverColor }}
                    />
                    <span className="font-mono">{hoverColor}</span>
                    <span className="text-stone-400">
                      ({hoverCoord.x}, {hoverCoord.y})
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-stone-400 p-8">
                <Pipette className="mx-auto mb-3 h-12 w-12 opacity-40" />
                <p className="text-sm font-medium">Upload an image above to sample pixel colors</p>
              </div>
            )}
          </div>
          <p className="text-center text-xs text-stone-500 font-medium">
            💡 Click anywhere on the image above to select and copy its exact pixel color.
          </p>
        </div>

        {/* Right Column: Active Color Breakdown & Palette */}
        <div className="space-y-5 lg:col-span-5">
          {/* Swatch & Main Code */}
          <div
            className="rounded-2xl border p-6 shadow-md"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-3 block">
              Sampled Color
            </span>

            <div className="flex items-center gap-4 mb-6">
              <div
                className="h-20 w-20 rounded-2xl border shadow-inner flex-shrink-0"
                style={{
                  backgroundColor: selectedColor.hex,
                  borderColor: 'var(--border)',
                }}
              />
              <div className="min-w-0 flex-1">
                <span className="font-mono text-3xl font-extrabold tracking-tight" style={{ color: 'var(--ink)' }}>
                  {selectedColor.hex}
                </span>
                <p className="mt-1 text-xs text-stone-500">
                  R: {selectedColor.r} • G: {selectedColor.g} • B: {selectedColor.b}
                </p>
              </div>
            </div>

            {/* Formatted Code Fields */}
            <div className="space-y-2.5">
              {[
                { label: 'HEX', val: selectedColor.hex },
                { label: 'RGB', val: selectedColor.rgb },
                { label: 'HSL', val: selectedColor.hsl },
                { label: 'CMYK', val: selectedColor.cmyk },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-xl border px-3.5 py-2 text-xs font-mono"
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <span className="font-bold text-stone-500">{item.label}</span>
                  <span className="font-semibold text-stone-800 dark:text-stone-200">{item.val}</span>
                  <button
                    onClick={() => copyToClipboard(item.val, item.label)}
                    className="flex items-center gap-1 rounded px-2 py-1 text-xs font-sans font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                  >
                    {copied === item.label ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied === item.label ? 'Copied' : 'Copy'}
                  </button>
                </div>
              ))}
            </div>

            {/* Extracted Palette / History */}
            <div className="mt-6 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-500">
                  <Palette className="h-3.5 w-3.5" />
                  Color Palette Swatches
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {paletteHistory.map((hex, idx) => (
                  <button
                    key={`${hex}-${idx}`}
                    type="button"
                    onClick={() => {
                      // Parse hex back to RGB
                      const r = parseInt(hex.slice(1, 3), 16) || 0;
                      const g = parseInt(hex.slice(3, 5), 16) || 0;
                      const b = parseInt(hex.slice(5, 7), 16) || 0;
                      setSelectedColor({
                        hex,
                        rgb: `rgb(${r}, ${g}, ${b})`,
                        hsl: rgbToHsl(r, g, b),
                        cmyk: rgbToCmyk(r, g, b),
                        r,
                        g,
                        b,
                      });
                    }}
                    className="group relative h-9 w-9 rounded-xl border shadow-sm transition-transform hover:scale-110"
                    style={{ backgroundColor: hex, borderColor: 'var(--border)' }}
                    title={hex}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
