'use client';

import { useState } from 'react';
import {
  FileText,
  Download,
  CheckCircle2,
  Trash2,
  Layers,
  RotateCw,
  Stamp,
  Hash,
  Info,
  ArrowRight,
  Plus,
  RefreshCw,
  Copy,
  Check,
  Image as ImageIcon,
} from 'lucide-react';
import { ClayButton } from '@/components/ui/ClayButton';
import { FileDropzone } from '@/components/ui/FileDropzone';
import {
  imagesToPdf,
  mergePdfs,
  splitOrExtractPdf,
  rotatePdf,
  watermarkPdf,
  addPageNumbersPdf,
  getPdfInfo,
  downloadPdfBytes,
  convertPdfToJpgPages,
  deletePdfPages,
  reorderPdfPages,
  extractTextFromPdf,
  downloadImageBlob,
  type PdfInfo,
  type PdfPageImage,
} from '@/lib/engines/pdf-engine';
import type { Tool } from '@/lib/tool-registry';

interface PdfToolProps {
  tool: Tool;
}

export function PdfTool({ tool }: PdfToolProps) {
  const slug = tool.slug;

  // Distinct tool modes
  const isPdfToJpg = slug === 'pdf-to-jpg' || slug.includes('to-jpg');
  const isTextExtractor = slug.includes('text');
  const isPageDeleter = slug.includes('deleter');
  const isReorder = slug.includes('reorder');
  const isImageToPdf =
    slug.includes('to-pdf') ||
    slug.includes('maker') ||
    slug.includes('scan') ||
    slug.includes('notes');
  const isMerge = slug.includes('merge');
  const isSplitOrExtract =
    slug.includes('split') ||
    slug.includes('extract');
  const isRotate = slug.includes('rotat');
  const isWatermark = slug.includes('watermark');
  const isPageNumberer = slug.includes('number');
  const isMetadata =
    slug.includes('metadata') ||
    slug.includes('viewer') ||
    slug.includes('unlock') ||
    slug.includes('print');

  // File state
  const [files, setFiles] = useState<File[]>([]);
  const [singlePdf, setSinglePdf] = useState<File | null>(null);
  const [pdfInfo, setPdfInfo] = useState<PdfInfo | null>(null);
  const [processing, setProcessing] = useState(false);
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const [pageJpgImages, setPageJpgImages] = useState<PdfPageImage[]>([]);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  // Settings
  const [pageSize, setPageSize] = useState<'A4' | 'Letter'>('A4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [pageRange, setPageRange] = useState<string>('1');
  const [deletePagesStr, setDeletePagesStr] = useState<string>('2');
  const [reorderPagesStr, setReorderPagesStr] = useState<string>('2, 1');
  const [rotationAngle, setRotationAngle] = useState<number>(90);
  const [watermarkText, setWatermarkText] = useState<string>('CONFIDENTIAL');
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(0.25);
  const [numberPosition, setNumberPosition] = useState<'bottom-center' | 'bottom-right' | 'top-right'>('bottom-center');

  // Handle files
  const handleFilesSelected = async (selected: File[]) => {
    setErrorMsg(null);
    setResultBytes(null);
    setPageJpgImages([]);
    setExtractedText(null);

    if (isImageToPdf || isMerge) {
      setFiles((prev) => [...prev, ...selected]);
    } else {
      // Single PDF operations
      const pdf = selected[0];
      if (pdf) {
        setSinglePdf(pdf);
        try {
          const info = await getPdfInfo(pdf);
          setPdfInfo(info);
          setPageRange(`1-${info.pageCount}`);
          if (info.pageCount > 1) {
            const arr = Array.from({ length: info.pageCount }, (_, i) => i + 1);
            setReorderPagesStr(arr.reverse().join(', '));
          }
        } catch {
          setPageRange('1');
        }
      }
    }
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleProcess = async () => {
    setErrorMsg(null);
    setProcessing(true);

    try {
      if (isPdfToJpg) {
        if (!singlePdf) throw new Error('Please select a PDF file to convert.');
        const images = await convertPdfToJpgPages(singlePdf);
        if (images.length === 0) throw new Error('Could not render any pages from this PDF.');
        setPageJpgImages(images);
      } else if (isTextExtractor) {
        if (!singlePdf) throw new Error('Please select a PDF file.');
        const text = await extractTextFromPdf(singlePdf);
        setExtractedText(text || 'No selectable text could be extracted from this document.');
      } else if (isPageDeleter) {
        if (!singlePdf) throw new Error('Please select a PDF file.');
        const output = await deletePdfPages(singlePdf, deletePagesStr);
        setResultBytes(output);
      } else if (isReorder) {
        if (!singlePdf) throw new Error('Please select a PDF file.');
        const output = await reorderPdfPages(singlePdf, reorderPagesStr);
        setResultBytes(output);
      } else if (isImageToPdf) {
        if (files.length === 0) throw new Error('Please select at least one image.');
        const output = await imagesToPdf(files, pageSize, orientation);
        setResultBytes(output);
      } else if (isMerge) {
        if (files.length < 2) throw new Error('Please select at least 2 PDF files to merge.');
        const output = await mergePdfs(files);
        setResultBytes(output);
      } else if (isSplitOrExtract) {
        if (!singlePdf) throw new Error('Please select a PDF file.');
        const output = await splitOrExtractPdf(singlePdf, pageRange);
        setResultBytes(output);
      } else if (isRotate) {
        if (!singlePdf) throw new Error('Please select a PDF file.');
        const output = await rotatePdf(singlePdf, rotationAngle);
        setResultBytes(output);
      } else if (isWatermark) {
        if (!singlePdf) throw new Error('Please select a PDF file.');
        if (!watermarkText.trim()) throw new Error('Watermark text cannot be empty.');
        const output = await watermarkPdf(singlePdf, watermarkText, watermarkOpacity);
        setResultBytes(output);
      } else if (isPageNumberer) {
        if (!singlePdf) throw new Error('Please select a PDF file.');
        const output = await addPageNumbersPdf(singlePdf, numberPosition);
        setResultBytes(output);
      } else {
        if (!singlePdf) throw new Error('Please select a PDF file.');
        const output = new Uint8Array(await singlePdf.arrayBuffer());
        setResultBytes(output);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!resultBytes) return;
    const baseName = singlePdf ? singlePdf.name.replace(/\.pdf$/i, '') : 'document';
    downloadPdfBytes(resultBytes, `${baseName}-processed.pdf`);
  };

  const downloadAllJpgs = () => {
    const baseName = singlePdf ? singlePdf.name.replace(/\.pdf$/i, '') : 'page';
    pageJpgImages.forEach((img, idx) => {
      setTimeout(() => {
        downloadImageBlob(img.blob, `${baseName}-page-${img.pageNumber}.jpg`);
      }, idx * 300);
    });
  };

  const copyExtractedText = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Multi-file upload for Image-to-PDF or Merge */}
      {(isImageToPdf || isMerge) && (
        <div className="space-y-4">
          <FileDropzone
            accept={isImageToPdf ? 'image/*' : 'application/pdf'}
            multiple
            onFilesSelected={handleFilesSelected}
            title={isImageToPdf ? 'Select or drop images to convert to PDF' : 'Select or drop PDF files to merge'}
            subtitle={isImageToPdf ? 'Supports JPG, PNG, WebP, GIF. Multiple images supported.' : 'Select 2 or more PDF documents.'}
          />

          {files.length > 0 && (
            <div className="space-y-3 p-5 rounded-[16px] border shadow-sm" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold" style={{ color: 'var(--ink)' }}>
                  Selected Files ({files.length})
                </span>
                <button
                  type="button"
                  onClick={() => setFiles([])}
                  className="text-xs text-stone-500 hover:text-red-600 font-medium"
                >
                  Clear all
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2">
                {files.map((file, idx) => (
                  <div
                    key={`${file.name}-${idx}`}
                    className="flex items-center justify-between p-3 rounded-[10px] bg-stone-100 dark:bg-stone-800/60 border text-xs"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <div className="flex items-center gap-2.5 truncate max-w-sm">
                      <span className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="font-semibold truncate">{file.name}</span>
                      <span className="text-stone-500">({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="text-stone-400 hover:text-red-600 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Options for Image-to-PDF */}
          {isImageToPdf && (
            <div className="grid grid-cols-2 gap-4 p-5 rounded-[16px] border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300">Page Size</label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-[10px] border outline-none bg-transparent"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <option value="A4">A4 (Standard 210 × 297 mm)</option>
                  <option value="Letter">US Letter (8.5 × 11 in)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300">Orientation</label>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-[10px] border outline-none bg-transparent"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Single PDF upload for operations */}
      {!isImageToPdf && !isMerge && (
        <div className="space-y-4">
          {!singlePdf ? (
            <FileDropzone
              accept="application/pdf"
              onFilesSelected={handleFilesSelected}
              title={`Select a PDF file for ${tool.name}`}
              subtitle="High performance engine. Max 50MB."
            />
          ) : (
            <div className="p-5 rounded-[16px] border space-y-4 shadow-sm" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-[10px] bg-red-100 dark:bg-red-950/50 flex items-center justify-center text-red-600">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold truncate max-w-md" style={{ color: 'var(--ink)' }}>
                      {singlePdf.name}
                    </h4>
                    <p className="text-xs text-stone-500 font-medium">
                      {(singlePdf.size / 1024).toFixed(1)} KB • {pdfInfo ? `${pdfInfo.pageCount} Pages` : 'Reading PDF...'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSinglePdf(null);
                    setResultBytes(null);
                    setPageJpgImages([]);
                    setExtractedText(null);
                  }}
                  className="text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 underline font-medium"
                >
                  Change file
                </button>
              </div>

              {/* Tool specific settings */}
              {isSplitOrExtract && (
                <div className="space-y-1.5 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                    Extract Page Range (e.g. 1-3, 5)
                  </label>
                  <input
                    type="text"
                    value={pageRange}
                    onChange={(e) => setPageRange(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono font-semibold rounded-[10px] border outline-none bg-transparent"
                    style={{ borderColor: 'var(--border)' }}
                  />
                </div>
              )}

              {isPageDeleter && (
                <div className="space-y-1.5 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                    Page Numbers to Delete (e.g. 2 or 2-4)
                  </label>
                  <input
                    type="text"
                    value={deletePagesStr}
                    onChange={(e) => setDeletePagesStr(e.target.value)}
                    placeholder="2"
                    className="w-full px-3 py-2 text-xs font-mono font-semibold rounded-[10px] border outline-none bg-transparent"
                    style={{ borderColor: 'var(--border)' }}
                  />
                  <p className="text-[11px] text-stone-500">
                    Total pages in document: {pdfInfo?.pageCount || '...'}. Specified pages will be permanently removed.
                  </p>
                </div>
              )}

              {isReorder && (
                <div className="space-y-1.5 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                    New Page Sequence (e.g. 3, 1, 2)
                  </label>
                  <input
                    type="text"
                    value={reorderPagesStr}
                    onChange={(e) => setReorderPagesStr(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono font-semibold rounded-[10px] border outline-none bg-transparent"
                    style={{ borderColor: 'var(--border)' }}
                  />
                </div>
              )}

              {isRotate && (
                <div className="space-y-1.5 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300">Rotation Angle</label>
                  <div className="flex gap-2">
                    {[90, 180, 270].map((deg) => (
                      <button
                        key={deg}
                        type="button"
                        onClick={() => setRotationAngle(deg)}
                        className={`px-3 py-1.5 rounded-[8px] text-xs font-bold border transition-all ${
                          rotationAngle === deg
                            ? 'bg-emerald-700 text-white'
                            : 'text-stone-600 dark:text-stone-300'
                        }`}
                        style={{ borderColor: 'var(--border)' }}
                      >
                        {deg}° Clockwise
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isWatermark && (
                <div className="space-y-3 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300">Watermark Text</label>
                    <input
                      type="text"
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-semibold rounded-[10px] border outline-none bg-transparent"
                      style={{ borderColor: 'var(--border)' }}
                    />
                  </div>
                </div>
              )}

              {/* Metadata Preview Card */}
              {isMetadata && pdfInfo && (
                <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                    Document Information
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2.5 rounded-[8px] bg-stone-100 dark:bg-stone-800">
                      <div className="text-stone-500 font-medium">Pages</div>
                      <div className="font-bold">{pdfInfo.pageCount}</div>
                    </div>
                    <div className="p-2.5 rounded-[8px] bg-stone-100 dark:bg-stone-800">
                      <div className="text-stone-500 font-medium">Title</div>
                      <div className="font-bold truncate">{pdfInfo.title}</div>
                    </div>
                    <div className="p-2.5 rounded-[8px] bg-stone-100 dark:bg-stone-800">
                      <div className="text-stone-500 font-medium">Author</div>
                      <div className="font-bold truncate">{pdfInfo.author}</div>
                    </div>
                    <div className="p-2.5 rounded-[8px] bg-stone-100 dark:bg-stone-800">
                      <div className="text-stone-500 font-medium">Producer</div>
                      <div className="font-bold truncate">{pdfInfo.producer}</div>
                    </div>
                    <div className="p-2.5 rounded-[8px] bg-stone-100 dark:bg-stone-800 col-span-2">
                      <div className="text-stone-500 font-medium">Created</div>
                      <div className="font-semibold truncate">{pdfInfo.creationDate}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Error display */}
      {errorMsg && (
        <div className="p-4 rounded-[12px] bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs font-semibold border border-red-200 dark:border-red-900">
          {errorMsg}
        </div>
      )}

      {/* Primary Action Button */}
      {(files.length > 0 || singlePdf) && (
        <ClayButton
          onClick={handleProcess}
          disabled={processing}
          variant="primary"
          className="w-full py-3.5 text-sm font-bold shadow-md flex items-center justify-center gap-2"
          icon={processing ? <RefreshCw size={16} className="animate-spin" /> : undefined}
        >
          {processing
            ? 'Processing...'
            : isPdfToJpg
            ? 'Convert PDF Pages to JPG Images'
            : isTextExtractor
            ? 'Extract Plain Text from PDF'
            : `Apply ${tool.name}`}
        </ClayButton>
      )}

      {/* -------------------------------------------------------------------------
          OUTPUT 1: PDF TO JPG IMAGES OUTPUT
          ------------------------------------------------------------------------- */}
      {isPdfToJpg && pageJpgImages.length > 0 && (
        <div className="space-y-4 rounded-2xl border p-5 shadow-sm" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                  JPG Images Ready!
                </h4>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Successfully converted {pageJpgImages.length} {pageJpgImages.length === 1 ? 'page' : 'pages'} to high-resolution JPEG.
              </p>
            </div>

            <ClayButton
              variant="primary"
              onClick={downloadAllJpgs}
              className="flex items-center gap-2 py-2 text-xs"
            >
              <Download size={14} />
              Download All Pages (.JPG)
            </ClayButton>
          </div>

          {/* Individual Page Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {pageJpgImages.map((img) => (
              <div
                key={img.pageNumber}
                className="group relative overflow-hidden rounded-xl border p-3 shadow-sm space-y-3 flex flex-col justify-between"
                style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border bg-white flex items-center justify-center">
                  <img
                    src={img.dataUrl}
                    alt={`Page ${img.pageNumber}`}
                    className="max-h-full max-w-full object-contain"
                  />
                  <span className="absolute top-2 left-2 rounded-md bg-stone-900/80 px-2 py-0.5 text-[11px] font-bold text-white shadow">
                    Page {img.pageNumber}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
                    <span>{img.width} × {img.height} px</span>
                    <span>{(img.blob.size / 1024).toFixed(1)} KB</span>
                  </div>

                  <ClayButton
                    variant="outline"
                    onClick={() => {
                      const baseName = singlePdf ? singlePdf.name.replace(/\.pdf$/i, '') : 'page';
                      downloadImageBlob(img.blob, `${baseName}-page-${img.pageNumber}.jpg`);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold"
                  >
                    <Download size={13} />
                    Download Page {img.pageNumber} (JPG)
                  </ClayButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------
          OUTPUT 2: EXTRACTED PLAIN TEXT OUTPUT
          ------------------------------------------------------------------------- */}
      {isTextExtractor && extractedText && (
        <div className="space-y-3 rounded-2xl border p-5 shadow-sm" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Extracted Document Text
            </span>
            <button
              onClick={copyExtractedText}
              className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              {copiedText ? <Check size={14} /> : <Copy size={14} />}
              {copiedText ? 'Copied' : 'Copy All Text'}
            </button>
          </div>
          <textarea
            readOnly
            rows={10}
            value={extractedText}
            className="w-full rounded-xl border p-3.5 font-mono text-xs leading-relaxed focus:outline-none"
            style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--ink)' }}
          />
        </div>
      )}

      {/* -------------------------------------------------------------------------
          OUTPUT 3: PDF RESULT DOWNLOAD (For Merge, Split, Rotate, Watermark, etc.)
          ------------------------------------------------------------------------- */}
      {!isPdfToJpg && !isTextExtractor && resultBytes && (
        <div
          className="p-5 rounded-[16px] border flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm"
          style={{
            background: 'rgba(44, 110, 89, 0.08)',
            borderColor: 'var(--color-accent-primary)',
          }}
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 size={26} className="text-emerald-600 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                PDF Ready for Download!
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                Output size: <strong>{(resultBytes.length / 1024).toFixed(1)} KB</strong>. Formatted and ready.
              </p>
            </div>
          </div>

          <ClayButton
            onClick={handleDownloadPdf}
            variant="primary"
            icon={<Download size={16} />}
          >
            Download PDF
          </ClayButton>
        </div>
      )}
    </div>
  );
}
