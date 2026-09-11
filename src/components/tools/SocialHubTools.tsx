'use client';

import { useState, useRef, type ChangeEvent } from 'react';
import {
  UploadCloud,
  Grid,
  Clock,
  Eye,
  Download,
  Copy,
  Check,
  Plus,
  Trash2,
  Sparkles,
  Monitor,
  Smartphone,
  Play,
} from 'lucide-react';
import { ClayButton } from '@/components/ui/ClayButton';
import type { Tool } from '@/lib/tool-registry';

interface SocialHubToolsProps {
  tool: Tool;
}

export function SocialHubTools({ tool }: SocialHubToolsProps) {
  const slug = tool.slug;
  const isGridMaker = slug.includes('grid-maker') || slug.includes('grid-splitter');
  const isTimestampGen = slug.includes('timestamp-generator');
  const isThumbnailPreview = slug.includes('thumbnail-preview');
  const isThumbnailDownloader = slug.includes('thumbnail-downloader');

  // -------------------------------------------------------------
  // 1. Grid Maker / 3x3 Grid Splitter
  // -------------------------------------------------------------
  const [gridType, setGridType] = useState<'3x3' | '3x2' | '3x1'>('3x3');
  const [gridImage, setGridImage] = useState<string | null>(null);
  const [gridSlices, setGridSlices] = useState<string[]>([]);
  const gridFileRef = useRef<HTMLInputElement>(null);

  const handleGridUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setGridImage(url);
    generateGridSlices(url, gridType);
  };

  const generateGridSlices = (imgUrl: string, type: '3x3' | '3x2' | '3x1') => {
    const img = new Image();
    img.onload = () => {
      const cols = 3;
      const rows = type === '3x3' ? 3 : type === '3x2' ? 2 : 1;
      const tileWidth = Math.floor(img.naturalWidth / cols);
      const tileHeight = Math.floor(img.naturalHeight / rows);

      const slices: string[] = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const canvas = document.createElement('canvas');
          canvas.width = tileWidth;
          canvas.height = tileHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(
              img,
              c * tileWidth,
              r * tileHeight,
              tileWidth,
              tileHeight,
              0,
              0,
              tileWidth,
              tileHeight
            );
            slices.push(canvas.toDataURL('image/jpeg', 0.92));
          }
        }
      }
      setGridSlices(slices);
    };
    img.src = imgUrl;
  };

  const downloadSlice = (sliceDataUrl: string, index: number) => {
    const a = document.createElement('a');
    a.href = sliceDataUrl;
    a.download = `instagram-grid-tile-${index + 1}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadAllSlices = () => {
    gridSlices.forEach((slice, idx) => {
      setTimeout(() => downloadSlice(slice, idx), idx * 250);
    });
  };

  // -------------------------------------------------------------
  // 2. YouTube Timestamp Generator
  // -------------------------------------------------------------
  const [chapters, setChapters] = useState<{ time: string; title: string }[]>([
    { time: '00:00', title: 'Introduction' },
    { time: '01:15', title: 'Why This Matters' },
    { time: '03:40', title: 'Step-by-Step Tutorial' },
    { time: '07:20', title: 'Common Mistakes to Avoid' },
    { time: '10:05', title: 'Conclusion & Next Steps' },
  ]);
  const [copiedTimestamps, setCopiedTimestamps] = useState(false);

  const addChapter = () => {
    setChapters([...chapters, { time: '00:00', title: 'New Chapter' }]);
  };

  const updateChapter = (index: number, field: 'time' | 'title', val: string) => {
    const updated = [...chapters];
    updated[index][field] = val;
    setChapters(updated);
  };

  const deleteChapter = (index: number) => {
    setChapters(chapters.filter((_, i) => i !== index));
  };

  const getFormattedChaptersText = () => {
    return chapters.map((c) => `${c.time} - ${c.title}`).join('\n');
  };

  const copyChapters = () => {
    navigator.clipboard.writeText(getFormattedChaptersText());
    setCopiedTimestamps(true);
    setTimeout(() => setCopiedTimestamps(false), 2000);
  };

  // -------------------------------------------------------------
  // 3. YouTube Thumbnail Preview
  // -------------------------------------------------------------
  const [ytTitle, setYtTitle] = useState('How to Build High-Performance Web Apps in 2026');
  const [ytChannel, setYtChannel] = useState('Tech Workshop');
  const [ytViews, setYtViews] = useState('142K views');
  const [ytTime, setYtTime] = useState('3 days ago');
  const [ytDuration, setYtDuration] = useState('14:28');
  const [thumbSrc, setThumbSrc] = useState<string | null>(null);
  const thumbFileRef = useRef<HTMLInputElement>(null);

  const handleThumbUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setThumbSrc(URL.createObjectURL(file));
  };

  // -------------------------------------------------------------
  // RENDER SECTIONS
  // -------------------------------------------------------------
  if (isGridMaker) {
    const rows = gridType === '3x3' ? 3 : gridType === '3x2' ? 2 : 1;
    return (
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
          <div className="flex gap-2">
            {[
              { type: '3x3', label: '3×3 Grid (9 Slices)' },
              { type: '3x2', label: '3×2 Grid (6 Slices)' },
              { type: '3x1', label: '3×1 Banner (3 Slices)' },
            ].map((g) => (
              <button
                key={g.type}
                type="button"
                onClick={() => {
                  setGridType(g.type as any);
                  if (gridImage) generateGridSlices(gridImage, g.type as any);
                }}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                  gridType === g.type
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'border bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                }`}
                style={{ borderColor: 'var(--border)' }}
              >
                {g.label}
              </button>
            ))}
          </div>

          {gridSlices.length > 0 && (
            <ClayButton variant="primary" onClick={downloadAllSlices} className="flex items-center gap-2 py-2 text-xs">
              <Download className="h-3.5 w-3.5" />
              Download All {gridSlices.length} Tiles
            </ClayButton>
          )}
        </div>

        {/* Upload Box */}
        <div
          onClick={() => gridFileRef.current?.click()}
          className="group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all hover:border-emerald-500"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--surface)',
          }}
        >
          <input
            ref={gridFileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleGridUpload}
          />
          <UploadCloud className="mb-2 h-8 w-8 text-stone-400 group-hover:text-emerald-500 transition-colors" />
          <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
            {gridImage ? 'Click to upload a different image' : 'Drop an image to split into an Instagram grid'}
          </p>
          <p className="text-xs text-stone-500 mt-1">High-resolution square or panoramic photos work best</p>
        </div>

        {/* Grid Visualizer */}
        {gridSlices.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Instagram Upload Sequence (Post in order from 1 to {gridSlices.length})
              </span>
            </div>

            <div
              className="grid gap-2 rounded-2xl border p-4 shadow-sm"
              style={{
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
              }}
            >
              {gridSlices.map((slice, idx) => {
                // In Instagram, you post the bottom right tile FIRST so it moves to bottom right as you upload subsequent posts!
                const instagramPostOrder = gridSlices.length - idx;
                return (
                  <div key={idx} className="group relative aspect-square overflow-hidden rounded-xl border bg-black/5" style={{ borderColor: 'var(--border)' }}>
                    <img src={slice} alt={`Tile ${idx + 1}`} className="h-full w-full object-cover" />
                    <div className="absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white shadow">
                      {instagramPostOrder}
                    </div>
                    <button
                      onClick={() => downloadSlice(slice, idx)}
                      className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900/80 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-emerald-600"
                      title="Download Tile"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (isTimestampGen) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left: Chapter Editor */}
          <div className="space-y-4 lg:col-span-7">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Video Chapters (MM:SS or HH:MM:SS)
              </h3>
              <button
                type="button"
                onClick={addChapter}
                className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Chapter
              </button>
            </div>

            <div className="space-y-2.5">
              {chapters.map((ch, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 rounded-xl border p-2 shadow-sm"
                  style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
                >
                  <Clock className="h-4 w-4 text-stone-400 ml-2" />
                  <input
                    type="text"
                    value={ch.time}
                    placeholder="00:00"
                    onChange={(e) => updateChapter(idx, 'time', e.target.value)}
                    className="w-24 rounded-lg border px-2.5 py-1.5 font-mono text-sm font-bold shadow-sm focus:border-emerald-500 focus:outline-none"
                    style={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                      color: 'var(--ink)',
                    }}
                  />
                  <input
                    type="text"
                    value={ch.title}
                    placeholder="Chapter Title"
                    onChange={(e) => updateChapter(idx, 'title', e.target.value)}
                    className="flex-1 rounded-lg border px-3 py-1.5 text-sm font-semibold shadow-sm focus:border-emerald-500 focus:outline-none"
                    style={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                      color: 'var(--ink)',
                    }}
                  />
                  {chapters.length > 1 && (
                    <button
                      type="button"
                      onClick={() => deleteChapter(idx)}
                      className="p-2 text-stone-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Formatted YouTube Description Output */}
          <div className="space-y-4 lg:col-span-5">
            <div
              className="rounded-2xl border p-5 shadow-md"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  YouTube Description Format
                </span>
                <button
                  type="button"
                  onClick={copyChapters}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1 text-xs font-bold text-white shadow-sm hover:bg-emerald-600 transition-colors"
                >
                  {copiedTimestamps ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedTimestamps ? 'Copied' : 'Copy Chapters'}
                </button>
              </div>

              <textarea
                readOnly
                rows={9}
                value={getFormattedChaptersText()}
                className="w-full rounded-xl border p-3.5 font-mono text-xs leading-relaxed focus:outline-none"
                style={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  color: 'var(--ink)',
                }}
              />
              <p className="mt-2 text-[11px] text-stone-500">
                Paste directly into your YouTube video description to enable interactive timeline scrubbing!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Default: YouTube Thumbnail Preview & Downloader
  // -------------------------------------------------------------
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Input controls */}
        <div className="space-y-4 lg:col-span-5">
          <div
            onClick={() => thumbFileRef.current?.click()}
            className="group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all hover:border-emerald-500"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--surface)',
            }}
          >
            <input
              ref={thumbFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleThumbUpload}
            />
            {thumbSrc ? (
              <img src={thumbSrc} alt="Thumbnail" className="max-h-36 rounded-lg object-contain shadow-sm" />
            ) : (
              <>
                <UploadCloud className="mb-2 h-7 w-7 text-stone-400 group-hover:text-emerald-500 transition-colors" />
                <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
                  Upload 1280×720 Thumbnail Image
                </p>
                <p className="text-xs text-stone-500 mt-1">16:9 aspect ratio</p>
              </>
            )}
          </div>

          <div className="rounded-2xl border p-5 shadow-sm space-y-3" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div>
              <label className="mb-1 block text-xs font-bold text-stone-700 dark:text-stone-300">
                VIDEO TITLE ({ytTitle.length}/100 chars)
              </label>
              <input
                type="text"
                value={ytTitle}
                onChange={(e) => setYtTitle(e.target.value)}
                className="w-full rounded-xl border px-3.5 py-2 text-sm font-semibold focus:border-emerald-500 focus:outline-none"
                style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--ink)' }}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-bold text-stone-700 dark:text-stone-300">
                  CHANNEL NAME
                </label>
                <input
                  type="text"
                  value={ytChannel}
                  onChange={(e) => setYtChannel(e.target.value)}
                  className="w-full rounded-xl border px-3 py-1.5 text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                  style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--ink)' }}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-stone-700 dark:text-stone-300">
                  DURATION
                </label>
                <input
                  type="text"
                  value={ytDuration}
                  onChange={(e) => setYtDuration(e.target.value)}
                  className="w-full rounded-xl border px-3 py-1.5 text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                  style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--ink)' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Mockup Preview Cards */}
        <div className="space-y-5 lg:col-span-7">
          <div className="rounded-2xl border p-5 shadow-md" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3 block">
              Desktop YouTube Feed Preview
            </span>

            <div className="max-w-md rounded-2xl border bg-stone-950 p-3 text-white shadow-lg">
              {/* Thumbnail Container */}
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-stone-900">
                {thumbSrc ? (
                  <img src={thumbSrc} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-stone-600">
                    <Play className="h-10 w-10 opacity-30" />
                  </div>
                )}
                <span className="absolute bottom-2 right-2 rounded bg-black/85 px-1.5 py-0.5 font-mono text-[11px] font-bold text-white">
                  {ytDuration}
                </span>
              </div>

              {/* Video Info */}
              <div className="mt-3 flex gap-3">
                <div className="h-9 w-9 flex-shrink-0 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-xs text-white">
                  {ytChannel.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="line-clamp-2 text-sm font-semibold leading-snug" style={{ color: '#FFFFFF' }}>{ytTitle}</h4>
                  <p className="mt-1 text-xs" style={{ color: '#D6D3D1' }}>{ytChannel}</p>
                  <p className="text-xs" style={{ color: '#A8A29E' }}>
                    {ytViews} • {ytTime}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
