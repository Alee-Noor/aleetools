// lib/engines/pdf-engine.ts
// Real client-side PDF generation, merging, splitting, and manipulation using pdf-lib

import { PDFDocument, StandardFonts, rgb, degrees, PageSizes } from 'pdf-lib';

export interface PdfInfo {
  pageCount: number;
  title: string;
  author: string;
  subject: string;
  creator: string;
  producer: string;
  creationDate: string;
  modificationDate: string;
}

/**
 * Parse human page ranges like "1, 3-5, 8" into 0-indexed page number array
 */
export function parsePageRange(rangeStr: string, totalPages: number): number[] {
  const pages = new Set<number>();
  const parts = rangeStr.split(',');

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    if (trimmed.includes('-')) {
      const [startStr, endStr] = trimmed.split('-');
      const start = Math.max(1, parseInt(startStr, 10));
      const end = Math.min(totalPages, parseInt(endStr, 10));
      if (!isNaN(start) && !isNaN(end)) {
        for (let p = start; p <= end; p++) {
          pages.add(p - 1);
        }
      }
    } else {
      const p = parseInt(trimmed, 10);
      if (!isNaN(p) && p >= 1 && p <= totalPages) {
        pages.add(p - 1);
      }
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

/**
 * Convert images (JPG, PNG, WebP via canvas fallback) to a clean multi-page PDF
 */
export async function imagesToPdf(
  files: File[],
  pageSize: 'A4' | 'Letter' = 'A4',
  orientation: 'portrait' | 'landscape' = 'portrait'
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  // Page dimensions in points (72 points = 1 inch)
  const baseDim = pageSize === 'Letter' ? PageSizes.Letter : PageSizes.A4;
  const [pageW, pageH] = orientation === 'portrait' ? baseDim : [baseDim[1], baseDim[0]];

  for (const file of files) {
    let imageBytes: ArrayBuffer;
    let isPng = file.type === 'image/png';

    // If WebP, GIF, or other format, convert to PNG in-browser canvas first
    if (!file.type.includes('jpeg') && !file.type.includes('jpg') && !isPng) {
      const canvas = document.createElement('canvas');
      const img = new Image();
      const url = URL.createObjectURL(file);
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/png'));
      if (!blob) continue;
      imageBytes = await blob.arrayBuffer();
      isPng = true;
    } else {
      imageBytes = await file.arrayBuffer();
    }

    let embeddedImage;
    try {
      embeddedImage = isPng
        ? await pdfDoc.embedPng(imageBytes)
        : await pdfDoc.embedJpg(imageBytes);
    } catch {
      // Fallback decode via canvas if direct embedding failed
      const canvas = document.createElement('canvas');
      const img = new Image();
      const url = URL.createObjectURL(file);
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', 0.95));
      if (!blob) continue;
      embeddedImage = await pdfDoc.embedJpg(await blob.arrayBuffer());
    }

    const page = pdfDoc.addPage([pageW, pageH]);
    const { width: imgW, height: imgH } = embeddedImage;

    // Scale image maintaining aspect ratio with margin
    const margin = 24; // 24 points margin
    const availW = pageW - margin * 2;
    const availH = pageH - margin * 2;

    const scale = Math.min(availW / imgW, availH / imgH, 1);
    const drawW = imgW * scale;
    const drawH = imgH * scale;

    // Center on page
    const x = (pageW - drawW) / 2;
    const y = (pageH - drawH) / 2;

    page.drawImage(embeddedImage, {
      x,
      y,
      width: drawW,
      height: drawH,
    });
  }

  return await pdfDoc.save();
}

/**
 * Merge multiple PDF files into one combined PDF
 */
export async function mergePdfs(files: File[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const fileBytes = await file.arrayBuffer();
    const doc = await PDFDocument.load(fileBytes);
    const pageIndices = doc.getPageIndices();
    const copiedPages = await mergedPdf.copyPages(doc, pageIndices);
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  return await mergedPdf.save();
}

/**
 * Extract or Split specific page ranges into a new PDF
 */
export async function splitOrExtractPdf(file: File, pageRange: string): Promise<Uint8Array> {
  const fileBytes = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(fileBytes);
  const totalPages = srcDoc.getPageCount();

  const selectedIndices = parsePageRange(pageRange, totalPages);
  if (selectedIndices.length === 0) {
    throw new Error('No valid pages found in the specified range.');
  }

  const newDoc = await PDFDocument.create();
  const copiedPages = await newDoc.copyPages(srcDoc, selectedIndices);
  copiedPages.forEach((page) => newDoc.addPage(page));

  return await newDoc.save();
}

/**
 * Rotate PDF pages by 90, 180, or 270 degrees
 */
export async function rotatePdf(
  file: File,
  rotationDegrees: number,
  pageRange?: string
): Promise<Uint8Array> {
  const fileBytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(fileBytes);
  const totalPages = doc.getPageCount();

  const targetIndices = pageRange
    ? parsePageRange(pageRange, totalPages)
    : doc.getPageIndices();

  const pages = doc.getPages();
  for (const idx of targetIndices) {
    const page = pages[idx];
    const currentRot = page.getRotation().angle;
    page.setRotation(degrees((currentRot + rotationDegrees) % 360));
  }

  return await doc.save();
}

/**
 * Stamp a text watermark across all pages
 */
export async function watermarkPdf(
  file: File,
  watermarkText: string,
  opacity = 0.25,
  fontSize = 48
): Promise<Uint8Array> {
  const fileBytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(fileBytes);
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const pages = doc.getPages();

  for (const page of pages) {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
    const textHeight = font.heightAtSize(fontSize);

    page.drawText(watermarkText, {
      x: (width - textWidth) / 2,
      y: (height - textHeight) / 2,
      size: fontSize,
      font,
      color: rgb(0.2, 0.2, 0.2),
      opacity,
      rotate: degrees(45),
    });
  }

  return await doc.save();
}

/**
 * Add page numbers (e.g. "Page 1 of 5") to all pages
 */
export async function addPageNumbersPdf(
  file: File,
  position: 'bottom-center' | 'bottom-right' | 'top-right' = 'bottom-center'
): Promise<Uint8Array> {
  const fileBytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(fileBytes);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();
  const total = pages.length;

  for (let i = 0; i < total; i++) {
    const page = pages[i];
    const { width, height } = page.getSize();
    const text = `Page ${i + 1} of ${total}`;
    const fontSize = 10;
    const textWidth = font.widthOfTextAtSize(text, fontSize);

    let x = (width - textWidth) / 2;
    let y = 20;

    if (position === 'bottom-right') {
      x = width - textWidth - 30;
      y = 20;
    } else if (position === 'top-right') {
      x = width - textWidth - 30;
      y = height - 30;
    }

    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0.35, 0.35, 0.35),
    });
  }

  return await doc.save();
}

