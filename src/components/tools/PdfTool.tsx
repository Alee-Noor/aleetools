'use client';

import { useState, useEffect } from 'react';
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
  Lock,
  Unlock,
  Key,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Sliders,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Grid,
  CheckSquare,
  Square,
  Scissors,
  Printer,
  Minimize2,
  Maximize2,
  X,
} from 'lucide-react';
import { ClayButton } from '@/components/ui/ClayButton';
import { FileDropzone } from '@/components/ui/FileDropzone';
import { generatePassword } from '@/lib/engines/generator-engine';
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
  protectPdf,
  unlockPdf,
  checkPdfEncryption,
  parsePageRange,
  formatPageIndicesToRange,
  renderPdfThumbnails,
  renderSinglePdfPage,
  splitPdfToIndividualPages,
  compressPdf,
  rotateSpecificPdfPages,
  optimizeForPrintPdf,
  type PdfInfo,
  type PdfPageImage,
  type PdfThumbnail,
  type SplitPageResult,
} from '@/lib/engines/pdf-engine';
import type { Tool } from '@/lib/tool-registry';
import type { Locale } from '@/lib/i18n';

interface PdfToolProps {
  tool: Tool;
  locale?: Locale;
}

export function PdfTool({ tool, locale }: PdfToolProps) {
  const slug = tool.slug;

  // Distinct tool modes
  const isSplit = slug === 'split-pdf';
  const isExtract = slug === 'pdf-page-extractor';
  const isPageDeleter = slug === 'pdf-page-deleter' || slug.includes('deleter');
  const isReorder = slug === 'pdf-reorder' || slug.includes('reorder');
  const isRotate = slug === 'pdf-rotator' || slug.includes('rotat');
  const isCompress = slug === 'pdf-compressor' || slug.includes('compress');
  const isViewer = slug === 'pdf-viewer';
  const isPrintOptimizer = slug === 'pdf-print-optimizer';
  const isPdfToJpg = slug === 'pdf-to-jpg' || slug.includes('to-jpg');
  const isTextExtractor = slug === 'pdf-text-extractor' || (slug.includes('text') && !slug.includes('watermark'));
  const isWatermark = slug === 'pdf-watermark' || slug.includes('watermark');
  const isPageNumberer = slug === 'pdf-page-numberer' || slug.includes('number');
  const isPasswordProtect =
    slug === 'pdf-password-generator' ||
    slug.includes('protect') ||
    (slug.includes('password') && !slug.includes('unlock'));
  const isUnlock = slug === 'pdf-unlocker' || slug.includes('unlock');
  const isImageToPdf =
    slug.includes('to-pdf') ||
    slug.includes('maker') ||
    slug.includes('scan') ||
    slug.includes('notes');
  const isMerge = slug === 'merge-pdf' || slug.includes('merge');
  const isMetadata =
    (slug === 'pdf-metadata-viewer' || slug.includes('metadata')) &&
    !isUnlock &&
    !isPasswordProtect;

  // Check if tool benefits from visual page cards
  const usesVisualPageGrid = isSplit || isExtract || isPageDeleter || isRotate || isReorder || isViewer;

  // Multi-file state
  const [files, setFiles] = useState<File[]>([]);

  // Single PDF state
  const [singlePdf, setSinglePdf] = useState<File | null>(null);
  const [pdfInfo, setPdfInfo] = useState<PdfInfo | null>(null);
  const [processing, setProcessing] = useState(false);
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const [pageJpgImages, setPageJpgImages] = useState<PdfPageImage[]>([]);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  // Visual Page Cards & Thumbnails state
  const [thumbnails, setThumbnails] = useState<PdfThumbnail[]>([]);
  const [loadingThumbnails, setLoadingThumbnails] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [pageOrder, setPageOrder] = useState<number[]>([]); // 1-indexed page ordering for reorder
  const [individualRotations, setIndividualRotations] = useState<Record<number, number>>({}); // 0-indexed page -> degrees
  const [activePreviewPage, setActivePreviewPage] = useState<number>(0);

  // Inspection modal states (Enlarge specific page & View full document)
  const [inspectPageNumber, setInspectPageNumber] = useState<number | null>(null);
  const [inspectPageData, setInspectPageData] = useState<PdfThumbnail | null>(null);
  const [loadingInspectPage, setLoadingInspectPage] = useState<boolean>(false);
  const [inspectZoom, setInspectZoom] = useState<number>(100);
  const [showFullDocModal, setShowFullDocModal] = useState<boolean>(false);
  const [fullDocZoom, setFullDocZoom] = useState<number>(100);

  // Split PDF modes
  const [splitMode, setSplitMode] = useState<'range' | 'individual'>('range');
  const [splitResults, setSplitResults] = useState<SplitPageResult[]>([]);

  // Settings
  const [pageSize, setPageSize] = useState<'A4' | 'Letter'>('A4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [pageRange, setPageRange] = useState<string>('1');
  const [deletePagesStr, setDeletePagesStr] = useState<string>('');
  const [reorderPagesStr, setReorderPagesStr] = useState<string>('');
  const [globalRotationAngle, setGlobalRotationAngle] = useState<number>(0); // Default 0 to prevent sideways rendering
  const [watermarkText, setWatermarkText] = useState<string>('CONFIDENTIAL');
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(0.25);
  const [numberPosition, setNumberPosition] = useState<'bottom-center' | 'bottom-right' | 'top-right'>('bottom-center');
  const [compressLevel, setCompressLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [compressedStats, setCompressedStats] = useState<{ origKb: number; newKb: number; savedPercent: number } | null>(null);
  const [viewerZoom, setViewerZoom] = useState<number>(100);
  const [printMargin, setPrintMargin] = useState<number>(24);

  // Password Protection & Unlock State
  const [pdfPassword, setPdfPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(true);
  const [copiedPassword, setCopiedPassword] = useState<boolean>(false);
  const [allowPrinting, setAllowPrinting] = useState<boolean>(true);
  const [allowCopying, setAllowCopying] = useState<boolean>(true);
  const [encryptionAlgorithm, setEncryptionAlgorithm] = useState<'AES-256' | 'RC4'>('AES-256');
  const [showAdvancedCrypto, setShowAdvancedCrypto] = useState<boolean>(false);
  const [isFileEncrypted, setIsFileEncrypted] = useState<boolean | null>(null);
  const [unlockPassword, setUnlockPassword] = useState<string>('');
  const [showUnlockPassword, setShowUnlockPassword] = useState<boolean>(false);

  // Reset all operation states
  const resetResults = () => {
    setResultBytes(null);
    setSplitResults([]);
    setPageJpgImages([]);
    setExtractedText(null);
    setCompressedStats(null);
    setErrorMsg(null);
  };

  // Keyboard navigation for modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setInspectPageNumber(null);
        setShowFullDocModal(false);
      } else if (inspectPageNumber && e.key === 'ArrowLeft') {
        navigateInspectPage('prev');
      } else if (inspectPageNumber && e.key === 'ArrowRight') {
        navigateInspectPage('next');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inspectPageNumber, pdfInfo]);

  // Handle files
  const handleFilesSelected = async (selected: File[]) => {
    resetResults();

    if (isImageToPdf || isMerge) {
      setFiles((prev) => [...prev, ...selected]);
    } else {
      const pdf = selected[0];
      if (pdf) {
        setSinglePdf(pdf);
        setThumbnails([]);
        setSelectedIndices([]);
        setIndividualRotations({});
        setGlobalRotationAngle(0);
        setPdfInfo(null);
        setActivePreviewPage(0);

        // Check if PDF is encrypted
        try {
          const encInfo = await checkPdfEncryption(pdf);
          setIsFileEncrypted(encInfo.encrypted);
        } catch {
          setIsFileEncrypted(null);
        }

        // Read PDF info
        let totalCount = 1;
        try {
          const info = await getPdfInfo(pdf);
          setPdfInfo(info);
          totalCount = info.pageCount;
          setPageRange(`1-${info.pageCount}`);

          // Default reorder sequence: 1, 2, 3...
          const all1Idx = Array.from({ length: totalCount }, (_, i) => i + 1);
          setPageOrder(all1Idx);
          setReorderPagesStr(all1Idx.join(', '));

          // Default selected indices: all pages
          const all0Idx = Array.from({ length: totalCount }, (_, i) => i);
          setSelectedIndices(all0Idx);
        } catch {
          setPageRange('1');
        }

        // Render thumbnails in background if applicable
        if (usesVisualPageGrid || isPdfToJpg || isPrintOptimizer || isWatermark) {
          setLoadingThumbnails(true);
          try {
            const thumbs = await renderPdfThumbnails(pdf, 100, 0.55);
            setThumbnails(thumbs);
          } catch (err) {
            console.warn('Could not generate thumbnails:', err);
          } finally {
            setLoadingThumbnails(false);
          }
        }
      }
    }
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  // ─── Bidirectional Sync: Visual Cards <-> Text Inputs ───

  // When a thumbnail card is clicked to toggle selection
  const togglePageSelection = (idx: number) => {
    const isSelected = selectedIndices.includes(idx);
    const newIndices = isSelected
      ? selectedIndices.filter((i) => i !== idx)
      : [...selectedIndices, idx].sort((a, b) => a - b);

    setSelectedIndices(newIndices);

    // Sync to text inputs
    if (isSplit || isExtract) {
      setPageRange(formatPageIndicesToRange(newIndices));
    } else if (isPageDeleter) {
      setDeletePagesStr(formatPageIndicesToRange(newIndices));
    }
  };

  // Handle manual typing into Page Range input
  const handleRangeInputChange = (val: string) => {
    setPageRange(val);
    if (!pdfInfo) return;
    const indices = parsePageRange(val, pdfInfo.pageCount);
    setSelectedIndices(indices);
  };

  // Handle manual typing into Delete Pages input
  const handleDeleteInputChange = (val: string) => {
    setDeletePagesStr(val);
    if (!pdfInfo) return;
    const indices = parsePageRange(val, pdfInfo.pageCount);
    setSelectedIndices(indices);
  };

  // Quick Select Helpers
  const selectAllPages = () => {
    if (!pdfInfo) return;
    const all = Array.from({ length: pdfInfo.pageCount }, (_, i) => i);
    setSelectedIndices(all);
    const formatted = formatPageIndicesToRange(all);
    if (isSplit || isExtract) setPageRange(formatted);
    if (isPageDeleter) setDeletePagesStr(formatted);
  };

  const clearSelection = () => {
    setSelectedIndices([]);
    if (isSplit || isExtract) setPageRange('');
    if (isPageDeleter) setDeletePagesStr('');
  };

  const selectOddPages = () => {
    if (!pdfInfo) return;
    const odd = Array.from({ length: pdfInfo.pageCount }, (_, i) => i).filter((i) => i % 2 === 0);
    setSelectedIndices(odd);
    const formatted = formatPageIndicesToRange(odd);
    if (isSplit || isExtract) setPageRange(formatted);
    if (isPageDeleter) setDeletePagesStr(formatted);
  };

  const selectEvenPages = () => {
    if (!pdfInfo) return;
    const even = Array.from({ length: pdfInfo.pageCount }, (_, i) => i).filter((i) => i % 2 === 1);
    setSelectedIndices(even);
    const formatted = formatPageIndicesToRange(even);
    if (isSplit || isExtract) setPageRange(formatted);
    if (isPageDeleter) setDeletePagesStr(formatted);
  };

  // ─── Inspection & Enlarge Modals ───

  const openInspectPage = async (pageNumber: number) => {
    if (!singlePdf) return;
    setInspectPageNumber(pageNumber);
    setInspectPageData(null);
    setLoadingInspectPage(true);
    setInspectZoom(100);
    try {
      const data = await renderSinglePdfPage(singlePdf, pageNumber, 2.0);
      setInspectPageData(data);
    } catch (err) {
      console.warn('Failed to render inspect page:', err);
    } finally {
      setLoadingInspectPage(false);
    }
  };

  const navigateInspectPage = (direction: 'prev' | 'next') => {
    if (!inspectPageNumber || !pdfInfo) return;
    const target = direction === 'prev' ? inspectPageNumber - 1 : inspectPageNumber + 1;
    if (target >= 1 && target <= pdfInfo.pageCount) {
      openInspectPage(target);
    }
  };

  // Reorder visual card shift
  const movePageOrder = (currentPos: number, direction: 'left' | 'right') => {
    const targetPos = direction === 'left' ? currentPos - 1 : currentPos + 1;
    if (targetPos < 0 || targetPos >= pageOrder.length) return;

    const newOrder = [...pageOrder];
    const temp = newOrder[currentPos];
    newOrder[currentPos] = newOrder[targetPos];
    newOrder[targetPos] = temp;

    setPageOrder(newOrder);
    setReorderPagesStr(newOrder.join(', '));
  };

  // Rotate individual page thumbnail
  const rotateIndividualPage = (idx: number) => {
    const current = individualRotations[idx] || 0;
    const nextRot = (current + 90) % 360;
    setIndividualRotations((prev) => ({
      ...prev,
      [idx]: nextRot,
    }));
  };

  // Rotate all pages by 90
  const rotateAllPagesBy = (deg: number) => {
    if (!pdfInfo) return;
    const newRots: Record<number, number> = {};
    for (let i = 0; i < pdfInfo.pageCount; i++) {
      newRots[i] = deg;
    }
    setIndividualRotations(newRots);
    setGlobalRotationAngle(deg);
  };

  // Password Generator helpers
  const handleGeneratePassword = () => {
    const generated = generatePassword({
      length: 16,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeAmbiguous: true,
    });
    setPdfPassword(generated);
    setShowPassword(true);
  };

  const handleCopyPassword = (pass: string) => {
    if (!pass) return;
    navigator.clipboard.writeText(pass);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  // ─── Primary Processing Logic ───
  const handleProcess = async () => {
    setErrorMsg(null);
    setProcessing(true);
    resetResults();

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
      } else if (isSplit) {
        if (!singlePdf) throw new Error('Please select a PDF file.');
        if (splitMode === 'individual') {
          // Split into standalone 1-page PDF files
          const targetIndices = selectedIndices.length > 0 ? selectedIndices : undefined;
          const individualResults = await splitPdfToIndividualPages(singlePdf, targetIndices);
          setSplitResults(individualResults);
        } else {
          // Extract chosen range into 1 unified PDF
          if (!pageRange.trim()) throw new Error('Please enter or select at least one page to extract.');
          const output = await splitOrExtractPdf(singlePdf, pageRange);
          setResultBytes(output);
        }
      } else if (isExtract) {
        if (!singlePdf) throw new Error('Please select a PDF file.');
        if (!pageRange.trim()) throw new Error('Please enter or select at least one page to extract.');
        const output = await splitOrExtractPdf(singlePdf, pageRange);
        setResultBytes(output);
      } else if (isPageDeleter) {
        if (!singlePdf) throw new Error('Please select a PDF file.');
        if (!deletePagesStr.trim()) throw new Error('Please select or specify at least one page to delete.');
        const output = await deletePdfPages(singlePdf, deletePagesStr);
        setResultBytes(output);
      } else if (isReorder) {
        if (!singlePdf) throw new Error('Please select a PDF file.');
        const orderStr = reorderPagesStr || pageOrder.join(', ');
        const output = await reorderPdfPages(singlePdf, orderStr);
        setResultBytes(output);
      } else if (isRotate) {
        if (!singlePdf) throw new Error('Please select a PDF file.');
        const hasIndividual = Object.values(individualRotations).some((r) => r > 0);
        let output: Uint8Array;
        if (hasIndividual) {
          output = await rotateSpecificPdfPages(singlePdf, individualRotations);
        } else {
          output = await rotatePdf(singlePdf, globalRotationAngle);
        }
        setResultBytes(output);
      } else if (isCompress) {
        if (!singlePdf) throw new Error('Please select a PDF file to compress.');
        const origKb = Number((singlePdf.size / 1024).toFixed(1));
        const output = await compressPdf(singlePdf, compressLevel);
        const newKb = Number((output.length / 1024).toFixed(1));
        const savedPercent = Math.max(0, Math.round(((origKb - newKb) / origKb) * 100));
        setCompressedStats({ origKb, newKb, savedPercent });
        setResultBytes(output);
      } else if (isPrintOptimizer) {
        if (!singlePdf) throw new Error('Please select a PDF file.');
        const output = await optimizeForPrintPdf(singlePdf, printMargin, pageSize);
        setResultBytes(output);
      } else if (isImageToPdf) {
        if (files.length === 0) throw new Error('Please select at least one image.');
        const output = await imagesToPdf(files, pageSize, orientation);
        setResultBytes(output);
      } else if (isMerge) {
        if (files.length < 2) throw new Error('Please select at least 2 PDF files to merge.');
        const output = await mergePdfs(files);
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
      } else if (isPasswordProtect) {
        if (!singlePdf) throw new Error('Please select a PDF file.');
        if (!pdfPassword.trim()) throw new Error('Please enter a password or click "Generate Strong Password".');
        const output = await protectPdf(singlePdf, pdfPassword, {
          algorithm: encryptionAlgorithm,
          allowPrinting,
          allowCopying,
        });
        setResultBytes(output);
      } else if (isUnlock) {
        if (!singlePdf) throw new Error('Please select a PDF file.');
        if (!unlockPassword.trim()) throw new Error('Please enter the current PDF password to unlock.');
        const output = await unlockPdf(singlePdf, unlockPassword);
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
    let suffix = '-processed.pdf';
    if (isPasswordProtect) suffix = '-protected.pdf';
    else if (isUnlock) suffix = '-unlocked.pdf';
    else if (isSplit) suffix = '-split.pdf';
    else if (isExtract) suffix = '-extracted.pdf';
    else if (isPageDeleter) suffix = '-trimmed.pdf';
    else if (isReorder) suffix = '-reordered.pdf';
    else if (isRotate) suffix = '-rotated.pdf';
    else if (isCompress) suffix = '-compressed.pdf';
    else if (isPrintOptimizer) suffix = '-print-ready.pdf';

    downloadPdfBytes(resultBytes, `${baseName}${suffix}`);
  };

  const downloadAllSplitPdfs = () => {
    splitResults.forEach((res, idx) => {
      setTimeout(() => {
        downloadPdfBytes(res.bytes, res.fileName);
      }, idx * 250);
    });
  };

  const downloadAllJpgs = () => {
    const baseName = singlePdf ? singlePdf.name.replace(/\.pdf$/i, '') : 'page';
    pageJpgImages.forEach((img, idx) => {
      setTimeout(() => {
        downloadImageBlob(img.blob, `${baseName}-page-${img.pageNumber}.jpg`);
      }, idx * 250);
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
              subtitle="High performance client engine. Max 50MB."
            />
          ) : (
            <div className="p-5 rounded-[16px] border space-y-5 shadow-sm" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              {/* File Info Header */}
              <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-[10px] bg-red-100 dark:bg-red-950/50 flex items-center justify-center text-red-600 shrink-0">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold truncate max-w-md" style={{ color: 'var(--ink)' }}>
                      {singlePdf.name}
                    </h4>
                    <p className="text-xs text-stone-500 font-medium">
                      {(singlePdf.size / 1024).toFixed(1)} KB • {pdfInfo ? `${pdfInfo.pageCount} Pages` : isFileEncrypted ? 'Password Protected' : 'Reading...'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSinglePdf(null);
                    resetResults();
                    setThumbnails([]);
                    setSelectedIndices([]);
                    setIndividualRotations({});
                    setPdfPassword('');
                    setUnlockPassword('');
                    setIsFileEncrypted(null);
                    setInspectPageNumber(null);
                    setShowFullDocModal(false);
                    setActivePreviewPage(0);
                  }}
                  className="text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 underline font-medium"
                >
                  Change file
                </button>
              </div>

              {/* ─────────────────────────────────────────────────────────────
                  A. TOOL CONFIGURATION PANELS
                  ───────────────────────────────────────────────────────────── */}

              {/* SPLIT PDF DISTINCT MODES */}
              {isSplit && (
                <div className="space-y-3">
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider block">
                    Split Mode
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSplitMode('range')}
                      className={`p-3 rounded-[12px] border text-left transition-all ${
                        splitMode === 'range'
                          ? 'border-emerald-600 bg-emerald-500/10'
                          : 'border-stone-200 dark:border-stone-700 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`h-4 w-4 rounded-full border flex items-center justify-center ${splitMode === 'range' ? 'border-emerald-600 bg-emerald-600' : 'border-stone-400'}`}>
                          {splitMode === 'range' && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </span>
                        <span className="text-xs font-bold text-stone-800 dark:text-stone-200">Extract Page Range</span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-1 pl-6">
                        Combines selected pages into 1 consolidated PDF document.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSplitMode('individual')}
                      className={`p-3 rounded-[12px] border text-left transition-all ${
                        splitMode === 'individual'
                          ? 'border-emerald-600 bg-emerald-500/10'
                          : 'border-stone-200 dark:border-stone-700 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`h-4 w-4 rounded-full border flex items-center justify-center ${splitMode === 'individual' ? 'border-emerald-600 bg-emerald-600' : 'border-stone-400'}`}>
                          {splitMode === 'individual' && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </span>
                        <span className="text-xs font-bold text-stone-800 dark:text-stone-200">Separate Files (1 PDF per page)</span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-1 pl-6">
                        Splits each page into its own standalone PDF file for individual download.
                      </p>
                    </button>
                  </div>
                </div>
              )}

              {/* Range Input for Split (Range mode) & Extractor */}
              {(isExtract || (isSplit && splitMode === 'range')) && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                      Pages to Extract (Select visually below or type e.g. 1-3, 5)
                    </label>
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                      {selectedIndices.length} {selectedIndices.length === 1 ? 'page' : 'pages'} selected
                    </span>
                  </div>
                  <input
                    type="text"
                    value={pageRange}
                    onChange={(e) => handleRangeInputChange(e.target.value)}
                    placeholder="1-3, 5"
                    className="w-full px-3 py-2 text-xs font-mono font-semibold rounded-[10px] border outline-none bg-transparent"
                    style={{ borderColor: 'var(--border)' }}
                  />
                </div>
              )}

              {/* Deleter Input */}
              {isPageDeleter && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                      Pages to Delete (Click thumbnails below to mark for deletion)
                    </label>
                    <span className="text-[11px] font-semibold text-red-600 dark:text-red-400">
                      {selectedIndices.length} {selectedIndices.length === 1 ? 'page' : 'pages'} to delete
                    </span>
                  </div>
                  <input
                    type="text"
                    value={deletePagesStr}
                    onChange={(e) => handleDeleteInputChange(e.target.value)}
                    placeholder="e.g. 2, 4-5"
                    className="w-full px-3 py-2 text-xs font-mono font-semibold rounded-[10px] border outline-none bg-transparent text-red-600 dark:text-red-400"
                    style={{ borderColor: 'var(--border)' }}
                  />
                  <p className="text-[11px] text-stone-500">
                    Total pages: {pdfInfo?.pageCount || '...'}. Marked pages will be permanently removed.
                  </p>
                </div>
              )}

              {/* Reorder Input */}
              {isReorder && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                    Page Sequence (Use arrow buttons below or enter sequence)
                  </label>
                  <input
                    type="text"
                    value={reorderPagesStr}
                    onChange={(e) => {
                      setReorderPagesStr(e.target.value);
                      const parsed = e.target.value
                        .split(',')
                        .map((n) => parseInt(n.trim(), 10))
                        .filter((n) => !isNaN(n));
                      if (parsed.length > 0) setPageOrder(parsed);
                    }}
                    placeholder="3, 1, 2"
                    className="w-full px-3 py-2 text-xs font-mono font-semibold rounded-[10px] border outline-none bg-transparent"
                    style={{ borderColor: 'var(--border)' }}
                  />
                </div>
              )}

              {/* Rotator Controls */}
              {isRotate && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                    Rotation Controls
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[90, 180, 270].map((deg) => (
                      <button
                        key={deg}
                        type="button"
                        onClick={() => rotateAllPagesBy(deg)}
                        className={`px-3 py-1.5 rounded-[8px] text-xs font-bold border transition-all ${
                          globalRotationAngle === deg && Object.values(individualRotations).length === 0
                            ? 'bg-emerald-700 text-white'
                            : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                        }`}
                        style={{ borderColor: 'var(--border)' }}
                      >
                        Rotate All {deg}°
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setIndividualRotations({});
                        setGlobalRotationAngle(0);
                      }}
                      className="px-3 py-1.5 rounded-[8px] text-xs font-medium border text-stone-500 hover:text-stone-800"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      Reset Rotations
                    </button>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Tip: You can also click the rotate icon on individual page cards below to rotate specific pages independently.
                  </p>
                </div>
              )}

              {/* PDF Compressor Controls */}
              {isCompress && (
                <div className="space-y-3">
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider block">
                    Compression Level
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'medium', title: 'Recommended', desc: 'Optimal balance of size & sharpness (~50% reduction)' },
                      { id: 'high', title: 'High Compression', desc: 'Smallest file size for email & uploads (~70% reduction)' },
                      { id: 'low', title: 'Light', desc: 'Maximum visual clarity with minor size reduction' },
                    ].map((lvl) => (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => setCompressLevel(lvl.id as any)}
                        className={`p-3 rounded-[12px] border text-left transition-all ${
                          compressLevel === lvl.id
                            ? 'border-emerald-600 bg-emerald-500/10'
                            : 'border-stone-200 dark:border-stone-700 hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`h-3.5 w-3.5 rounded-full border flex items-center justify-center ${compressLevel === lvl.id ? 'border-emerald-600 bg-emerald-600' : 'border-stone-400'}`}>
                            {compressLevel === lvl.id && <span className="h-1 w-1 rounded-full bg-white" />}
                          </span>
                          <span className="text-xs font-bold text-stone-800 dark:text-stone-200">{lvl.title}</span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-1 pl-5.5">{lvl.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* PDF Print Optimizer Controls & Real-Time Preview */}
              {isPrintOptimizer && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-stone-700 dark:text-stone-300">Print Margins</label>
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          {printMargin === 0 ? 'Full Bleed (0 pt)' : `${printMargin} pt (~${(printMargin * 0.352778).toFixed(1)} mm)`}
                        </span>
                      </div>
                      <select
                        value={printMargin}
                        onChange={(e) => setPrintMargin(parseInt(e.target.value, 10))}
                        className="w-full px-3 py-2 text-xs font-semibold rounded-[10px] border outline-none bg-transparent"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        <option value="0">Zero Margins (Full Bleed)</option>
                        <option value="16">Narrow (16 pt / ~6 mm)</option>
                        <option value="24">Standard (24 pt / ~8.5 mm)</option>
                        <option value="40">Wide (40 pt / ~14 mm)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-stone-700 dark:text-stone-300">Target Paper Size</label>
                        <span className="text-[11px] font-semibold text-stone-500">
                          {pageSize === 'A4' ? 'A4 (210 × 297 mm)' : 'US Letter (8.5 × 11 in)'}
                        </span>
                      </div>
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
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mr-1">
                        Margin Presets:
                      </span>
                      {[
                        { label: 'Zero (0 pt)', val: 0 },
                        { label: 'Narrow (16 pt)', val: 16 },
                        { label: 'Standard (24 pt)', val: 24 },
                        { label: 'Wide (40 pt)', val: 40 },
                      ].map((p) => (
                        <button
                          key={p.val}
                          type="button"
                          onClick={() => setPrintMargin(p.val)}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-[8px] border transition-all ${
                            printMargin === p.val
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                              : 'border-stone-200 dark:border-stone-700 hover:border-emerald-600 text-stone-600 dark:text-stone-300'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mr-1">
                        Paper:
                      </span>
                      {(['A4', 'Letter'] as const).map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setPageSize(size)}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-[8px] border transition-all ${
                            pageSize === size
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                              : 'border-stone-200 dark:border-stone-700 hover:border-emerald-600 text-stone-600 dark:text-stone-300'
                          }`}
                        >
                          {size === 'A4' ? 'A4' : 'US Letter'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ─────────────────────────────────────────────────────────────
                      REAL-TIME PRINT SHEET PREVIEW
                      ───────────────────────────────────────────────────────────── */}
                  <div className="pt-2 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Printer size={16} className="text-emerald-600 dark:text-emerald-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                          Real-Time Print Preview
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                          Live
                        </span>
                      </div>

                      {/* Multi-page Navigation */}
                      {thumbnails.length > 1 && (
                        <div className="flex items-center gap-2 text-xs">
                          <button
                            type="button"
                            disabled={activePreviewPage === 0}
                            onClick={() => setActivePreviewPage((p) => Math.max(0, p - 1))}
                            className="p-1 rounded-[6px] border text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{ borderColor: 'var(--border)' }}
                            title="Previous page"
                          >
                            <ChevronLeft size={14} />
                          </button>
                          <span className="font-semibold text-stone-700 dark:text-stone-300 text-xs">
                            Page <strong>{activePreviewPage + 1}</strong> of {thumbnails.length}
                          </span>
                          <button
                            type="button"
                            disabled={activePreviewPage >= thumbnails.length - 1}
                            onClick={() => setActivePreviewPage((p) => Math.min(thumbnails.length - 1, p + 1))}
                            className="p-1 rounded-[6px] border text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{ borderColor: 'var(--border)' }}
                            title="Next page"
                          >
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Stage Container */}
                    <div
                      className="p-5 sm:p-7 rounded-[16px] border flex flex-col items-center justify-center relative overflow-hidden"
                      style={{
                        background: 'radial-gradient(ellipse at top, rgba(44,110,89,0.06) 0%, rgba(0,0,0,0.03) 100%)',
                        borderColor: 'var(--border)',
                      }}
                    >
                      {loadingThumbnails ? (
                        <div className="py-16 text-center space-y-3">
                          <RefreshCw size={26} className="animate-spin text-emerald-600 mx-auto" />
                          <p className="text-xs font-semibold text-stone-500">
                            Rendering high-clarity PDF page preview...
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center w-full">
                          {/* Simulated Paper Sheet */}
                          <div
                            className="relative bg-white shadow-2xl rounded-[3px] transition-all duration-300 border border-stone-300/80 flex items-center justify-center overflow-hidden"
                            style={{
                              width: pageSize === 'Letter' ? '280px' : '260px',
                              height: pageSize === 'Letter' ? '362px' : '368px',
                              padding: printMargin === 0
                                ? '0px'
                                : `${Math.max(4, Math.round(printMargin * 0.4))}px`,
                            }}
                          >
                            {/* Non-printable margin stripe background indicator */}
                            {printMargin > 0 && (
                              <div
                                className="absolute inset-0 pointer-events-none opacity-20"
                                style={{
                                  backgroundImage: 'repeating-linear-gradient(45deg, #10b981 0, #10b981 1px, transparent 0, transparent 8px)',
                                }}
                              />
                            )}

                            {/* Printable Boundary Border */}
                            <div
                              className={`w-full h-full relative transition-all duration-300 flex items-center justify-center bg-white ${
                                printMargin > 0
                                  ? 'border-2 border-dashed border-emerald-500/70 shadow-sm'
                                  : 'border-0'
                              }`}
                            >
                              {/* Rendered PDF Page Image */}
                              {thumbnails[activePreviewPage]?.dataUrl ? (
                                <img
                                  src={thumbnails[activePreviewPage].dataUrl}
                                  alt={`Page ${activePreviewPage + 1} Print Preview`}
                                  className="w-full h-full object-contain pointer-events-none select-none"
                                />
                              ) : (
                                <div className="p-4 text-center text-stone-400 text-xs">
                                  <FileText size={32} className="mx-auto text-stone-300 mb-1" />
                                  Page {activePreviewPage + 1}
                                </div>
                              )}

                              {/* Margin badge overlay */}
                              {printMargin > 0 && (
                                <div className="absolute top-1 right-1 bg-emerald-700/85 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow-sm pointer-events-none">
                                  {printMargin} pt safe
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Paper Sheet Caption */}
                          <div className="mt-3 flex items-center gap-2 text-xs text-stone-500 font-medium">
                            <span className="font-bold text-stone-700 dark:text-stone-300">
                              {pageSize === 'A4' ? 'A4 Paper (210 × 297 mm)' : 'US Letter (8.5 × 11 in)'}
                            </span>
                            <span>•</span>
                            <span>
                              {printMargin === 0 ? 'Zero Margins (Full Bleed)' : `${printMargin} pt (~${(printMargin * 0.352778).toFixed(1)} mm) Safe Margins`}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Multi-page Thumbnail Filmstrip */}
                    {thumbnails.length > 1 && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-[11px] text-stone-500">
                          <span className="font-bold uppercase tracking-wider">
                            Page Filmstrip ({thumbnails.length} pages):
                          </span>
                          <span>Click to preview page</span>
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 max-w-full">
                          {thumbnails.map((thumb, idx) => (
                            <button
                              key={thumb.pageNumber}
                              type="button"
                              onClick={() => setActivePreviewPage(idx)}
                              className={`shrink-0 w-12 h-16 rounded-[6px] border-2 transition-all p-0.5 bg-white relative overflow-hidden ${
                                activePreviewPage === idx
                                  ? 'border-emerald-600 shadow-md ring-2 ring-emerald-500/20 scale-105'
                                  : 'border-stone-200 dark:border-stone-700 opacity-60 hover:opacity-100'
                              }`}
                            >
                              <img
                                src={thumb.dataUrl}
                                alt={`Page ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] text-center font-bold font-mono">
                                {idx + 1}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Print Specs Inspection Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center pt-1">
                      <div className="p-2.5 rounded-[10px] border shadow-sm" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                        <div className="text-[10px] font-bold text-stone-500 uppercase">Target Sheet</div>
                        <div className="text-xs font-bold text-stone-800 dark:text-stone-200 mt-0.5">
                          {pageSize === 'A4' ? 'A4 Standard' : 'US Letter'}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-[10px] border shadow-sm" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                        <div className="text-[10px] font-bold text-stone-500 uppercase">Print Margin</div>
                        <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                          {printMargin} pt ({Math.round(printMargin * 0.352778)} mm)
                        </div>
                      </div>
                      <div className="p-2.5 rounded-[10px] border shadow-sm" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                        <div className="text-[10px] font-bold text-stone-500 uppercase">Printable Width</div>
                        <div className="text-xs font-bold text-stone-800 dark:text-stone-200 mt-0.5">
                          {pageSize === 'Letter' ? Math.round(612 - printMargin * 2) : Math.round(595 - printMargin * 2)} pt
                        </div>
                      </div>
                      <div className="p-2.5 rounded-[10px] border shadow-sm" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                        <div className="text-[10px] font-bold text-stone-500 uppercase">Printable Height</div>
                        <div className="text-xs font-bold text-stone-800 dark:text-stone-200 mt-0.5">
                          {pageSize === 'Letter' ? Math.round(792 - printMargin * 2) : Math.round(842 - printMargin * 2)} pt
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Watermark Controls */}
              {isWatermark && (
                <div className="space-y-4">
                  <div className="space-y-3">
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
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-stone-700 dark:text-stone-300">
                        <span>Opacity</span>
                        <span>{Math.round(watermarkOpacity * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.05"
                        max="0.8"
                        step="0.05"
                        value={watermarkOpacity}
                        onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                        className="w-full accent-emerald-600"
                      />
                    </div>
                  </div>

                  {/* Real-time Watermark Preview */}
                  <div className="pt-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <Stamp size={16} className="text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                        Real-Time Watermark Preview
                      </span>
                    </div>

                    <div
                      className="p-5 rounded-[16px] border flex flex-col items-center justify-center"
                      style={{
                        background: 'radial-gradient(ellipse at top, rgba(44,110,89,0.06) 0%, rgba(0,0,0,0.03) 100%)',
                        borderColor: 'var(--border)',
                      }}
                    >
                      {loadingThumbnails ? (
                        <div className="py-12 text-center">
                          <RefreshCw size={24} className="animate-spin text-emerald-600 mx-auto" />
                        </div>
                      ) : thumbnails[activePreviewPage]?.dataUrl ? (
                        <div className="relative shadow-2xl rounded-[3px] border border-stone-300/80 bg-white overflow-hidden max-w-[240px]">
                          <img
                            src={thumbnails[activePreviewPage].dataUrl}
                            alt="Watermark live preview"
                            className="w-full h-auto object-contain pointer-events-none select-none"
                          />
                          <div
                            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none px-4"
                            style={{
                              transform: 'rotate(-45deg)',
                              color: '#e11d48',
                              opacity: watermarkOpacity,
                              fontWeight: 'bold',
                              fontSize: '20px',
                              letterSpacing: '1px',
                              textShadow: '0 0 1px rgba(0,0,0,0.2)',
                              textAlign: 'center',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {watermarkText || 'WATERMARK'}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              )}

              {/* Password Protect Controls */}
              {isPasswordProtect && (
                <div className="space-y-4">
                  {isFileEncrypted === true && (
                    <div className="flex items-start gap-2.5 p-3 rounded-[10px] bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs">
                      <AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                      <div>
                        <span className="font-bold">This PDF is already password protected.</span>
                        <p className="mt-0.5 text-[11px] opacity-90">
                          If you want to remove or change the password, please use the PDF Unlocker first.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                        <Lock size={14} className="text-emerald-600 dark:text-emerald-400" />
                        Choose or Generate Password
                      </label>
                      <button
                        type="button"
                        onClick={handleGeneratePassword}
                        className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 transition-colors"
                      >
                        <Sparkles size={13} />
                        Generate Strong Password
                      </button>
                    </div>

                    <div className="relative flex items-center">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={pdfPassword}
                        onChange={(e) => setPdfPassword(e.target.value)}
                        placeholder="Enter password or click Generate above..."
                        className="w-full px-3.5 py-2.5 pr-20 text-xs font-mono font-semibold rounded-[10px] border outline-none bg-transparent transition-all focus:border-emerald-600 dark:focus:border-emerald-400"
                        style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
                      />
                      <div className="absolute right-2 flex items-center gap-1">
                        {pdfPassword && (
                          <button
                            type="button"
                            onClick={() => handleCopyPassword(pdfPassword)}
                            title="Copy password to clipboard"
                            className="p-1.5 rounded-[6px] text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                          >
                            {copiedPassword ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          title={showPassword ? 'Hide password' : 'Show password'}
                          className="p-1.5 rounded-[6px] text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                        >
                          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-500 pt-1">
                      <span className="flex items-center gap-1">
                        <ShieldCheck size={13} className="text-emerald-600 dark:text-emerald-400" />
                        Processed 100% locally in browser (zero server uploads)
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAdvancedCrypto(!showAdvancedCrypto)}
                        className="flex items-center gap-1 text-[11px] font-semibold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
                      >
                        <Sliders size={12} />
                        {showAdvancedCrypto ? 'Hide Security Options' : 'Security & Permissions Options'}
                      </button>
                    </div>

                    {showAdvancedCrypto && (
                      <div className="p-3.5 rounded-[12px] bg-stone-50 dark:bg-stone-800/40 border space-y-3 mt-2 text-xs" style={{ borderColor: 'var(--border)' }}>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider block">
                            Encryption Algorithm
                          </label>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setEncryptionAlgorithm('AES-256')}
                              className={`px-3 py-1.5 rounded-[8px] text-xs font-bold border transition-all ${
                                encryptionAlgorithm === 'AES-256'
                                  ? 'bg-emerald-700 text-white'
                                  : 'text-stone-600 dark:text-stone-300'
                              }`}
                              style={{ borderColor: 'var(--border)' }}
                            >
                              AES-256 (Modern & High Security)
                            </button>
                            <button
                              type="button"
                              onClick={() => setEncryptionAlgorithm('RC4')}
                              className={`px-3 py-1.5 rounded-[8px] text-xs font-bold border transition-all ${
                                encryptionAlgorithm === 'RC4'
                                  ? 'bg-emerald-700 text-white'
                                  : 'text-stone-600 dark:text-stone-300'
                              }`}
                              style={{ borderColor: 'var(--border)' }}
                            >
                              RC4 128-bit (Legacy Acrobat)
                            </button>
                          </div>
                        </div>

                        <div className="pt-2 border-t space-y-2" style={{ borderColor: 'var(--border)' }}>
                          <label className="text-[11px] font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider block">
                            Document Permissions
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer text-stone-700 dark:text-stone-300">
                            <input
                              type="checkbox"
                              checked={allowPrinting}
                              onChange={(e) => setAllowPrinting(e.target.checked)}
                              className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span>Allow Printing</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer text-stone-700 dark:text-stone-300">
                            <input
                              type="checkbox"
                              checked={allowCopying}
                              onChange={(e) => setAllowCopying(e.target.checked)}
                              className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span>Allow Copying Text & Graphics</span>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PDF Unlocker Controls */}
              {isUnlock && (
                <div className="space-y-3">
                  {isFileEncrypted === false && (
                    <div className="flex items-start gap-2.5 p-3 rounded-[10px] bg-blue-500/10 border border-blue-500/30 text-blue-800 dark:text-blue-300 text-xs">
                      <Info size={16} className="shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
                      <div>
                        <span className="font-bold">This PDF does not appear to be encrypted.</span>
                        <p className="mt-0.5 text-[11px] opacity-90">
                          You can still process it to remove any internal restrictions or permissions.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                      <Unlock size={14} className="text-emerald-600 dark:text-emerald-400" />
                      Enter Document Password to Unlock
                    </label>

                    <div className="relative flex items-center">
                      <input
                        type={showUnlockPassword ? 'text' : 'password'}
                        value={unlockPassword}
                        onChange={(e) => setUnlockPassword(e.target.value)}
                        placeholder="Enter known PDF password..."
                        className="w-full px-3.5 py-2.5 pr-10 text-xs font-mono font-semibold rounded-[10px] border outline-none bg-transparent transition-all focus:border-emerald-600 dark:focus:border-emerald-400"
                        style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowUnlockPassword(!showUnlockPassword)}
                        title={showUnlockPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-2 p-1.5 rounded-[6px] text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                      >
                        {showUnlockPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>

                    <p className="text-[11px] text-stone-500">
                      Enter the current password to decrypt and permanently remove password protection.
                    </p>
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  B. VISUAL PAGE THUMBNAILS CARD GRID WITH INTERACTIVE TICKS
                  ───────────────────────────────────────────────────────────── */}
              {usesVisualPageGrid && (
                <div className="space-y-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2">
                      <Grid size={15} className="text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                        {isViewer ? 'Document Pages' : 'Interactive Page Selector'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      {/* View Full Document Modal Button */}
                      <button
                        type="button"
                        onClick={() => setShowFullDocModal(true)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] border text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border-emerald-600/40 hover:bg-emerald-500/20 transition-all"
                        title="Open full document reader dialog"
                      >
                        <Eye size={13} />
                        <span>View Full Document</span>
                      </button>

                      {!isViewer && (
                        <>
                          <button
                            type="button"
                            onClick={selectAllPages}
                            className="px-2 py-1 rounded-[6px] border text-[11px] font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                            style={{ borderColor: 'var(--border)' }}
                          >
                            Select All
                          </button>
                          <button
                            type="button"
                            onClick={clearSelection}
                            className="px-2 py-1 rounded-[6px] border text-[11px] font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                            style={{ borderColor: 'var(--border)' }}
                          >
                            Clear
                          </button>
                          <button
                            type="button"
                            onClick={selectOddPages}
                            className="px-2 py-1 rounded-[6px] border text-[11px] font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                            style={{ borderColor: 'var(--border)' }}
                          >
                            Odd Pages
                          </button>
                          <button
                            type="button"
                            onClick={selectEvenPages}
                            className="px-2 py-1 rounded-[6px] border text-[11px] font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                            style={{ borderColor: 'var(--border)' }}
                          >
                            Even Pages
                          </button>
                        </>
                      )}

                      {isViewer && (
                        <div className="flex items-center gap-2 text-xs">
                          <button
                            type="button"
                            onClick={() => setViewerZoom((z) => Math.max(50, z - 25))}
                            className="p-1 rounded-[6px] border text-stone-600 dark:text-stone-300"
                            style={{ borderColor: 'var(--border)' }}
                          >
                            <ZoomOut size={13} />
                          </button>
                          <span className="font-mono font-bold text-[11px]">{viewerZoom}%</span>
                          <button
                            type="button"
                            onClick={() => setViewerZoom((z) => Math.min(200, z + 25))}
                            className="p-1 rounded-[6px] border text-stone-600 dark:text-stone-300"
                            style={{ borderColor: 'var(--border)' }}
                          >
                            <ZoomIn size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Thumbnail Cards Container */}
                  {loadingThumbnails ? (
                    <div className="p-8 text-center rounded-[12px] bg-stone-50 dark:bg-stone-800/40 border space-y-2" style={{ borderColor: 'var(--border)' }}>
                      <RefreshCw size={24} className="animate-spin text-emerald-600 mx-auto" />
                      <p className="text-xs text-stone-500 font-medium">Generating high-clarity page thumbnails...</p>
                    </div>
                  ) : thumbnails.length > 0 ? (
                    <div
                      className={`grid gap-3 pt-1 max-h-[480px] overflow-y-auto pr-1 ${
                        isViewer
                          ? 'grid-cols-1 sm:grid-cols-2'
                          : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
                      }`}
                    >
                      {thumbnails.map((thumb, idx) => {
                        const isSelected = selectedIndices.includes(idx);
                        const isDeleterMode = isPageDeleter;
                        // Keep original orientation (0deg) for non-rotator tools!
                        const pageRot = isRotate
                          ? individualRotations[idx] !== undefined
                            ? individualRotations[idx]
                            : globalRotationAngle
                          : 0;

                        return (
                          <div
                            key={thumb.pageNumber}
                            onClick={() => {
                              if (!isViewer) togglePageSelection(idx);
                            }}
                            className={`group relative flex flex-col justify-between overflow-hidden rounded-[12px] border p-2.5 transition-all cursor-pointer ${
                              isDeleterMode
                                ? isSelected
                                  ? 'border-red-500 bg-red-500/10 shadow-sm ring-1 ring-red-500'
                                  : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/40'
                                : isSelected
                                ? 'border-emerald-600 bg-emerald-500/10 shadow-sm ring-1 ring-emerald-600'
                                : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/40 hover:border-stone-300'
                            }`}
                          >
                            {/* Card Top Header: Page Badge + Zoom Inspect + Checkbox */}
                            <div className="flex items-center justify-between mb-2 z-10">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] bg-stone-200/80 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                                #{thumb.pageNumber}
                              </span>

                              <div className="flex items-center gap-1.5">
                                {/* Enlarge Specific Page Button */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openInspectPage(thumb.pageNumber);
                                  }}
                                  title="Enlarge & Inspect this page"
                                  className="p-1 rounded-[4px] text-stone-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-stone-200/70 dark:hover:bg-stone-800 transition-colors"
                                >
                                  <Maximize2 size={12} />
                                </button>

                                {!isViewer && (
                                  <div>
                                    {isDeleterMode ? (
                                      <span
                                        className={`h-4 w-4 rounded-[4px] flex items-center justify-center transition-all ${
                                          isSelected ? 'bg-red-600 text-white' : 'border border-stone-400 bg-white dark:bg-stone-800'
                                        }`}
                                      >
                                        {isSelected ? <Trash2 size={10} /> : null}
                                      </span>
                                    ) : (
                                      <span
                                        className={`h-4 w-4 rounded-[4px] flex items-center justify-center transition-all ${
                                          isSelected ? 'bg-emerald-600 text-white' : 'border border-stone-400 bg-white dark:bg-stone-800'
                                        }`}
                                      >
                                        {isSelected ? <Check size={11} className="stroke-[3]" /> : null}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Page Canvas Thumbnail with Natural Aspect Ratio & Rotation */}
                            <div
                              className="relative w-full overflow-hidden rounded-[8px] bg-white border flex items-center justify-center p-1 shadow-sm"
                              style={{
                                aspectRatio: `${thumb.width} / ${thumb.height}`,
                                minHeight: '140px',
                                maxHeight: '240px',
                              }}
                            >
                              <img
                                src={thumb.dataUrl}
                                alt={`Page ${thumb.pageNumber}`}
                                className="max-h-full max-w-full object-contain transition-transform duration-200"
                                style={{
                                  transform: `rotate(${pageRot}deg)`,
                                }}
                              />

                              {/* Deleter Overlay Watermark */}
                              {isDeleterMode && isSelected && (
                                <div className="absolute inset-0 bg-red-900/20 backdrop-blur-[0.5px] flex items-center justify-center">
                                  <span className="px-2 py-0.5 rounded-[4px] bg-red-600 text-white font-bold text-[10px] shadow">
                                    DELETE
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Card Footer Controls for Specialized Tools */}
                            {isRotate && (
                              <div className="mt-2 pt-1 border-t flex items-center justify-between text-[11px]" style={{ borderColor: 'var(--border)' }}>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    rotateIndividualPage(idx);
                                  }}
                                  className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                                >
                                  <RotateCw size={11} />
                                  <span>{pageRot > 0 ? `${pageRot}°` : 'Rotate 90°'}</span>
                                </button>
                              </div>
                            )}

                            {isReorder && (
                              <div className="mt-2 pt-1 border-t flex items-center justify-between text-[11px]" style={{ borderColor: 'var(--border)' }}>
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    movePageOrder(idx, 'left');
                                  }}
                                  className="p-1 rounded text-stone-500 hover:text-stone-800 disabled:opacity-30"
                                >
                                  <ChevronLeft size={13} />
                                </button>
                                <span className="text-[10px] font-mono font-bold text-stone-600 dark:text-stone-300">
                                  Pos #{idx + 1}
                                </span>
                                <button
                                  type="button"
                                  disabled={idx === thumbnails.length - 1}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    movePageOrder(idx, 'right');
                                  }}
                                  className="p-1 rounded text-stone-500 hover:text-stone-800 disabled:opacity-30"
                                >
                                  <ChevronRight size={13} />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 text-center rounded-[10px] bg-stone-100 dark:bg-stone-800/40 text-xs text-stone-500 font-medium">
                      Page preview ready. ({pdfInfo?.pageCount || 1} pages)
                    </div>
                  )}
                </div>
              )}

              {/* Metadata Preview Card (Metadata viewer tool) */}
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

      {/* ─────────────────────────────────────────────────────────────
          C. MODAL 1: ENLARGE & INSPECT SPECIFIC PAGE
          ───────────────────────────────────────────────────────────── */}
      {inspectPageNumber && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative flex flex-col w-full max-w-4xl max-h-[92vh] rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  Page {inspectPageNumber} of {pdfInfo?.pageCount || 1}
                </span>
                <button
                  type="button"
                  onClick={() => togglePageSelection(inspectPageNumber - 1)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-xs font-semibold border transition-all ${
                    selectedIndices.includes(inspectPageNumber - 1)
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  {selectedIndices.includes(inspectPageNumber - 1) ? (
                    <>
                      <Check size={13} className="stroke-[3]" />
                      <span>Selected</span>
                    </>
                  ) : (
                    <span>Select this page</span>
                  )}
                </button>
              </div>

              {/* Stepper + Zoom + Close */}
              <div className="flex items-center gap-2">
                {/* Stepper */}
                <div className="flex items-center border rounded-[8px] overflow-hidden border-stone-200 dark:border-stone-700">
                  <button
                    type="button"
                    disabled={inspectPageNumber <= 1}
                    onClick={() => navigateInspectPage('prev')}
                    className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30 text-stone-600 dark:text-stone-300"
                    title="Previous Page (Left Arrow)"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    disabled={!pdfInfo || inspectPageNumber >= pdfInfo.pageCount}
                    onClick={() => navigateInspectPage('next')}
                    className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30 text-stone-600 dark:text-stone-300"
                    title="Next Page (Right Arrow)"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                {/* Zoom */}
                <div className="flex items-center border rounded-[8px] overflow-hidden border-stone-200 dark:border-stone-700 text-xs">
                  <button
                    type="button"
                    onClick={() => setInspectZoom((z) => Math.max(50, z - 25))}
                    className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300"
                    title="Zoom Out"
                  >
                    <ZoomOut size={15} />
                  </button>
                  <span className="px-2 font-mono font-bold text-[11px] text-stone-600 dark:text-stone-300">{inspectZoom}%</span>
                  <button
                    type="button"
                    onClick={() => setInspectZoom((z) => Math.min(250, z + 25))}
                    className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300"
                    title="Zoom In"
                  >
                    <ZoomIn size={15} />
                  </button>
                </div>

                {/* Close */}
                <button
                  type="button"
                  onClick={() => setInspectPageNumber(null)}
                  className="p-1.5 rounded-[8px] text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 ml-1"
                  title="Close (Esc)"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Image Body */}
            <div className="flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center bg-stone-100 dark:bg-stone-950/80">
              {loadingInspectPage ? (
                <div className="flex flex-col items-center gap-3 py-16 text-stone-500">
                  <RefreshCw size={28} className="animate-spin text-emerald-600" />
                  <span className="text-xs font-semibold">Rendering high-resolution readable page view...</span>
                </div>
              ) : inspectPageData ? (
                <div
                  className="transition-transform duration-150 origin-center bg-white shadow-2xl rounded-lg p-2 max-w-full"
                  style={{
                    width: `${(inspectZoom / 100) * 100}%`,
                    maxWidth: inspectZoom === 100 ? '780px' : 'none',
                  }}
                >
                  <img
                    src={inspectPageData.dataUrl}
                    alt={`Page ${inspectPageNumber}`}
                    className="w-full h-auto object-contain rounded"
                  />
                </div>
              ) : (
                <div className="text-xs text-stone-500">Failed to render page preview.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          D. MODAL 2: VIEW FULL DOCUMENT IN ONE POPUP DIALOG
          ───────────────────────────────────────────────────────────── */}
      {showFullDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative flex flex-col w-full max-w-5xl max-h-[94vh] rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900">
              <div className="flex items-center gap-2 truncate max-w-md">
                <FileText size={18} className="text-emerald-600 shrink-0" />
                <span className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                  {singlePdf?.name}
                </span>
                <span className="text-xs text-stone-500 shrink-0 font-medium">
                  ({pdfInfo?.pageCount || thumbnails.length} Pages)
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={selectAllPages}
                    className="px-2.5 py-1 rounded-[6px] border text-[11px] font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="px-2.5 py-1 rounded-[6px] border text-[11px] font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    Clear
                  </button>
                </div>

                <div className="flex items-center border rounded-[8px] overflow-hidden border-stone-200 dark:border-stone-700 text-xs">
                  <button
                    type="button"
                    onClick={() => setFullDocZoom((z) => Math.max(50, z - 25))}
                    className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300"
                    title="Zoom Out"
                  >
                    <ZoomOut size={15} />
                  </button>
                  <span className="px-2 font-mono font-bold text-[11px] text-stone-600 dark:text-stone-300">{fullDocZoom}%</span>
                  <button
                    type="button"
                    onClick={() => setFullDocZoom((z) => Math.min(200, z + 25))}
                    className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300"
                    title="Zoom In"
                  >
                    <ZoomIn size={15} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowFullDocModal(false)}
                  className="p-1.5 rounded-[8px] text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
                  title="Close (Esc)"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Body: Vertical Scroll of all Document Pages */}
            <div className="flex-1 overflow-auto p-4 sm:p-8 space-y-8 bg-stone-100 dark:bg-stone-950/80">
              {thumbnails.map((thumb, idx) => {
                const isSelected = selectedIndices.includes(idx);
                return (
                  <div
                    key={thumb.pageNumber}
                    className="mx-auto flex flex-col items-center"
                    style={{
                      width: `${(fullDocZoom / 100) * 100}%`,
                      maxWidth: fullDocZoom === 100 ? '780px' : 'none',
                    }}
                  >
                    {/* Page header bar */}
                    <div className="w-full flex items-center justify-between pb-1.5 px-1 text-xs text-stone-600 dark:text-stone-400 font-semibold">
                      <span>Page {thumb.pageNumber}</span>
                      <button
                        type="button"
                        onClick={() => togglePageSelection(idx)}
                        className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded transition-all ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-300 dark:border-stone-700'
                        }`}
                      >
                        {isSelected ? <Check size={12} className="stroke-[3]" /> : null}
                        <span>{isSelected ? 'Selected' : 'Click to Select'}</span>
                      </button>
                    </div>

                    {/* Page Canvas Container in Natural Aspect Ratio */}
                    <div
                      onClick={() => togglePageSelection(idx)}
                      className={`w-full bg-white shadow-xl rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isSelected
                          ? 'ring-2 ring-emerald-600 border-emerald-600'
                          : 'border-stone-200 dark:border-stone-800 hover:border-stone-400'
                      }`}
                    >
                      <img
                        src={thumb.dataUrl}
                        alt={`Page ${thumb.pageNumber}`}
                        className="w-full h-auto object-contain rounded"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
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
            : isSplit
            ? splitMode === 'individual'
              ? 'Split into Separate PDF Files'
              : 'Extract Selected Pages into PDF'
            : isExtract
            ? 'Extract Selected Pages into PDF'
            : isPageDeleter
            ? 'Delete Selected Pages & Save'
            : isReorder
            ? 'Apply New Page Order & Save'
            : isRotate
            ? 'Apply Rotations & Save PDF'
            : isCompress
            ? 'Compress PDF File'
            : isPrintOptimizer
            ? 'Generate Print-Optimized PDF'
            : isPasswordProtect
            ? 'Apply Password & Protect PDF'
            : isUnlock
            ? 'Unlock & Decrypt PDF'
            : `Apply ${tool.name}`}
        </ClayButton>
      )}

      {/* ─────────────────────────────────────────────────────────────
          OUTPUT 1: SPLIT INTO SEPARATE INDIVIDUAL PDF FILES OUTPUT
          ───────────────────────────────────────────────────────────── */}
      {isSplit && splitResults.length > 0 && (
        <div className="space-y-4 rounded-2xl border p-5 shadow-sm" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                  PDF Split Completed!
                </h4>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Successfully created {splitResults.length} standalone individual PDF documents.
              </p>
            </div>

            <ClayButton
              variant="primary"
              onClick={downloadAllSplitPdfs}
              className="flex items-center gap-2 py-2 text-xs"
            >
              <Download size={14} />
              Download All Split Files ({splitResults.length})
            </ClayButton>
          </div>

          {/* Individual Split PDF Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {splitResults.map((item) => (
              <div
                key={item.pageNumber}
                className="flex items-center justify-between p-3.5 rounded-[12px] border bg-stone-50 dark:bg-stone-800/40 text-xs shadow-sm"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="truncate max-w-[170px]">
                  <span className="font-bold block truncate" style={{ color: 'var(--ink)' }}>
                    Page {item.pageNumber}
                  </span>
                  <span className="text-[11px] text-stone-500">{item.sizeKb} KB</span>
                </div>
                <ClayButton
                  variant="outline"
                  onClick={() => downloadPdfBytes(item.bytes, item.fileName)}
                  className="py-1 px-2.5 text-xs flex items-center gap-1 font-semibold"
                >
                  <Download size={12} />
                  Download
                </ClayButton>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          OUTPUT 2: PDF TO JPG IMAGES OUTPUT
          ───────────────────────────────────────────────────────────── */}
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

      {/* ─────────────────────────────────────────────────────────────
          OUTPUT 3: EXTRACTED PLAIN TEXT OUTPUT
          ───────────────────────────────────────────────────────────── */}
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

      {/* ─────────────────────────────────────────────────────────────
          OUTPUT 4: SINGLE CONSOLIDATED PDF RESULT DOWNLOAD
          ───────────────────────────────────────────────────────────── */}
      {!isPdfToJpg && !isTextExtractor && splitResults.length === 0 && resultBytes && (
        <div
          className="p-5 rounded-[16px] border flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm"
          style={{
            background: 'rgba(44, 110, 89, 0.08)',
            borderColor: 'var(--color-accent-primary)',
          }}
        >
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <CheckCircle2 size={26} className="text-emerald-600 shrink-0" />
            <div className="space-y-1 min-w-0">
              <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                {isPasswordProtect
                  ? 'PDF Password Protected & Ready!'
                  : isUnlock
                  ? 'PDF Unlocked Successfully!'
                  : isCompress
                  ? 'PDF Compressed Successfully!'
                  : isSplit || isExtract
                  ? 'Pages Extracted Successfully!'
                  : isPageDeleter
                  ? 'Pages Deleted & Document Ready!'
                  : isReorder
                  ? 'Pages Reordered & Ready!'
                  : isRotate
                  ? 'Pages Rotated & Ready!'
                  : isPrintOptimizer
                  ? 'Print-Ready PDF Formatted!'
                  : 'PDF Ready for Download!'}
              </h4>

              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                {isCompress && compressedStats ? (
                  <span>
                    Original: <strong>{compressedStats.origKb} KB</strong> → Compressed:{' '}
                    <strong>{compressedStats.newKb} KB</strong>{' '}
                    <span className="ml-1 px-1.5 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px]">
                      -{compressedStats.savedPercent}% SAVED
                    </span>
                  </span>
                ) : isPasswordProtect ? (
                  <span>
                    Output size: <strong>{(resultBytes.length / 1024).toFixed(1)} KB</strong>. Encrypted with {encryptionAlgorithm}.
                  </span>
                ) : isUnlock ? (
                  <span>
                    Output size: <strong>{(resultBytes.length / 1024).toFixed(1)} KB</strong>. Password restrictions removed.
                  </span>
                ) : (
                  <span>
                    Output size: <strong>{(resultBytes.length / 1024).toFixed(1)} KB</strong>. Formatted and ready.
                  </span>
                )}
              </p>

              {isPasswordProtect && pdfPassword && (
                <div className="mt-2 flex items-center gap-2 text-xs bg-white/80 dark:bg-stone-900/80 px-2.5 py-1.5 rounded-[8px] border border-emerald-600/30">
                  <span className="text-stone-500 font-medium">Saved Password:</span>
                  <span className="font-mono font-bold text-emerald-800 dark:text-emerald-300">
                    {showPassword ? pdfPassword : '••••••••••••'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyPassword(pdfPassword)}
                    className="ml-auto text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 font-bold text-[11px]"
                  >
                    {copiedPassword ? <Check size={12} /> : <Copy size={12} />}
                    {copiedPassword ? 'Copied' : 'Copy'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <ClayButton
            onClick={handleDownloadPdf}
            variant="primary"
            icon={<Download size={16} />}
            className="shrink-0 w-full sm:w-auto"
          >
            {isPasswordProtect
              ? 'Download Protected PDF'
              : isUnlock
              ? 'Download Unlocked PDF'
              : isCompress
              ? 'Download Compressed PDF'
              : isSplit || isExtract
              ? 'Download Extracted PDF'
              : 'Download PDF'}
          </ClayButton>
        </div>
      )}
    </div>
  );
}
