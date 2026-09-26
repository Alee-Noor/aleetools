'use client';

import { useState, useEffect, useRef, type ChangeEvent } from 'react';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import {
  Download,
  Copy,
  Check,
  QrCode as QrIcon,
  UploadCloud,
  Camera,
  CameraOff,
  ExternalLink,
  RefreshCw,
  Sparkles,
  ScanLine,
} from 'lucide-react';
import { ClayButton } from '@/components/ui/ClayButton';
import { formatPhoneQr, formatVCard } from '@/lib/engines/qr-engine';
import {
  encodeBarcode,
  renderBarcodeToCanvas,
  decode1DBarcodeFromCanvas,
  type BarcodeFormat,
} from '@/lib/engines/barcode-engine';
import type { Tool } from '@/lib/tool-registry';
import { QrCodeSeoContent } from './QrCodeSeoContent';

interface QrToolProps {
  tool: Tool;
}

declare global {
  interface Window {
    BarcodeDetector?: any;
  }
}

export function QrTool({ tool }: QrToolProps) {
  const slug = tool.slug;
  const isScanner = slug.includes('scan') || slug.includes('reader') || slug.includes('decode');
  const isBarcodeGen =
    (slug.includes('barcode') ||
      slug.includes('ean') ||
      slug.includes('upc') ||
      slug.includes('code-128') ||
      slug.includes('code-39') ||
      slug.includes('isbn')) &&
    !isScanner;

  // Generator subtype checks
  const isEmail = slug.includes('email');
  const isPhone = slug.includes('phone');
  const isSms = slug.includes('sms');
  const isVcard = slug.includes('vcard');
  const isWifi = slug.includes('wifi') || slug.includes('wi-fi');
  const isWhatsapp = slug.includes('whatsapp');
  const isLocation = slug.includes('location');
  const isBitcoin = slug.includes('bitcoin');

  // QR Generator inputs
  const [text, setText] = useState('https://alee.software');
  const [email, setEmail] = useState('hello@example.com');
  const [emailSubject, setEmailSubject] = useState('Inquiry');
  const [emailBody, setEmailBody] = useState('Hello, I would like more information.');
  const [phone, setPhone] = useState('+15551234567');
  const [smsMsg, setSmsMsg] = useState('Hello from Alee Tools!');
  const [waMsg, setWaMsg] = useState('Hello! I scanned your QR code.');
  const [wifiSsid, setWifiSsid] = useState('MyHomeNetwork');
  const [wifiPass, setWifiPass] = useState('SecurePassword123');
  const [wifiType, setWifiType] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [vcardName, setVcardName] = useState('John Doe');
  const [vcardEmail, setVcardEmail] = useState('john@example.com');
  const [vcardPhone, setVcardPhone] = useState('+15551234567');
  const [vcardOrg, setVcardOrg] = useState('Acme Corp');
  const [locLat, setLocLat] = useState('37.7749');
  const [locLng, setLocLng] = useState('-122.4194');
  const [btcAddress, setBtcAddress] = useState('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');
  const [btcAmount, setBtcAmount] = useState('0.005');

  // Barcode Generator inputs
  const getDefaultBarcodeText = () => {
    if (slug.includes('ean')) return '978020137962';
    if (slug.includes('upc')) return '01234567890';
    if (slug.includes('isbn')) return '978316148410';
    if (slug.includes('code-39')) return 'ALEETOOLS39';
    return '123456789012';
  };

  const getDefaultBarcodeFormat = (): BarcodeFormat => {
    if (slug.includes('ean')) return 'EAN13';
    if (slug.includes('upc')) return 'UPCA';
    if (slug.includes('isbn')) return 'ISBN';
    if (slug.includes('code-39')) return 'CODE39';
    return 'CODE128';
  };

  const [barcodeText, setBarcodeText] = useState(getDefaultBarcodeText());
  const [barcodeFormat, setBarcodeFormat] = useState<BarcodeFormat>(getDefaultBarcodeFormat());

  // Colors
  const [fgColor, setFgColor] = useState('#0F0E0C');
  const [bgColor, setBgColor] = useState('#FFFFFF');

  // Generator Outputs
  const [dataUrl, setDataUrl] = useState<string>('');
  const barcodeCanvasRef = useRef<HTMLCanvasElement>(null);

  // Scanner States
  const [scanMode, setScanMode] = useState<'upload' | 'camera'>('upload');
  const [scanImageSrc, setScanImageSrc] = useState<string | null>(null);
  const [decodedResult, setDecodedResult] = useState<string | null>(null);
  const [decodedFormat, setDecodedFormat] = useState<string>('QR_CODE');
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // -------------------------------------------------------------
  // 1. 1D BARCODE GENERATOR EFFECT
  // -------------------------------------------------------------
  useEffect(() => {
    if (!isBarcodeGen || !barcodeCanvasRef.current) return;
    const { bits, label } = encodeBarcode(barcodeFormat, barcodeText);
    renderBarcodeToCanvas(barcodeCanvasRef.current, bits, label, fgColor, bgColor);
  }, [isBarcodeGen, barcodeText, barcodeFormat, fgColor, bgColor]);

  const handleDownloadBarcode = () => {
    if (!barcodeCanvasRef.current) return;
    const a = document.createElement('a');
    a.href = barcodeCanvasRef.current.toDataURL('image/png');
    a.download = `${tool.slug}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // -------------------------------------------------------------
  // 2. 2D QR CODE GENERATOR EFFECT
  // -------------------------------------------------------------
  const getPayload = (): string => {
    if (isWifi) return `WIFI:T:${wifiType};S:${wifiSsid};P:${wifiPass};;`;
    if (isEmail) return `mailto:${email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    if (isPhone) return formatPhoneQr(phone);
    if (isSms) return `smsto:${phone}:${smsMsg}`;
    if (isWhatsapp) return `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(waMsg)}`;
    if (isVcard) {
      const parts = vcardName.split(' ');
      return formatVCard({
        firstName: parts[0] || 'John',
        lastName: parts.slice(1).join(' ') || 'Doe',
        email: vcardEmail,
        phone: vcardPhone,
        org: vcardOrg,
      });
    }
    if (isLocation) return `geo:${locLat},${locLng}?q=${locLat},${locLng}`;
    if (isBitcoin) return `bitcoin:${btcAddress}?amount=${btcAmount}`;
    return text;
  };

  useEffect(() => {
    if (isScanner || isBarcodeGen) return;
    const payload = getPayload();
    if (!payload.trim()) return;

    QRCode.toDataURL(payload, {
      width: 440,
      margin: 2,
      color: {
        dark: fgColor,
        light: bgColor,
      },
    })
      .then((url) => setDataUrl(url))
      .catch((err) => console.error('QR Generation error:', err));
  }, [
    text, email, emailSubject, emailBody, phone, smsMsg, waMsg, wifiSsid, wifiPass, wifiType,
    vcardName, vcardEmail, vcardPhone, vcardOrg, locLat, locLng, btcAddress, btcAmount,
    fgColor, bgColor, isScanner, isBarcodeGen, isWifi, isEmail, isPhone, isSms, isWhatsapp, isVcard, isLocation, isBitcoin
  ]);

  const handleDownloadQr = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${tool.slug}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadSvg = async () => {
    try {
      const payload = getPayload();
      if (!payload.trim()) return;
      const svgString = await QRCode.toString(payload, {
        type: 'svg',
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
      });
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tool.slug}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate SVG QR code:', err);
    }
  };

  // -------------------------------------------------------------
  // 3. SCANNER LOGIC (Multi-Pass Channel Contrast Decoder)
  // -------------------------------------------------------------
  const scanImageElement = async (imgElement: HTMLImageElement | HTMLCanvasElement) => {
    setIsScanning(true);
    setScanError(null);

    const canvas = document.createElement('canvas');
    const w = imgElement instanceof HTMLImageElement ? imgElement.naturalWidth || imgElement.width : imgElement.width;
    const h = imgElement instanceof HTMLImageElement ? imgElement.naturalHeight || imgElement.height : imgElement.height;

    const maxDim = 1600;
    let scale = 1;
    if (w > maxDim || h > maxDim) {
      scale = maxDim / Math.max(w, h);
    }
    canvas.width = Math.max(1, Math.floor(w * scale));
    canvas.height = Math.max(1, Math.floor(h * scale));

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);

      // Pass 1: Raw Image Data
      const rawImgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let code = jsQR(rawImgData.data, rawImgData.width, rawImgData.height, {
        inversionAttempts: 'attemptBoth',
      });

      if (code && code.data) {
        setDecodedResult(code.data);
        setDecodedFormat('QR_CODE');
        setIsScanning(false);
        return;
      }

      // Pass 2: Color Contrast Channel Normalization (fixes Orange/Yellow/Green/Red/Cyan QR codes on white)
      const colorData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = colorData.data;
      for (let i = 0; i < data.length; i += 4) {
        const minChannel = Math.min(data[i], data[i + 1], data[i + 2]);
        data[i] = minChannel;
        data[i + 1] = minChannel;
        data[i + 2] = minChannel;
      }
      code = jsQR(colorData.data, colorData.width, colorData.height, {
        inversionAttempts: 'attemptBoth',
      });

      if (code && code.data) {
        setDecodedResult(code.data);
        setDecodedFormat('QR_CODE');
        setIsScanning(false);
        return;
      }

      // Pass 3: Adaptive Midpoint Threshold
      const threshData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const tData = threshData.data;
      let minLum = 255;
      let maxLum = 0;
      for (let i = 0; i < tData.length; i += 4) {
        const lum = Math.min(tData[i], tData[i + 1], tData[i + 2]);
        if (lum < minLum) minLum = lum;
        if (lum > maxLum) maxLum = lum;
      }
      const midLum = (minLum + maxLum) / 2;
      for (let i = 0; i < tData.length; i += 4) {
        const lum = Math.min(tData[i], tData[i + 1], tData[i + 2]);
        const val = lum < midLum ? 0 : 255;
        tData[i] = val;
        tData[i + 1] = val;
        tData[i + 2] = val;
      }
      code = jsQR(threshData.data, threshData.width, threshData.height, {
        inversionAttempts: 'attemptBoth',
      });

      // Pass 4: Pure JavaScript 1D Barcode Decoder (Code 128, Code 39, EAN-13)
      const barcode1D = decode1DBarcodeFromCanvas(canvas);
      if (barcode1D) {
        setDecodedResult(barcode1D.text);
        setDecodedFormat(barcode1D.format);
        setIsScanning(false);
        return;
      }
    }

    // Pass 5: Native BarcodeDetector API for Barcodes
    if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
      try {
        const detector = new window.BarcodeDetector({
          formats: ['qr_code', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'data_matrix', 'pdf417']
        });
        const barcodes = await detector.detect(imgElement);
        if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
          setDecodedResult(barcodes[0].rawValue);
          setDecodedFormat(barcodes[0].format.toUpperCase().replace('_', ' '));
          setIsScanning(false);
          return;
        }
      } catch (e) {
        console.warn('BarcodeDetector error:', e);
      }
    }

    setIsScanning(false);
    setScanError('No QR code or barcode detected in this image. Ensure the code is clear, well-lit, and unblurred.');
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setScanImageSrc(url);
    setDecodedResult(null);
    setScanError(null);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      scanImageElement(img);
    };
    img.src = url;
  };

  // Camera Live Scanner
  const startCamera = async () => {
    try {
      setCameraActive(true);
      setScanError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        requestAnimationFrame(tickCameraScan);
      }
    } catch (err) {
      console.error('Camera access denied:', err);
      setCameraActive(false);
      setScanError('Unable to access camera. Please check camera permissions in your browser.');
    }
  };

  const stopCamera = () => {
    setCameraActive(false);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const tickCameraScan = async () => {
    if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
      animFrameRef.current = requestAnimationFrame(tickCameraScan);
      return;
    }

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'attemptBoth',
      });

      if (code && code.data) {
        setDecodedResult(code.data);
        setDecodedFormat('QR_CODE');
        stopCamera();
        return;
      }

      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const minChannel = Math.min(data[i], data[i + 1], data[i + 2]);
        data[i] = minChannel;
        data[i + 1] = minChannel;
        data[i + 2] = minChannel;
      }
      code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'attemptBoth',
      });

      if (code && code.data) {
        setDecodedResult(code.data);
        setDecodedFormat('QR_CODE');
        stopCamera();
        return;
      }

      // Pass 3: Pure JavaScript 1D Barcode Decoder (Code 128, Code 39, EAN-13)
      const barcode1D = decode1DBarcodeFromCanvas(canvas);
      if (barcode1D) {
        setDecodedResult(barcode1D.text);
        setDecodedFormat(barcode1D.format);
        stopCamera();
        return;
      }
    }

    if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
      try {
        const detector = new window.BarcodeDetector({
          formats: ['qr_code', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39']
        });
        const barcodes = await detector.detect(video);
        if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
          setDecodedResult(barcodes[0].rawValue);
          setDecodedFormat(barcodes[0].format.toUpperCase().replace('_', ' '));
          stopCamera();
          return;
        }
      } catch (e) {
        // Continue
      }
    }

    animFrameRef.current = requestAnimationFrame(tickCameraScan);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const copyDecodedText = () => {
    if (!decodedResult) return;
    navigator.clipboard.writeText(decodedResult);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const isUrl = (str: string) => {
    return /^https?:\/\//i.test(str);
  };

  const runDemoScan = () => {
    const samplePayload = 'https://alee.software';
    QRCode.toDataURL(samplePayload, { width: 400, margin: 2 })
      .then((url) => {
        setScanImageSrc(url);
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          scanImageElement(img);
        };
        img.src = url;
      });
  };

  // -------------------------------------------------------------
  // RENDER UI: 1. SCANNER WORKBENCH
  // -------------------------------------------------------------
  if (isScanner) {
    return (
      <div className="space-y-6">
        {/* Scanner Mode Toggle */}
        <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--border)' }}>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                stopCamera();
                setScanMode('upload');
              }}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                scanMode === 'upload'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'border bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
              }`}
              style={{ borderColor: 'var(--border)' }}
            >
              <UploadCloud size={16} />
              <span>Upload Image to Scan</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setScanMode('camera');
                startCamera();
              }}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                scanMode === 'camera'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'border bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
              }`}
              style={{ borderColor: 'var(--border)' }}
            >
              <Camera size={16} />
              <span>Live Camera Scanner</span>
            </button>
          </div>

          <button
            type="button"
            onClick={runDemoScan}
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <Sparkles size={14} />
            <span>Test Sample QR</span>
          </button>
        </div>

        {/* Scan Body Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left: Scan Input Area */}
          <div className="md:col-span-7 space-y-4">
            {scanMode === 'upload' ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group relative flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all hover:border-emerald-500"
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
                {scanImageSrc ? (
                  <div className="space-y-3 flex flex-col items-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={scanImageSrc} alt="Scanned Code" className="max-h-48 max-w-full rounded-xl object-contain shadow-md border" style={{ borderColor: 'var(--border)' }} />
                    <span className="text-xs font-semibold text-stone-500 flex items-center gap-1">
                      <RefreshCw size={12} className={isScanning ? 'animate-spin' : ''} />
                      Click to upload a different image
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
                      <ScanLine size={28} />
                    </div>
                    <p className="text-base font-bold" style={{ color: 'var(--ink)' }}>
                      Drop any QR Code or Barcode image here
                    </p>
                    <p className="text-xs text-stone-500 mt-1 max-w-sm">
                      Supports QR codes, EAN, UPC, Code 128, Code 39, and DataMatrix from photos or screenshots.
                    </p>
                  </>
                )}
              </div>
            ) : (
              /* Camera View */
              <div className="relative flex flex-col items-center justify-center rounded-2xl overflow-hidden border bg-stone-950 p-3 min-h-[300px]" style={{ borderColor: 'var(--border)' }}>
                <video ref={videoRef} className="w-full max-h-[360px] rounded-xl object-cover" playsInline muted />
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-56 h-56 border-2 border-emerald-400/80 rounded-2xl relative animate-pulse">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3 z-10">
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="flex items-center gap-1.5 rounded-xl bg-stone-800 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-stone-700 transition-colors"
                  >
                    <CameraOff size={14} />
                    Stop Camera
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Decoded Result Panel */}
          <div className="md:col-span-5 space-y-4">
            <div
              className="rounded-2xl border p-6 shadow-md space-y-4"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border)' }}>
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  <ScanLine size={14} className="text-emerald-600" />
                  Decoded Result
                </span>
                {decodedFormat && (
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                    {decodedFormat}
                  </span>
                )}
              </div>

              {decodedResult ? (
                <div className="space-y-4">
                  <div
                    className="p-4 rounded-xl border font-mono text-sm break-all leading-relaxed max-h-48 overflow-y-auto"
                    style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--ink)' }}
                  >
                    {decodedResult}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <ClayButton
                      onClick={copyDecodedText}
                      variant="primary"
                      icon={copiedText ? <Check size={14} /> : <Copy size={14} />}
                      className="py-2 text-xs"
                    >
                      {copiedText ? 'Copied!' : 'Copy Decoded Text'}
                    </ClayButton>

                    {isUrl(decodedResult) && (
                      <a
                        href={decodedResult}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="clay-button inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 no-underline rounded-xl"
                      >
                        <ExternalLink size={14} />
                        <span>Open Link</span>
                      </a>
                    )}
                  </div>
                </div>
              ) : scanError ? (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-medium text-amber-800 dark:text-amber-300 leading-relaxed">
                  {scanError}
                </div>
              ) : (
                <div className="py-10 text-center space-y-2 text-stone-400">
                  <ScanLine size={36} className="mx-auto opacity-30" />
                  <p className="text-xs font-semibold text-stone-500">
                    Upload an image or start camera to decode code contents
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER UI: 2. 1D BARCODE GENERATOR WORKBENCH
  // -------------------------------------------------------------
  if (isBarcodeGen) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Input Controls */}
        <div className="md:col-span-6 space-y-4 p-6 rounded-2xl border shadow-sm" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border)' }}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <ScanLine size={16} className="text-emerald-600" />
              <span>1D Barcode Content & Format</span>
            </h3>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold" style={{ color: 'var(--ink-soft)' }}>
              Barcode Payload Value
            </label>
            <input
              type="text"
              value={barcodeText}
              onChange={(e) => setBarcodeText(e.target.value)}
              placeholder="e.g. 123456789012 or ALEETOOLS"
              className="w-full p-3 text-sm rounded-xl border outline-none font-mono font-medium"
              style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--ink)' }}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold" style={{ color: 'var(--ink-soft)' }}>Barcode Symbology Format</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { format: 'CODE128', label: 'Code 128 (Text)' },
                { format: 'EAN13', label: 'EAN-13 (13 Digits)' },
                { format: 'UPCA', label: 'UPC-A (12 Digits)' },
                { format: 'CODE39', label: 'Code 39 (Alpha)' },
                { format: 'ISBN', label: 'ISBN (Book)' },
              ].map((f) => (
                <button
                  key={f.format}
                  type="button"
                  onClick={() => setBarcodeFormat(f.format as BarcodeFormat)}
                  className={`p-2 text-xs font-bold rounded-lg border transition-all ${
                    barcodeFormat === f.format ? 'bg-emerald-600 text-white shadow-sm' : 'bg-stone-100 dark:bg-stone-800'
                  }`}
                  style={{ borderColor: 'var(--border)' }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Format Specification & Presets */}
          <div className="p-4 rounded-xl border space-y-2.5 bg-stone-50 dark:bg-stone-900/50" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {barcodeFormat === 'EAN13' && 'EAN-13 Retail (13 Digits)'}
                {barcodeFormat === 'UPCA' && 'UPC-A Retail (12 Digits)'}
                {barcodeFormat === 'ISBN' && 'ISBN Book Barcode (13 Digits)'}
                {barcodeFormat === 'CODE39' && 'Code 39 Industrial (A-Z, 0-9)'}
                {barcodeFormat === 'CODE128' && 'Code 128 High-Density (Full ASCII)'}
              </span>
              <span className="text-[10px] font-semibold text-stone-500 uppercase">Format Specs</span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              {barcodeFormat === 'EAN13' && 'Standard global retail barcode for consumer products. Enter 12 or 13 numeric digits; the 13th check digit is calculated automatically using Modulo 10.'}
              {barcodeFormat === 'UPCA' && 'Standard North American retail product barcode. Enter 11 or 12 numeric digits; the final check digit is automatically verified.'}
              {barcodeFormat === 'ISBN' && 'Book publishing identifier starting with 978 or 979 prefix. Enter 12 or 13 numeric digits.'}
              {barcodeFormat === 'CODE39' && 'Industrial barcode for letters A-Z, digits 0-9, and symbols (- . $ / + %). Commonly used in government, military, and logistics.'}
              {barcodeFormat === 'CODE128' && 'High-density barcode format capable of encoding all 128 ASCII characters. Widely used for shipping, inventory tracking, and warehouse management.'}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-[11px] font-semibold text-stone-500 self-center">Sample presets:</span>
              {barcodeFormat === 'EAN13' && (
                <>
                  <button type="button" onClick={() => setBarcodeText('590123412345')} className="px-2 py-1 text-[11px] font-mono font-bold rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20">590123412345</button>
                  <button type="button" onClick={() => setBarcodeText('978020137962')} className="px-2 py-1 text-[11px] font-mono font-bold rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20">978020137962</button>
                </>
              )}
              {barcodeFormat === 'UPCA' && (
                <>
                  <button type="button" onClick={() => setBarcodeText('012345678905')} className="px-2 py-1 text-[11px] font-mono font-bold rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20">012345678905</button>
                  <button type="button" onClick={() => setBarcodeText('786936214589')} className="px-2 py-1 text-[11px] font-mono font-bold rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20">786936214589</button>
                </>
              )}
              {barcodeFormat === 'ISBN' && (
                <>
                  <button type="button" onClick={() => setBarcodeText('9783161484100')} className="px-2 py-1 text-[11px] font-mono font-bold rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20">9783161484100</button>
                  <button type="button" onClick={() => setBarcodeText('9791090636071')} className="px-2 py-1 text-[11px] font-mono font-bold rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20">9791090636071</button>
                </>
              )}
              {barcodeFormat === 'CODE39' && (
                <>
                  <button type="button" onClick={() => setBarcodeText('BOX-9876')} className="px-2 py-1 text-[11px] font-mono font-bold rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20">BOX-9876</button>
                  <button type="button" onClick={() => setBarcodeText('ITEM-2026')} className="px-2 py-1 text-[11px] font-mono font-bold rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20">ITEM-2026</button>
                </>
              )}
              {barcodeFormat === 'CODE128' && (
                <>
                  <button type="button" onClick={() => setBarcodeText('ALEETOOLS-2026')} className="px-2 py-1 text-[11px] font-mono font-bold rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20">ALEETOOLS-2026</button>
                  <button type="button" onClick={() => setBarcodeText('tgvvyfjfjvhhv')} className="px-2 py-1 text-[11px] font-mono font-bold rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20">tgvvyfjfjvhhv</button>
                </>
              )}
            </div>
          </div>

          {/* Color Customization */}
          <div className="pt-3 border-t grid grid-cols-2 gap-3" style={{ borderColor: 'var(--border)' }}>
            <div>
              <label className="text-[11px] font-semibold text-stone-500 block mb-1">Foreground Bar Color</label>
              <input
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="h-8 w-full cursor-pointer rounded-lg border bg-transparent p-0.5"
                style={{ borderColor: 'var(--border)' }}
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-stone-500 block mb-1">Background Color</label>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="h-8 w-full cursor-pointer rounded-lg border bg-transparent p-0.5"
                style={{ borderColor: 'var(--border)' }}
              />
            </div>
          </div>
        </div>

        {/* 1D Barcode Output Preview & Purpose Card */}
        <div className="md:col-span-6 space-y-4">
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl border space-y-5 shadow-sm" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="p-4 bg-white rounded-2xl shadow-md flex flex-col items-center justify-center border border-stone-200 overflow-x-auto max-w-full w-full">
              <canvas ref={barcodeCanvasRef} className="max-w-full h-auto object-contain" />
            </div>

            <ClayButton
              onClick={handleDownloadBarcode}
              variant="primary"
              icon={<Download size={16} />}
            >
              Download Barcode PNG
            </ClayButton>
          </div>

          {/* Purpose of Barcodes & Scanning Explanation */}
          <div className="p-5 rounded-2xl border space-y-3" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <Sparkles size={14} />
              <span>What is decoded & Why text is printed below bars?</span>
            </div>
            <div className="space-y-2 text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              <p>
                <strong>1. Optical Machine Reading vs. Human Reading:</strong> The black bars and white spaces encode binary pattern widths (modules) designed for laser and optical camera scanners to decode in <strong>&lt;10 milliseconds</strong> with 0% typing error.
              </p>
              <p>
                <strong>2. Why text is printed below:</strong> The text printed under the barcode is a <em>human-readable fallback label</em>. It allows store cashiers or warehouse workers to manually type the product code into POS systems if the physical barcode label becomes torn, wet, smudged, or unscannable.
              </p>
              <p>
                <strong>3. What scanning decodes:</strong> The scanner measures the relative widths of alternating black bars and white spaces, converts them to binary character tokens, validates an embedded mathematical check digit, and passes the decoded product SKU or text payload into software systems instantly.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER UI: 3. 2D QR CODE GENERATOR WORKBENCH
  // -------------------------------------------------------------
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
      {/* Form Controls */}
      <div className="md:col-span-6 space-y-4 p-6 rounded-2xl border shadow-sm" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border)' }}>
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
            <QrIcon size={16} className="text-emerald-600" />
            <span>QR Code Content & Payload</span>
          </h3>
        </div>

        {/* URL / Text */}
        {!isWifi && !isEmail && !isPhone && !isSms && !isWhatsapp && !isVcard && !isLocation && !isBitcoin && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold" style={{ color: 'var(--ink-soft)' }}>URL or Text Payload</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="https://example.com or any text"
              className="w-full p-3 text-sm rounded-xl border outline-none font-medium"
              style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--ink)' }}
            />
          </div>
        )}

        {/* Wi-Fi */}
        {isWifi && (
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold" style={{ color: 'var(--ink-soft)' }}>Network Name (SSID)</label>
              <input
                type="text"
                value={wifiSsid}
                onChange={(e) => setWifiSsid(e.target.value)}
                placeholder="MyHomeNetwork"
                className="w-full p-2.5 text-sm rounded-xl border outline-none font-medium"
                style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--ink)' }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold" style={{ color: 'var(--ink-soft)' }}>Password</label>
              <input
                type="text"
                value={wifiPass}
                onChange={(e) => setWifiPass(e.target.value)}
                placeholder="Network Password"
                className="w-full p-2.5 text-sm rounded-xl border outline-none font-medium"
                style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--ink)' }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold" style={{ color: 'var(--ink-soft)' }}>Encryption Type</label>
              <div className="flex gap-2">
                {(['WPA', 'WEP', 'nopass'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setWifiType(type)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                      wifiType === type ? 'bg-emerald-600 text-white' : 'bg-stone-100 dark:bg-stone-800'
                    }`}
                    style={{ borderColor: 'var(--border)' }}
                  >
                    {type === 'nopass' ? 'Open' : type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Email */}
        {isEmail && (
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold" style={{ color: 'var(--ink-soft)' }}>Recipient Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full p-2.5 text-sm rounded-xl border outline-none font-medium"
                style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--ink)' }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold" style={{ color: 'var(--ink-soft)' }}>Subject Line</label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Subject"
                className="w-full p-2.5 text-sm rounded-xl border outline-none font-medium"
                style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--ink)' }}
              />
            </div>
          </div>
        )}

        {/* Phone */}
        {isPhone && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold" style={{ color: 'var(--ink-soft)' }}>Phone Number (with Country Code)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 555 123 4567"
              className="w-full p-3 text-sm rounded-xl border outline-none font-medium"
              style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--ink)' }}
            />
          </div>
        )}

        {/* SMS */}
        {isSms && (
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold" style={{ color: 'var(--ink-soft)' }}>Recipient Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 123 4567"
                className="w-full p-2.5 text-sm rounded-xl border outline-none font-medium"
                style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--ink)' }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold" style={{ color: 'var(--ink-soft)' }}>Message Text</label>
              <textarea
                rows={2}
                value={smsMsg}
                onChange={(e) => setSmsMsg(e.target.value)}
                className="w-full p-2.5 text-sm rounded-xl border outline-none font-medium"
                style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--ink)' }}
              />
            </div>
          </div>
        )}

        {/* WhatsApp */}
        {isWhatsapp && (
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold" style={{ color: 'var(--ink-soft)' }}>WhatsApp Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+15551234567"
                className="w-full p-2.5 text-sm rounded-xl border outline-none font-medium"
                style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--ink)' }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold" style={{ color: 'var(--ink-soft)' }}>Pre-filled Chat Message</label>
              <textarea
                rows={2}
                value={waMsg}
                onChange={(e) => setWaMsg(e.target.value)}
                className="w-full p-2.5 text-sm rounded-xl border outline-none font-medium"
                style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--ink)' }}
              />
            </div>
          </div>
        )}

        {/* vCard */}
        {isVcard && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold" style={{ color: 'var(--ink-soft)' }}>Full Name</label>
                <input
                  type="text"
                  value={vcardName}
                  onChange={(e) => setVcardName(e.target.value)}
                  className="w-full p-2.5 text-sm rounded-xl border outline-none font-medium"
                  style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--ink)' }}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold" style={{ color: 'var(--ink-soft)' }}>Company / Org</label>
                <input
                  type="text"
                  value={vcardOrg}
                  onChange={(e) => setVcardOrg(e.target.value)}
                  className="w-full p-2.5 text-sm rounded-xl border outline-none font-medium"
                  style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--ink)' }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold" style={{ color: 'var(--ink-soft)' }}>Email</label>
                <input
                  type="email"
                  value={vcardEmail}
                  onChange={(e) => setVcardEmail(e.target.value)}
                  className="w-full p-2.5 text-sm rounded-xl border outline-none font-medium"
                  style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--ink)' }}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold" style={{ color: 'var(--ink-soft)' }}>Phone</label>
                <input
                  type="tel"
                  value={vcardPhone}
                  onChange={(e) => setVcardPhone(e.target.value)}
                  className="w-full p-2.5 text-sm rounded-xl border outline-none font-medium"
                  style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--ink)' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Location */}
        {isLocation && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold" style={{ color: 'var(--ink-soft)' }}>Latitude</label>
              <input
                type="text"
                value={locLat}
                onChange={(e) => setLocLat(e.target.value)}
                placeholder="37.7749"
                className="w-full p-2.5 text-sm rounded-xl border outline-none font-medium"
                style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--ink)' }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold" style={{ color: 'var(--ink-soft)' }}>Longitude</label>
              <input
                type="text"
                value={locLng}
                onChange={(e) => setLocLng(e.target.value)}
                placeholder="-122.4194"
                className="w-full p-2.5 text-sm rounded-xl border outline-none font-medium"
                style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--ink)' }}
              />
            </div>
          </div>
        )}

        {/* Bitcoin */}
        {isBitcoin && (
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold" style={{ color: 'var(--ink-soft)' }}>BTC Wallet Address</label>
              <input
                type="text"
                value={btcAddress}
                onChange={(e) => setBtcAddress(e.target.value)}
                className="w-full p-2.5 text-sm rounded-xl border outline-none font-medium"
                style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--ink)' }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold" style={{ color: 'var(--ink-soft)' }}>Amount (BTC)</label>
              <input
                type="text"
                value={btcAmount}
                onChange={(e) => setBtcAmount(e.target.value)}
                placeholder="0.005"
                className="w-full p-2.5 text-sm rounded-xl border outline-none font-medium"
                style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--ink)' }}
              />
            </div>
          </div>
        )}

        {/* Color Customization */}
        <div className="pt-3 border-t grid grid-cols-2 gap-3" style={{ borderColor: 'var(--border)' }}>
          <div>
            <label className="text-[11px] font-semibold text-stone-500 block mb-1">Foreground Color</label>
            <input
              type="color"
              value={fgColor}
              onChange={(e) => setFgColor(e.target.value)}
              className="h-8 w-full cursor-pointer rounded-lg border bg-transparent p-0.5"
              style={{ borderColor: 'var(--border)' }}
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-stone-500 block mb-1">Background Color</label>
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="h-8 w-full cursor-pointer rounded-lg border bg-transparent p-0.5"
              style={{ borderColor: 'var(--border)' }}
            />
          </div>
        </div>
      </div>

      {/* 2D QR Code Output Preview & Download */}
      <div className="md:col-span-6 flex flex-col items-center justify-center p-6 rounded-2xl border space-y-5 shadow-sm" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="p-5 bg-white rounded-2xl shadow-md flex items-center justify-center border border-stone-200">
          {dataUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={dataUrl} alt="Generated QR Code" className="w-56 h-56 object-contain" />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center text-stone-300">
              <QrIcon size={64} />
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <ClayButton
            onClick={handleDownloadQr}
            disabled={!dataUrl}
            variant="primary"
            icon={<Download size={16} />}
          >
            Download PNG High-Res
          </ClayButton>
          <ClayButton
            onClick={handleDownloadSvg}
            disabled={!dataUrl}
            variant="secondary"
            icon={<Download size={16} />}
          >
            Download Vector SVG
          </ClayButton>
        </div>
      </div>

      {/* Massive SEO Content for QR Code Generator */}
      {slug === 'qr-code-generator' && (
        <div className="md:col-span-12">
          <QrCodeSeoContent />
        </div>
      )}
    </div>
  );
}