/**
 * Read PDF metadata and page count
 */
export async function getPdfInfo(file: File): Promise<PdfInfo> {
  const fileBytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(fileBytes);

  return {
    pageCount: doc.getPageCount(),
    title: doc.getTitle() || 'Untitled',
    author: doc.getAuthor() || 'Unknown',
    subject: doc.getSubject() || 'None',
    creator: doc.getCreator() || 'Unknown',
    producer: doc.getProducer() || 'Unknown',
    creationDate: doc.getCreationDate()?.toLocaleString() || 'Unknown',
    modificationDate: doc.getModificationDate()?.toLocaleString() || 'Unknown',
  };
}

/**
 * Helper to download raw PDF bytes as a file in browser
 */
export function downloadPdfBytes(bytes: Uint8Array, fileName: string) {
  const blob = new Blob([bytes as any], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export interface PdfPageImage {
  pageNumber: number;
  dataUrl: string;
  blob: Blob;
  width: number;
  height: number;
}

/**
 * Render all pages of a PDF to JPG image blobs using pdfjs-dist
 */
export async function convertPdfToJpgPages(
  file: File,
  quality = 0.92,
  scale = 2.0
): Promise<PdfPageImage[]> {
  const pdfjsLib = await import('pdfjs-dist');
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
  }

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;
  const pageImages: PdfPageImage[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;

    // Fill white background (transparent canvas turns black in JPEG)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvasContext: ctx,
      viewport: viewport,
    }).promise;

    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b || new Blob()), 'image/jpeg', quality);
    });

    pageImages.push({
      pageNumber: i,
      dataUrl,
      blob,
      width: canvas.width,
      height: canvas.height,
    });
  }

  return pageImages;
}

/**
 * Delete specified pages from a PDF and return the remaining PDF bytes
 */
export async function deletePdfPages(
  file: File,
  pagesToDeleteStr: string
): Promise<Uint8Array> {
  const fileBytes = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(fileBytes);
  const total = srcDoc.getPageCount();

  const toDelete = new Set<number>();
  pagesToDeleteStr.split(',').forEach((part) => {
    const trimmed = part.trim();
    if (trimmed.includes('-')) {
      const [start, end] = trimmed.split('-').map((n) => parseInt(n.trim(), 10));
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = start; i <= end; i++) {
          if (i >= 1 && i <= total) toDelete.add(i - 1);
        }
      }
    } else {
      const num = parseInt(trimmed, 10);
      if (!isNaN(num) && num >= 1 && num <= total) {
        toDelete.add(num - 1);
      }
    }
  });

  const destDoc = await PDFDocument.create();
  const keepIndices: number[] = [];
  for (let i = 0; i < total; i++) {
    if (!toDelete.has(i)) keepIndices.push(i);
  }

  if (keepIndices.length === 0) {
    throw new Error('Cannot delete all pages from the PDF.');
  }

  const copiedPages = await destDoc.copyPages(srcDoc, keepIndices);
  copiedPages.forEach((page) => destDoc.addPage(page));

  return destDoc.save();
}

