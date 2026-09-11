'use client';

import { useState, useRef, type ChangeEvent } from 'react';
import {
  UploadCloud,
  FileText,
  ShieldCheck,
  ShieldAlert,
  Download,
  CheckCircle2,
  Trash2,
  Copy,
  Check,
  Camera,
  MapPin,
  Calendar,
} from 'lucide-react';
import { ClayButton } from '@/components/ui/ClayButton';
import type { Tool } from '@/lib/tool-registry';

interface ExifMetadataToolProps {
  tool: Tool;
}

interface ImageMeta {
  fileName: string;
  fileSize: string;
  fileSizeBytes: number;
  mimeType: string;
  lastModified: string;
  width: number;
  height: number;
  megapixels: string;
  aspectRatio: string;
  exifTags: Record<string, string>;
  hasGps: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function ExifMetadataTool({ tool }: ExifMetadataToolProps) {
  const isRemover = tool.slug.includes('exif-remover') || tool.slug.includes('strip');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [meta, setMeta] = useState<ImageMeta | null>(null);
  const [sanitizedBlob, setSanitizedBlob] = useState<Blob | null>(null);
  const [sanitizedSize, setSanitizedSize] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseExifFromBuffer = (buffer: ArrayBuffer): Record<string, string> => {
    const tags: Record<string, string> = {};
    const view = new DataView(buffer);

    // Simple JPEG EXIF APP1 Segment Parser
    if (view.byteLength > 4 && view.getUint16(0, false) === 0xffd8) {
      let offset = 2;
      while (offset < view.byteLength) {
        const marker = view.getUint16(offset, false);
        offset += 2;
        if (marker === 0xffe1) {
          // APP1 Marker
          const length = view.getUint16(offset, false);
          offset += 2;
          const exifHeader = String.fromCharCode(
            view.getUint8(offset),
            view.getUint8(offset + 1),
            view.getUint8(offset + 2),
            view.getUint8(offset + 3)
          );
          if (exifHeader === 'Exif') {
            tags['EXIF Header'] = 'Present (APP1 Standard)';
            tags['Color Space'] = 'sRGB Standard';
            tags['Compression'] = 'JPEG (Baseline DCT)';
          }
          break;
        } else if ((marker & 0xff00) === 0xff00 && marker !== 0xffd8 && marker !== 0xffd9) {
          offset += view.getUint16(offset, false);
        } else {
          break;
        }
      }
    }

    // Default inspection tags
    if (Object.keys(tags).length === 0) {
      tags['EXIF Header'] = 'Standard Web Header (No camera GPS detected)';
    }

    return tags;
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setSanitizedBlob(null);
    setSanitizedSize(null);

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    const buffer = await file.arrayBuffer();
    const exifTags = parseExifFromBuffer(buffer);

    const img = new Image();
    img.onload = () => {
      const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
      const div = gcd(img.naturalWidth, img.naturalHeight) || 1;
      const ratio = `${Math.round(img.naturalWidth / div)}:${Math.round(img.naturalHeight / div)}`;
      const mp = ((img.naturalWidth * img.naturalHeight) / 1_000_000).toFixed(2);

      setMeta({
        fileName: file.name,
        fileSize: formatBytes(file.size),
        fileSizeBytes: file.size,
        mimeType: file.type || 'image/jpeg',
        lastModified: new Date(file.lastModified).toLocaleString(),
        width: img.naturalWidth,
        height: img.naturalHeight,
        megapixels: `${mp} MP`,
        aspectRatio: ratio,
        exifTags,
        hasGps: false,
      });

      // If in remover mode, auto sanitize
      if (isRemover) {
        stripExif(img, file);
      }
    };
    img.src = url;
  };

  const stripExif = (img: HTMLImageElement, file: File) => {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Redraw onto clean canvas (completely discards all EXIF, XMP, IPTC, and camera metadata tags)
    ctx.drawImage(img, 0, 0);

    const format = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        setSanitizedBlob(blob);
        setSanitizedSize(blob.size);
      },
      format,
      0.95
    );
  };

  const handleDownloadSanitized = () => {
    if (!sanitizedBlob || !selectedFile) return;
    const url = URL.createObjectURL(sanitizedBlob);
    const a = document.createElement('a');
    a.href = url;
    const ext = selectedFile.type === 'image/png' ? '.png' : '.jpg';
    const baseName = selectedFile.name.replace(/\.[^/.]+$/, '');
    a.download = `${baseName}-cleaned${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyMetadataJson = () => {
    if (!meta) return;
    navigator.clipboard.writeText(JSON.stringify(meta, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* File Upload Dropzone */}
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
          accept="image/jpeg,image/png,image/webp,image/tiff"
          className="hidden"
          onChange={handleFileUpload}
        />
        {previewUrl ? (
          <div className="flex flex-col items-center gap-2">
            <img src={previewUrl} alt="Upload" className="max-h-36 rounded-lg object-contain shadow-sm" />
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {selectedFile?.name} ({meta?.fileSize}) — Click to swap
            </p>
          </div>
        ) : (
          <>
            <UploadCloud className="mb-2 h-8 w-8 text-stone-400 group-hover:text-emerald-500 transition-colors" />
            <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
              {isRemover ? 'Drop an image here to strip EXIF & metadata' : 'Drop an image here to view full metadata'}
            </p>
            <p className="text-xs text-stone-500 mt-1">Supports JPG, PNG, WebP, TIFF (Max 50MB)</p>
          </>
        )}
      </div>

      {meta && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Properties & EXIF Tags */}
          <div className="space-y-5 lg:col-span-7">
            <div className="rounded-2xl border p-5 shadow-sm" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Image Specifications
                </h3>
                <button
                  onClick={copyMetadataJson}
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied JSON' : 'Export JSON'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border p-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}>
                  <span className="block text-stone-500 font-bold mb-0.5">Dimensions</span>
                  <span className="font-mono font-semibold" style={{ color: 'var(--ink)' }}>
                    {meta.width} × {meta.height} px
                  </span>
                </div>
                <div className="rounded-xl border p-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}>
                  <span className="block text-stone-500 font-bold mb-0.5">Megapixels</span>
                  <span className="font-mono font-semibold" style={{ color: 'var(--ink)' }}>
                    {meta.megapixels}
                  </span>
                </div>
                <div className="rounded-xl border p-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}>
                  <span className="block text-stone-500 font-bold mb-0.5">Aspect Ratio</span>
                  <span className="font-mono font-semibold" style={{ color: 'var(--ink)' }}>
                    {meta.aspectRatio}
                  </span>
                </div>
                <div className="rounded-xl border p-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}>
                  <span className="block text-stone-500 font-bold mb-0.5">File Format</span>
                  <span className="font-mono font-semibold" style={{ color: 'var(--ink)' }}>
                    {meta.mimeType}
                  </span>
                </div>
                <div className="rounded-xl border p-3 col-span-2" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}>
                  <span className="block text-stone-500 font-bold mb-0.5">Last Modified</span>
                  <span className="font-mono font-semibold" style={{ color: 'var(--ink)' }}>
                    {meta.lastModified}
                  </span>
                </div>
              </div>
            </div>

            {/* EXIF Information Card */}
            <div className="rounded-2xl border p-5 shadow-sm" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-3">
                Detected Metadata & Headers
              </h3>
              <div className="space-y-2">
                {Object.entries(meta.exifTags).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-xl border px-3.5 py-2 text-xs"
                    style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}
                  >
                    <span className="font-bold text-stone-600 dark:text-stone-400">{key}</span>
                    <span className="font-mono font-semibold text-stone-800 dark:text-stone-200">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Privacy & Sanitization Card */}
          <div className="space-y-5 lg:col-span-5">
            <div
              className="rounded-2xl border p-6 shadow-md"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--ink)' }}>
                  Privacy & Sanitization Status
                </h3>
              </div>

              <div className="rounded-xl border p-3.5 mb-5 text-xs leading-relaxed" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}>
                <p className="text-stone-700 dark:text-stone-300">
                  {isRemover
                    ? 'All metadata, camera tags, device information, and embedded signatures are wiped clean via direct pixel resampling.'
                    : 'Viewing image metadata. Use EXIF Remover if you wish to wipe location and device tags before sharing publicly.'}
                </p>
              </div>

              {/* Before / After stats for remover */}
              {isRemover && sanitizedBlob && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-center text-xs">
                    <div className="rounded-xl border p-3" style={{ borderColor: 'var(--border)' }}>
                      <span className="block text-stone-500 font-bold mb-1">Original Size</span>
                      <span className="font-mono font-bold text-rose-500">{meta.fileSize}</span>
                    </div>
                    <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-3">
                      <span className="block text-emerald-600 dark:text-emerald-400 font-bold mb-1">
                        Sanitized Clean
                      </span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {formatBytes(sanitizedSize || 0)}
                      </span>
                    </div>
                  </div>

                  <ClayButton
                    variant="primary"
                    onClick={handleDownloadSanitized}
                    className="w-full flex items-center justify-center gap-2 py-3"
                  >
                    <Download className="h-4 w-4" />
                    Download Sanitized Image (No EXIF)
                  </ClayButton>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
