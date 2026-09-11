'use client';

import { useState, useRef, type ChangeEvent, type MouseEvent, type TouchEvent } from 'react';
import {
  Download,
  RefreshCw,
  Sliders,
  CheckCircle2,
  RotateCw,
  FlipHorizontal,
  Crop,
  Sparkles,
  Move,
  UploadCloud,
  Type,
  Image as ImageIcon,
} from 'lucide-react';
import { FileDropzone } from '@/components/ui/FileDropzone';
import { ClayButton } from '@/components/ui/ClayButton';
import {
  resizeImage,
  compressImage,
  convertImage,
  cropImageToRatio,
  rotateImage,
  flipImage,
  filterImage,
  watermarkImage,
  downloadBlob,
  formatFileSize,
  type ProcessedImageResult,
  type WatermarkOptions,
} from '@/lib/engines/image-engine';
import type { Tool } from '@/lib/tool-registry';

interface ImageToolProps {
  tool: Tool;
}

export function ImageTool({ tool }: ImageToolProps) {
  const slug = tool.slug;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ProcessedImageResult | null>(null);

  // Settings
  const [quality, setQuality] = useState<number>(85);
  const [width, setWidth] = useState<number>(1080);
  const [height, setHeight] = useState<number>(1080);
  const [rotateAngle, setRotateAngle] = useState<number>(90);
  const [cropRatio, setCropRatio] = useState<string>('1:1');
  
  // Watermark Advanced Settings
  const [wmType, setWmType] = useState<'text' | 'image'>('text');
  const [watermarkText, setWatermarkText] = useState<string>('Alee Tools');
  const [wmColor, setWmColor] = useState<string>('#ffffff');
  const [wmFontSize, setWmFontSize] = useState<number>(40);
  const [wmOpacity, setWmOpacity] = useState<number>(80); // 10 to 100%
  const [wmScale, setWmScale] = useState<number>(30); // 5 to 100% of base image
  const [wmRotation, setWmRotation] = useState<number>(0); // -180 to 180 deg
  const [wmPosX, setWmPosX] = useState<number>(50); // 0 to 100% (percentage from left)
  const [wmPosY, setWmPosY] = useState<number>(50); // 0 to 100% (percentage from top)

  // Watermark Image / Logo Upload
  const [wmImageFile, setWmImageFile] = useState<File | null>(null);
  const [wmImageDataUrl, setWmImageDataUrl] = useState<string | null>(null);

  // Dragging state
  const [isDraggingWm, setIsDraggingWm] = useState(false);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const wmFileInputRef = useRef<HTMLInputElement>(null);

  // Detect modes
  const isCompressor = slug.includes('compress');
  const isToJpg = slug.includes('to-jpg');
  const isToPng = slug.includes('to-png');
  const isToWebp = slug.includes('to-webp');
  const is916 = slug.includes('916') || slug.includes('story') || slug.includes('reel');
  const isRotator = slug.includes('rotat');
  const isFlipper = slug.includes('flip');
  const isCropper = slug.includes('cropper');
  const isGrayscale = slug.includes('grayscale');
  const isBrightness = slug.includes('brightness');
  const isContrast = slug.includes('contrast');
  const isBlur = slug.includes('blur');
  const isWatermark = slug.includes('watermark');
  const isResizer = slug.includes('resize') || slug.includes('maker') || isCropper;

  const handleFiles = (files: File[]) => {
    if (files.length > 0) {
      const f = files[0];
      setSelectedFile(f);
      setPreviewUrl(URL.createObjectURL(f));
      setResult(null);

      // Pre-populate width/height based on tool preset or image natural size
      const img = new Image();
      img.onload = () => {
        if (slug.includes('profile')) {
          if (slug.includes('youtube')) {
            setWidth(800);
            setHeight(800);
          } else if (slug.includes('tiktok')) {
            setWidth(200);
            setHeight(200);
          } else {
            setWidth(320);
            setHeight(320);
          }
        } else if (slug.includes('youtube') && slug.includes('banner')) {
          setWidth(2560);
          setHeight(1440);
        } else if (slug.includes('youtube') && slug.includes('thumbnail')) {
          setWidth(1280);
          setHeight(720);
        } else if (slug.includes('tiktok') && slug.includes('thumbnail')) {
          setWidth(1080);
          setHeight(1920);
        } else {
          setWidth(img.naturalWidth);
          setHeight(img.naturalHeight);
        }
      };
      img.src = URL.createObjectURL(f);
    }
  };

  const handleWmImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setWmImageFile(file);
    setWmImageDataUrl(URL.createObjectURL(file));
    setWmType('image');
  };

  // Free Mouse Drag Pointer Handler
  const updateWmPositionFromPointer = (clientX: number, clientY: number) => {
    if (!previewContainerRef.current) return;
    const rect = previewContainerRef.current.getBoundingClientRect();
    const rawX = (clientX - rect.left) / rect.width;
    const rawY = (clientY - rect.top) / rect.height;
    const clampX = Math.round(Math.max(0, Math.min(1, rawX)) * 100);
    const clampY = Math.round(Math.max(0, Math.min(1, rawY)) * 100);
    setWmPosX(clampX);
    setWmPosY(clampY);
  };

  const handlePointerDown = (e: MouseEvent | TouchEvent) => {
    if (!isWatermark) return;
    setIsDraggingWm(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    updateWmPositionFromPointer(clientX, clientY);
  };

  const handlePointerMove = (e: MouseEvent | TouchEvent) => {
    if (!isDraggingWm || !isWatermark) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    updateWmPositionFromPointer(clientX, clientY);
  };

  const handlePointerUp = () => {
    setIsDraggingWm(false);
  };

  const handleProcess = async () => {
    if (!selectedFile) return;
    setProcessing(true);
    try {
      let res: ProcessedImageResult;

      if (isRotator) {
        res = await rotateImage(selectedFile, rotateAngle);
      } else if (isFlipper) {
        res = await flipImage(selectedFile, true, false);
      } else if (isGrayscale) {
        res = await filterImage(selectedFile, 'grayscale(100%)');
      } else if (isBlur) {
        res = await filterImage(selectedFile, 'blur(6px)');
      } else if (isBrightness) {
        res = await filterImage(selectedFile, 'brightness(130%)');
      } else if (isContrast) {
        res = await filterImage(selectedFile, 'contrast(140%)');
      } else if (isWatermark) {
        const wmOptions: WatermarkOptions = {
          type: wmType,
          text: watermarkText,
          watermarkFile: wmImageFile,
          watermarkDataUrl: wmImageDataUrl,
          color: wmColor,
          fontSize: wmFontSize,
          opacity: wmOpacity / 100,
          scale: wmScale / 100,
          rotation: wmRotation,
          positionX: wmPosX / 100,
          positionY: wmPosY / 100,
        };
        res = await watermarkImage(selectedFile, wmOptions);
      } else if (is916) {
        res = await cropImageToRatio(selectedFile, 9, 16);
      } else if (isCropper) {
        const [cw, ch] = cropRatio.split(':').map((x) => parseInt(x, 10) || 1);
        res = await cropImageToRatio(selectedFile, cw, ch);
      } else if (isToJpg) {
        res = await convertImage(selectedFile, 'image/jpeg', quality / 100);
      } else if (isToPng) {
        res = await convertImage(selectedFile, 'image/png', quality / 100);
      } else if (isToWebp) {
        res = await convertImage(selectedFile, 'image/webp', quality / 100);
      } else if (isCompressor) {
        res = await compressImage(selectedFile, quality / 100);
      } else if (isResizer) {
        res = await resizeImage(selectedFile, width, height, 'image/jpeg', quality / 100);
      } else {
        res = await compressImage(selectedFile, quality / 100);
      }

      setResult(res);
    } catch (err) {
      alert('Error processing image: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result || !selectedFile) return;
    const ext = isToPng ? '.png' : isToWebp ? '.webp' : '.jpg';
    const baseName = selectedFile.name.replace(/\.[^/.]+$/, '');
    downloadBlob(result.blob, `${baseName}-processed${ext}`);
  };

  return (
    <div className="space-y-6">
      {!selectedFile ? (
        <FileDropzone
          onFilesSelected={handleFiles}
          accept="image/png,image/jpeg,image/webp,image/gif,image/bmp,image/svg+xml"
          title={`Upload an image for ${tool.name}`}
          subtitle="High performance client engine. Max 50MB."
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Image Preview & Interactive Free Mouse Drag Overlay */}
            <div className="space-y-3">
              <div
                ref={previewContainerRef}
                onMouseDown={handlePointerDown}
                onMouseMove={handlePointerMove}
                onMouseUp={handlePointerUp}
                onTouchStart={handlePointerDown}
                onTouchMove={handlePointerMove}
                onTouchEnd={handlePointerUp}
                className={`relative overflow-hidden rounded-[14px] border aspect-video max-h-80 bg-stone-100 dark:bg-stone-900 flex items-center justify-center p-2 user-select-none select-none ${
                  isWatermark ? 'cursor-grab active:cursor-grabbing' : ''
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={result ? result.dataUrl : previewUrl || ''}
                  alt="Preview"
                  className="max-h-full max-w-full object-contain rounded-[10px] pointer-events-none"
                />

                {/* Interactive Watermark Overlay (Visual Drag Indicator) */}
                {isWatermark && !result && (
                  <div
                    className="absolute pointer-events-none flex flex-col items-center justify-center transition-transform"
                    style={{
                      left: `${wmPosX}%`,
                      top: `${wmPosY}%`,
                      transform: `translate(-50%, -50%) rotate(${wmRotation}deg)`,
                      opacity: wmOpacity / 100,
                    }}
                  >
                    {wmType === 'text' ? (
                      <span
                        className="font-bold drop-shadow-md whitespace-nowrap px-3 py-1 rounded border border-white/30 backdrop-blur-sm"
                        style={{
                          color: wmColor,
                          fontSize: `${Math.max(12, Math.round(wmFontSize * 0.4))}px`,
                          backgroundColor: 'rgba(0, 0, 0, 0.4)',
                        }}
                      >
                        {watermarkText || 'Watermark'}
                      </span>
                    ) : wmImageDataUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={wmImageDataUrl}
                        alt="Watermark Logo"
                        className="object-contain max-h-24 max-w-24 drop-shadow-lg"
                        style={{ width: `${Math.max(24, Math.round(wmScale * 1.5))}px` }}
                      />
                    ) : (
                      <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs shadow-lg">
                        <ImageIcon size={14} />
                        <span>Upload Logo</span>
                      </div>
                    )}

                    {/* Drag Crosshair Guide Badge */}
                    <div className="absolute -bottom-6 flex items-center gap-1 rounded bg-stone-900/90 text-[10px] text-white px-2 py-0.5 shadow-md">
                      <Move size={10} className="text-emerald-400" />
                      <span>{wmPosX}%, {wmPosY}%</span>
                    </div>
                  </div>
                )}

                {/* Watermark Free-Move Instruction Badge */}
                {isWatermark && !result && (
                  <div className="absolute top-2 left-2 pointer-events-none flex items-center gap-1.5 rounded-full bg-stone-900/80 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-emerald-400 border border-emerald-500/30 shadow-md">
                    <Move size={12} className="animate-pulse" />
                    <span>Click or Drag anywhere on image to move watermark</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>Original: {formatFileSize(selectedFile.size)}</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setResult(null);
                  }}
                  className="hover:text-stone-800 dark:hover:text-stone-200 underline"
                >
                  Choose different image
                </button>
              </div>
            </div>

            {/* Adjustment Controls */}
            <div
              className="space-y-4 p-5 rounded-[14px] border"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-2 pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
                <Sliders size={16} style={{ color: 'var(--color-accent-primary)' }} />
                <span className="text-sm font-semibold">Settings</span>
              </div>

              {/* Watermark Controls */}
              {isWatermark && (
                <div className="space-y-4">
                  {/* Type Selector (Text vs Image/Logo) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-500 block">Watermark Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setWmType('text')}
                        className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl border transition-all ${
                          wmType === 'text' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-stone-100 dark:bg-stone-800'
                        }`}
                        style={{ borderColor: 'var(--border)' }}
                      >
                        <Type size={14} />
                        <span>Text Stamp</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setWmType('image');
                          if (!wmImageDataUrl && wmFileInputRef.current) {
                            wmFileInputRef.current.click();
                          }
                        }}
                        className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl border transition-all ${
                          wmType === 'image' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-stone-100 dark:bg-stone-800'
                        }`}
                        style={{ borderColor: 'var(--border)' }}
                      >
                        <ImageIcon size={14} />
                        <span>Image / Logo Upload</span>
                      </button>
                    </div>
                  </div>

                  {/* Text Watermark Controls */}
                  {wmType === 'text' && (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium">Watermark Text</label>
                        <input
                          type="text"
                          value={watermarkText}
                          onChange={(e) => setWatermarkText(e.target.value)}
                          placeholder="e.g. © 2026 Alee Tools"
                          className="w-full px-3 py-2 text-sm rounded-xl border outline-none bg-transparent font-medium"
                          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-medium block">Text Color</label>
                          <input
                            type="color"
                            value={wmColor}
                            onChange={(e) => setWmColor(e.target.value)}
                            className="h-9 w-full cursor-pointer rounded-xl border bg-transparent p-0.5"
                            style={{ borderColor: 'var(--border)' }}
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-medium">
                            <span>Font Size</span>
                            <span>{wmFontSize}px</span>
                          </div>
                          <input
                            type="range"
                            min="14"
                            max="120"
                            value={wmFontSize}
                            onChange={(e) => setWmFontSize(Number(e.target.value))}
                            className="w-full accent-emerald-600 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Image / Logo Upload Controls */}
                  {wmType === 'image' && (
                    <div className="space-y-3">
                      <input
                        ref={wmFileInputRef}
                        type="file"
                        accept="image/*,.svg,.ico"
                        className="hidden"
                        onChange={handleWmImageUpload}
                      />
                      <div
                        onClick={() => wmFileInputRef.current?.click()}
                        className="p-3 border-2 border-dashed rounded-xl cursor-pointer flex flex-col items-center justify-center text-center hover:border-emerald-500 transition-colors"
                        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}
                      >
                        {wmImageDataUrl ? (
                          <div className="flex items-center gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={wmImageDataUrl} alt="Logo preview" className="h-10 w-10 object-contain rounded border bg-white p-0.5" />
                            <div className="text-left">
                              <p className="text-xs font-bold truncate max-w-[180px]">{wmImageFile?.name || 'Uploaded Logo'}</p>
                              <p className="text-[11px] text-stone-500">Click to change watermark logo</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-stone-500">
                            <UploadCloud size={20} className="text-emerald-600" />
                            <span className="text-xs font-semibold">Upload Logo (PNG, JPG, SVG, Icon)</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span>Logo Scale / Size</span>
                          <span>{wmScale}%</span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="100"
                          value={wmScale}
                          onChange={(e) => setWmScale(Number(e.target.value))}
                          className="w-full accent-emerald-600 cursor-pointer"
                        />
                      </div>
                    </div>
                  )}

                  {/* Common Controls: Opacity, Rotation, Presets */}
                  <div className="grid grid-cols-2 gap-3 pt-1 border-t" style={{ borderColor: 'var(--border)' }}>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span>Opacity</span>
                        <span>{wmOpacity}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={wmOpacity}
                        onChange={(e) => setWmOpacity(Number(e.target.value))}
                        className="w-full accent-emerald-600 cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span>Rotation</span>
                        <span>{wmRotation}°</span>
                      </div>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        value={wmRotation}
                        onChange={(e) => setWmRotation(Number(e.target.value))}
                        className="w-full accent-emerald-600 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Quick Position Presets */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-xs font-semibold text-stone-500 block">Quick Position Presets</label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: 'Top-Left', x: 15, y: 15 },
                        { label: 'Top-Right', x: 85, y: 15 },
                        { label: 'Center', x: 50, y: 50 },
                        { label: 'Bottom-Left', x: 15, y: 85 },
                        { label: 'Bottom-Right', x: 85, y: 85 },
                      ].map((p) => (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => {
                            setWmPosX(p.x);
                            setWmPosY(p.y);
                          }}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all ${
                            wmPosX === p.x && wmPosY === p.y ? 'bg-emerald-600 text-white' : 'bg-stone-100 dark:bg-stone-800'
                          }`}
                          style={{ borderColor: 'var(--border)' }}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Quality slider */}
              {(isCompressor || isToJpg || isToWebp) && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span>Quality</span>
                    <span>{quality}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full accent-emerald-700 cursor-pointer"
                  />
                </div>
              )}

              {/* Rotator Controls */}
              {isRotator && (
                <div className="space-y-2">
                  <label className="text-xs font-medium">Rotation Angle</label>
                  <div className="flex gap-2">
                    {[90, 180, 270].map((deg) => (
                      <button
                        key={deg}
                        type="button"
                        onClick={() => setRotateAngle(deg)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                          rotateAngle === deg ? 'bg-emerald-500 text-white' : 'text-stone-600'
                        }`}
                        style={{ borderColor: 'var(--border)' }}
                      >
                        {deg}° Clockwise
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Cropper Ratio Selector */}
              {isCropper && (
                <div className="space-y-2">
                  <label className="text-xs font-medium">Aspect Ratio Crop</label>
                  <div className="flex flex-wrap gap-2">
                    {['1:1', '16:9', '9:16', '4:5', '4:3', '3:2'].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setCropRatio(r)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                          cropRatio === r ? 'bg-emerald-500 text-white' : 'text-stone-600'
                        }`}
                        style={{ borderColor: 'var(--border)' }}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Watermark Text */}
              {isWatermark && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Watermark Stamp Text</label>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm rounded-[10px] border outline-none bg-transparent"
                    style={{ borderColor: 'var(--border)' }}
                  />
                </div>
              )}

              {/* Width & Height for resizers */}
              {isResizer && !is916 && !isCropper && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Width (px)</label>
                    <input
                      type="number"
                      value={width}
                      onChange={(e) => setWidth(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-1.5 text-sm rounded-[10px] border outline-none bg-transparent font-mono"
                      style={{ borderColor: 'var(--border)' }}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Height (px)</label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-1.5 text-sm rounded-[10px] border outline-none bg-transparent font-mono"
                      style={{ borderColor: 'var(--border)' }}
                    />
                  </div>
                </div>
              )}

              {/* Action Button */}
              <ClayButton
                variant="primary"
                onClick={handleProcess}
                disabled={processing}
                className="w-full mt-2"
                icon={processing ? <RefreshCw className="animate-spin" size={16} /> : undefined}
              >
                {processing ? 'Processing...' : `Apply ${tool.name}`}
              </ClayButton>
            </div>
          </div>

          {/* Results Summary & Download */}
          {result && (
            <div
              className="p-5 rounded-[14px] border flex flex-col sm:flex-row items-center justify-between gap-4"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-emerald-700 dark:text-emerald-500" size={24} />
                <div>
                  <h4 className="text-sm font-semibold">Processing Complete</h4>
                  <p className="text-xs text-stone-500">
                    {result.width} × {result.height} px • {formatFileSize(result.size)}
                    {isCompressor && (
                      <span className="ml-1 text-emerald-700 dark:text-emerald-500 font-medium">
                        (Saved {Math.max(0, Math.round((1 - result.size / result.originalSize) * 100))}%)
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <ClayButton variant="primary" onClick={handleDownload} icon={<Download size={16} />}>
                Download Result
              </ClayButton>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