/**
 * Reorder pages in a PDF based on an array of 1-indexed page numbers
 */
export async function reorderPdfPages(
  file: File,
  newPageOrderStr: string
): Promise<Uint8Array> {
  const fileBytes = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(fileBytes);
  const total = srcDoc.getPageCount();

  const orderIndices = newPageOrderStr
    .split(',')
    .map((n) => parseInt(n.trim(), 10) - 1)
    .filter((idx) => !isNaN(idx) && idx >= 0 && idx < total);

  if (orderIndices.length === 0) {
    throw new Error('Please enter valid page numbers to reorder.');
  }

  const destDoc = await PDFDocument.create();
  const copiedPages = await destDoc.copyPages(srcDoc, orderIndices);
  copiedPages.forEach((page) => destDoc.addPage(page));

  return destDoc.save();
}

/**
 * Extract plain text from PDF using pdfjs-dist
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist');
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
  }
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  let text = '';
  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const textContent = await page.getTextContent();
    const pageStr = textContent.items.map((item: any) => item.str || '').join(' ');
    text += `=== PAGE ${i} ===\n${pageStr}\n\n`;
  }
  return text.trim();
}

/**
 * Helper to download an image blob directly
 */
export function downloadImageBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export interface PdfEncryptionOptions {
  algorithm?: 'AES-256' | 'RC4';
  allowPrinting?: boolean;
  allowModifying?: boolean;
  allowCopying?: boolean;
  allowAnnotating?: boolean;
  allowFillingForms?: boolean;
}

/**
 * Encrypt PDF with password protection using AES-256 or RC4
 */
export async function protectPdf(
  file: File,
  userPassword: string,
  options?: PdfEncryptionOptions
): Promise<Uint8Array> {
  const { encryptPDF } = await import('@pdfsmaller/pdf-encrypt');
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  return await encryptPDF(bytes, userPassword, options);
}

/**
 * Decrypt/Unlock password-protected PDF
 */
export async function unlockPdf(
  file: File,
  password: string
): Promise<Uint8Array> {
  const { decryptPDF } = await import('@pdfsmaller/pdf-decrypt');
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  return await decryptPDF(bytes, password);
}

/**
 * Detect whether a PDF is password protected / encrypted
 */
export async function checkPdfEncryption(file: File): Promise<{
  encrypted: boolean;
  algorithm?: 'AES-256' | 'RC4';
  version?: number;
  revision?: number;
  keyLength?: number;
}> {
  const { isEncrypted } = await import('@pdfsmaller/pdf-decrypt');
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  return await isEncrypted(bytes);
}

/**
 * Format 0-indexed page indices array into human-readable range string (e.g. [0, 1, 2, 4] -> "1-3, 5")
 */
export function formatPageIndicesToRange(indices: number[]): string {
  if (indices.length === 0) return '';
  const sorted = Array.from(new Set(indices)).sort((a, b) => a - b);
  const ranges: string[] = [];
  let start = sorted[0];
  let end = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === end + 1) {
      end = sorted[i];
    } else {
      ranges.push(start === end ? `${start + 1}` : `${start + 1}-${end + 1}`);
      start = sorted[i];
      end = sorted[i];
    }
  }
  ranges.push(start === end ? `${start + 1}` : `${start + 1}-${end + 1}`);
  return ranges.join(', ');
}

export interface PdfThumbnail {
  pageNumber: number;
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * Fast client-side rendering of PDF page thumbnails for visual selection cards
 */
export async function renderPdfThumbnails(
  file: File,
  maxPages: number = 100,
  scale: number = 0.55
): Promise<PdfThumbnail[]> {
  const pdfjsLib = await import('pdfjs-dist');
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
  }
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const total = Math.min(pdfDoc.numPages, maxPages);
  const thumbnails: PdfThumbnail[] = [];

  for (let i = 1; i <= total; i++) {
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport }).promise;

    thumbnails.push({
      pageNumber: i,
      dataUrl: canvas.toDataURL('image/jpeg', 0.85),
      width: canvas.width,
      height: canvas.height,
    });
  }
  return thumbnails;
}

