// lib/engines/image-engine.ts
// 100% Client-side Canvas-based image processing

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function loadImage(file: File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image file: ' + e));
    };
    img.src = url;
  });
}

export interface ProcessedImageResult {
  blob: Blob;
  dataUrl: string;
  size: number;
  width: number;
  height: number;
  originalSize: number;
}

export async function resizeImage(
  file: File,
  targetWidth: number,
  targetHeight: number,
  format: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg',
  quality: number = 0.9
): Promise<ProcessedImageResult> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  // High quality image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('Failed to create image blob'));
        const dataUrl = canvas.toDataURL(format, quality);
        resolve({
          blob,
          dataUrl,
          size: blob.size,
          width: targetWidth,
          height: targetHeight,
          originalSize: file.size,
        });
      },
      format,
      quality
    );
  });
}

export async function compressImage(
  file: File,
  quality: number = 0.75, // 0.1 to 1.0
  format: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg'
): Promise<ProcessedImageResult> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  ctx.drawImage(img, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('Failed to compress image'));
        const dataUrl = canvas.toDataURL(format, quality);
        resolve({
          blob,
          dataUrl,
          size: blob.size,
          width: canvas.width,
          height: canvas.height,
          originalSize: file.size,
        });
      },
      format,
      quality
    );
  });
}

export async function convertImage(
  file: File,
  targetFormat: 'image/jpeg' | 'image/png' | 'image/webp',
  quality: number = 0.92
): Promise<ProcessedImageResult> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  // If converting transparent PNG to JPG, fill white background
  if (targetFormat === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('Failed to convert image format'));
        const dataUrl = canvas.toDataURL(targetFormat, quality);
        resolve({
          blob,
          dataUrl,
          size: blob.size,
          width: canvas.width,
          height: canvas.height,
          originalSize: file.size,
        });
      },
      targetFormat,
      quality
    );
  });
}

export async function cropImageToRatio(
  file: File,
  aspectW: number,
  aspectH: number,
  format: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg'
): Promise<ProcessedImageResult> {
  const img = await loadImage(file);
  const imgW = img.naturalWidth;
  const imgH = img.naturalHeight;

  const targetRatio = aspectW / aspectH;
  const currentRatio = imgW / imgH;

  let sx = 0;
  let sy = 0;
  let sWidth = imgW;
  let sHeight = imgH;

  if (currentRatio > targetRatio) {
    // Current is wider than target: crop sides
    sWidth = imgH * targetRatio;
    sx = (imgW - sWidth) / 2;
  } else {
    // Current is taller than target: crop top/bottom
    sHeight = imgW / targetRatio;
    sy = (imgH - sHeight) / 2;
  }

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(sWidth);
  canvas.height = Math.round(sHeight);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('Failed to crop image'));
        const dataUrl = canvas.toDataURL(format, 0.92);
        resolve({
          blob,
          dataUrl,
          size: blob.size,
          width: canvas.width,
          height: canvas.height,
          originalSize: file.size,
        });
      },
      format,
      0.92
    );
  });
}

export async function rotateImage(file: File, degrees: number): Promise<ProcessedImageResult> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const rad = (degrees * Math.PI) / 180;
  const isSwap = degrees % 180 !== 0;

  canvas.width = isSwap ? img.naturalHeight : img.naturalWidth;
  canvas.height = isSwap ? img.naturalWidth : img.naturalHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rad);
  ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('Failed to rotate image'));
      resolve({
        blob,
        dataUrl: canvas.toDataURL('image/jpeg', 0.92),
        size: blob.size,
        width: canvas.width,
        height: canvas.height,
        originalSize: file.size,
      });
    }, 'image/jpeg', 0.92);
  });
}

export async function flipImage(file: File, horizontal: boolean, vertical: boolean): Promise<ProcessedImageResult> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  ctx.translate(horizontal ? canvas.width : 0, vertical ? canvas.height : 0);
  ctx.scale(horizontal ? -1 : 1, vertical ? -1 : 1);
  ctx.drawImage(img, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('Failed to flip image'));
      resolve({
        blob,
        dataUrl: canvas.toDataURL('image/jpeg', 0.92),
        size: blob.size,
        width: canvas.width,
        height: canvas.height,
        originalSize: file.size,
      });
    }, 'image/jpeg', 0.92);
  });
}

export async function filterImage(file: File, filterCss: string): Promise<ProcessedImageResult> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  ctx.filter = filterCss;
  ctx.drawImage(img, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('Failed to filter image'));
      resolve({
        blob,
        dataUrl: canvas.toDataURL('image/jpeg', 0.92),
        size: blob.size,
        width: canvas.width,
        height: canvas.height,
        originalSize: file.size,
      });
    }, 'image/jpeg', 0.92);
  });
}

export interface WatermarkOptions {
  type: 'text' | 'image';
  text?: string;
  watermarkFile?: File | null;
  watermarkDataUrl?: string | null;
  color?: string;
  fontSize?: number;
  opacity?: number;
  scale?: number;
  rotation?: number;
  positionX?: number;
  positionY?: number;
}

export async function watermarkImage(
  file: File,
  options: WatermarkOptions | string
): Promise<ProcessedImageResult> {
  const opts: WatermarkOptions =
    typeof options === 'string'
      ? { type: 'text', text: options }
      : options;

  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  ctx.drawImage(img, 0, 0);

  const opacity = opts.opacity ?? 0.8;
  const posX = (opts.positionX ?? 0.9) * canvas.width;
  const posY = (opts.positionY ?? 0.9) * canvas.height;
  const rotationRad = ((opts.rotation ?? 0) * Math.PI) / 180;

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.translate(posX, posY);
  if (rotationRad !== 0) {
    ctx.rotate(rotationRad);
  }

  if (opts.type === 'image' && (opts.watermarkFile || opts.watermarkDataUrl)) {
    let wmImg: HTMLImageElement;
    if (opts.watermarkFile) {
      wmImg = await loadImage(opts.watermarkFile);
    } else if (opts.watermarkDataUrl) {
      wmImg = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = (e) => reject(e);
        i.src = opts.watermarkDataUrl!;
      });
    } else {
      wmImg = img;
    }

    const scale = opts.scale ?? 0.3;
    const wmW = Math.round(canvas.width * scale);
    const wmH = Math.round((wmImg.naturalHeight / (wmImg.naturalWidth || 1)) * wmW);

    ctx.drawImage(wmImg, -wmW / 2, -wmH / 2, wmW, wmH);
  } else {
    const text = opts.text || 'Alee Tools';
    const fontSize = opts.fontSize || Math.max(20, Math.floor(canvas.width / 24));
    const textColor = opts.color || '#FFFFFF';

    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.fillStyle = textColor;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 6;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillText(text, 0, 0);
  }

  ctx.restore();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('Failed to watermark image'));
        resolve({
          blob,
          dataUrl: canvas.toDataURL('image/jpeg', 0.92),
          size: blob.size,
          width: canvas.width,
          height: canvas.height,
          originalSize: file.size,
        });
      },
      'image/jpeg',
      0.92
    );
  });
}