/**
 * Render a single high-resolution PDF page for the enlargement modal inspection
 */
export async function renderSinglePdfPage(
  file: File,
  pageNumber: number,
  scale: number = 1.8
): Promise<PdfThumbnail> {
  const pdfjsLib = await import('pdfjs-dist');
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
  }
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const page = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(viewport.width);
  canvas.height = Math.round(viewport.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create canvas context');

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport }).promise;

  return {
    pageNumber,
    dataUrl: canvas.toDataURL('image/jpeg', 0.92),
    width: canvas.width,
    height: canvas.height,
  };
}


export interface SplitPageResult {
  pageNumber: number;
  bytes: Uint8Array;
  fileName: string;
  sizeKb: number;
}

/**
 * Split PDF into standalone individual 1-page PDF files
 */
export async function splitPdfToIndividualPages(
  file: File,
  selectedIndices?: number[]
): Promise<SplitPageResult[]> {
  const fileBytes = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(fileBytes);
  const total = srcDoc.getPageCount();
  const indices = selectedIndices && selectedIndices.length > 0
    ? selectedIndices.filter((idx) => idx >= 0 && idx < total)
    : Array.from({ length: total }, (_, i) => i);

  const baseName = file.name.replace(/\.pdf$/i, '');
  const results: SplitPageResult[] = [];

  for (const idx of indices) {
    const newDoc = await PDFDocument.create();
    const [copiedPage] = await newDoc.copyPages(srcDoc, [idx]);
    newDoc.addPage(copiedPage);
    const bytes = await newDoc.save();
    const pageNum = idx + 1;
    results.push({
      pageNumber: pageNum,
      bytes,
      fileName: `${baseName}-page-${pageNum}.pdf`,
      sizeKb: Number((bytes.length / 1024).toFixed(1)),
    });
  }
  return results;
}

/**
 * Compress PDF by downsampling embedded page bitmaps and optimizing structure
 */
export async function compressPdf(
  file: File,
  level: 'low' | 'medium' | 'high' = 'medium'
): Promise<Uint8Array> {
  const qualityMap = {
    low: { scale: 1.4, quality: 0.82 },
    medium: { scale: 1.15, quality: 0.70 },
    high: { scale: 0.9, quality: 0.55 },
  };
  const { scale, quality } = qualityMap[level];
  const pdfjsLib = await import('pdfjs-dist');
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
  }
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const newDoc = await PDFDocument.create();

  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport }).promise;

    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', quality));
    if (!blob) continue;
    const jpgBytes = await blob.arrayBuffer();
    const embeddedImage = await newDoc.embedJpg(jpgBytes);
    const origViewport = page.getViewport({ scale: 1.0 });
    const newPage = newDoc.addPage([origViewport.width, origViewport.height]);
    newPage.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width: origViewport.width,
      height: origViewport.height,
    });
  }
  return await newDoc.save();
}

/**
 * Rotate specific individual PDF pages
 */
export async function rotateSpecificPdfPages(
  file: File,
  pageRotations: Record<number, number>
): Promise<Uint8Array> {
  const fileBytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(fileBytes);
  const pages = doc.getPages();

  for (const [idxStr, addDeg] of Object.entries(pageRotations)) {
    const idx = parseInt(idxStr, 10);
    if (pages[idx] && addDeg !== 0) {
      const currentRot = pages[idx].getRotation().angle;
      pages[idx].setRotation(degrees((currentRot + addDeg) % 360));
    }
  }
  return await doc.save();
}

/**
 * Optimize PDF layout and margins for printing
 */
export async function optimizeForPrintPdf(
  file: File,
  marginPt: number = 24,
  targetSize: 'A4' | 'Letter' = 'A4'
): Promise<Uint8Array> {
  const fileBytes = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(fileBytes);
  const destDoc = await PDFDocument.create();
  const total = srcDoc.getPageCount();

  const [targetW, targetH] = targetSize === 'Letter' ? PageSizes.Letter : PageSizes.A4;

  for (let i = 0; i < total; i++) {
    const embeddedPage = await destDoc.embedPage(srcDoc.getPages()[i]);
    const { width, height } = embeddedPage;
    const newPage = destDoc.addPage([targetW, targetH]);

    const availW = targetW - marginPt * 2;
    const availH = targetH - marginPt * 2;
    const scale = Math.min(availW / width, availH / height, 1);
    const drawW = width * scale;
    const drawH = height * scale;
    const x = (targetW - drawW) / 2;
    const y = (targetH - drawH) / 2;

    newPage.drawPage(embeddedPage, {
      x,
      y,
      width: drawW,
      height: drawH,
    });
  }
  return await destDoc.save();
}



