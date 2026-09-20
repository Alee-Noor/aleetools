'use client';

import { useState, useEffect, useRef, type ChangeEvent } from 'react';
import { usePathname } from 'next/navigation';
import { SOCIAL_SPECS, type PlatformSpec } from '@/lib/engines/calc-engine';
import { ClayButton } from '@/components/ui/ClayButton';
import {
  Copy,
  Check,
  Lock,
  Unlock,
  UploadCloud,
  X,
  Image as ImageIcon,
  Sparkles,
  Info,
  Maximize2,
  Sliders,
} from 'lucide-react';
import type { Tool } from '@/lib/tool-registry';
import { DEFAULT_LOCALE, getLocaleFromPathname, type Locale } from '@/lib/i18n';
import { t } from '@/lib/translations';

interface CalculatorToolProps {
  tool: Tool;
  locale?: Locale;
}

const PRESET_NAMES: Record<Locale, Record<string, string>> = {
  en: {
    '16:9': 'Widescreen / Video',
    '9:16': 'Stories / Reels / Shorts',
    '1:1': 'Square / Feed',
    '4:5': 'Instagram Portrait',
    '4:3': 'Standard / Tablet',
    '3:2': 'Classic 35mm Photo',
    '21:9': 'Cinematic Ultrawide',
  },
  fr: {
    '16:9': 'Écran large / Vidéo',
    '9:16': 'Stories / Reels / Shorts',
    '1:1': 'Carré / Flux',
    '4:5': 'Portrait Instagram',
    '4:3': 'Standard / Tablette',
    '3:2': 'Photo 35mm classique',
    '21:9': 'Cinématique ultra-large',
  },
  es: {
    '16:9': 'Pantalla ancha / Video',
    '9:16': 'Historias / Reels / Shorts',
    '1:1': 'Cuadrado / Feed',
    '4:5': 'Retrato de Instagram',
    '4:3': 'Estándar / Tableta',
    '3:2': 'Foto clásica 35mm',
    '21:9': 'Ultra ancho cinemático',
  },
  de: {
    '16:9': 'Breitbild / Video',
    '9:16': 'Storys / Reels / Shorts',
    '1:1': 'Quadratisch / Feed',
    '4:5': 'Instagram Hochformat',
    '4:3': 'Standard / Tablet',
    '3:2': 'Klassisches 35mm Foto',
    '21:9': 'Cinematic Ultrawide',
  },
  'pt-BR': {
    '16:9': 'Widescreen / Vídeo',
    '9:16': 'Stories / Reels / Shorts',
    '1:1': 'Quadrado / Feed',
    '4:5': 'Retrato Instagram',
    '4:3': 'Padrão / Tablet',
    '3:2': 'Foto clássica 35mm',
    '21:9': 'Ultrawide cinematográfico',
  },
  ar: {
    '16:9': 'شاشة عريضة / فيديو',
    '9:16': 'قصص / ريلز / شورتس',
    '1:1': 'مربع / المنشورات',
    '4:5': 'بورتريه إنستغرام',
    '4:3': 'قياسي / جهاز لوحي',
    '3:2': 'صورة كلاسيكية 35 مم',
    '21:9': 'شاشة سينمائية فائقة الاتساع',
  },
};

const DROPZONE_TEXT: Record<Locale, { title: string; subtitle: string }> = {
  en: {
    title: 'Drop an image here to auto-detect its dimensions & aspect ratio',
    subtitle: 'Supports PNG, JPG, WebP, SVG, and GIF. Instantly reads natural resolution.',
  },
  fr: {
    title: 'Déposez une image ici pour détecter automatiquement ses dimensions et son ratio',
    subtitle: 'Prend en charge PNG, JPG, WebP, SVG et GIF. Lecture instantanée de la résolution native.',
  },
  es: {
    title: 'Arrastra una imagen aquí para detectar automáticamente sus dimensiones y proporción',
    subtitle: 'Soporta PNG, JPG, WebP, SVG y GIF. Lee al instante la resolución natural.',
  },
  de: {
    title: 'Ziehen Sie ein Bild hierher, um Maße und Seitenverhältnis automatisch zu erkennen',
    subtitle: 'Unterstützt PNG, JPG, WebP, SVG und GIF. Liest native Auflösung sofort.',
  },
  'pt-BR': {
    title: 'Arraste uma imagem aqui para detectar automaticamente suas dimensões e proporção',
    subtitle: 'Suporta PNG, JPG, WebP, SVG e GIF. Lê instantaneamente a resolução nativa.',
  },
  ar: {
    title: 'أفلت صورة هنا للكشف التلقائي عن أبعادها ونسبة العرض إلى الارتفاع',
    subtitle: 'يدعم PNG و JPG و WebP و SVG و GIF. يقرأ الدقة الأصلية فوراً.',
  },
};

const SPEC_LABELS: Record<
  Locale,
  {
    official: string;
    pixels: string;
    maxFileSize: string;
    format: string;
    aspectRatio: string;
    safeArea: string;
    tipsTitle: string;
  }
> = {
  en: {
    official: 'Official Specification',
    pixels: 'pixels',
    maxFileSize: 'Max File Size',
    format: 'Format',
    aspectRatio: 'Aspect Ratio',
    safeArea: 'Safe Area Note:',
    tipsTitle: 'Best Practices & Optimization Tips',
  },
  fr: {
    official: 'Spécification officielle',
    pixels: 'pixels',
    maxFileSize: 'Taille max fichier',
    format: 'Format',
    aspectRatio: "Ratio d'aspect",
    safeArea: 'Remarque zone de sécurité :',
    tipsTitle: "Meilleures pratiques & conseils d'optimisation",
  },
  es: {
    official: 'Especificación oficial',
    pixels: 'píxeles',
    maxFileSize: 'Tamaño máx archivo',
    format: 'Formato',
    aspectRatio: 'Relación de aspecto',
    safeArea: 'Nota de área segura:',
    tipsTitle: 'Mejores prácticas y consejos de optimización',
  },
  de: {
    official: 'Offizielle Spezifikation',
    pixels: 'Pixel',
    maxFileSize: 'Max Dateigröße',
    format: 'Format',
    aspectRatio: 'Seitenverhältnis',
    safeArea: 'Sicherheitsbereich-Hinweis:',
    tipsTitle: 'Best Practices & Optimierungstipps',
  },
  'pt-BR': {
    official: 'Especificação oficial',
    pixels: 'pixels',
    maxFileSize: 'Tamanho máx arquivo',
    format: 'Formato',
    aspectRatio: 'Proporção',
    safeArea: 'Nota sobre área de segurança:',
    tipsTitle: 'Melhores práticas e dicas de otimização',
  },
  ar: {
    official: 'المواصفات الرسمية',
    pixels: 'بكسل',
    maxFileSize: 'أقصى حجم للملف',
    format: 'الصيغة',
    aspectRatio: 'نسبة العرض إلى الارتفاع',
    safeArea: 'ملاحظة المنطقة الآمنة:',
    tipsTitle: 'أفضل الممارسات ونصائح التحسين',
  },
};

function getGcd(a: number, b: number): number {
  return b === 0 ? a : getGcd(b, a % b);
}

function getSimplifiedRatio(w: number, h: number): string {
  if (!w || !h) return '1:1';
  const divisor = getGcd(Math.round(w), Math.round(h));
  const simW = Math.round(w) / divisor;
  const simH = Math.round(h) / divisor;

  // If the numbers are prime/awkward (e.g. 1081:608), match against standard ratios
  const dec = w / h;
  if (Math.abs(dec - 16 / 9) < 0.02) return '16:9';
  if (Math.abs(dec - 9 / 16) < 0.02) return '9:16';
  if (Math.abs(dec - 4 / 3) < 0.02) return '4:3';
  if (Math.abs(dec - 3 / 4) < 0.02) return '3:4';
  if (Math.abs(dec - 1) < 0.01) return '1:1';
  if (Math.abs(dec - 4 / 5) < 0.02) return '4:5';
  if (Math.abs(dec - 5 / 4) < 0.02) return '5:4';
  if (Math.abs(dec - 21 / 9) < 0.03) return '21:9';
  if (Math.abs(dec - 3 / 2) < 0.02) return '3:2';
  if (Math.abs(dec - 2 / 3) < 0.02) return '2:3';

  return `${simW}:${simH}`;
}

const COMMON_RATIOS = [
  { label: '16:9', name: 'Widescreen / Video', w: 16, h: 9, defaultDim: [1920, 1080] },
  { label: '9:16', name: 'Stories / Reels / Shorts', w: 9, h: 16, defaultDim: [1080, 1920] },
  { label: '1:1', name: 'Square / Feed', w: 1, h: 1, defaultDim: [1080, 1080] },
  { label: '4:5', name: 'Instagram Portrait', w: 4, h: 5, defaultDim: [1080, 1350] },
  { label: '4:3', name: 'Standard / Tablet', w: 4, h: 3, defaultDim: [1600, 1200] },
  { label: '3:2', name: 'Classic 35mm Photo', w: 3, h: 2, defaultDim: [1500, 1000] },
  { label: '21:9', name: 'Cinematic Ultrawide', w: 21, h: 9, defaultDim: [2560, 1080] },
];

export function CalculatorTool({ tool, locale: propsLocale }: CalculatorToolProps) {
  const pathname = usePathname() || '';
  const locale: Locale = propsLocale || getLocaleFromPathname(pathname);
  const specLabels = SPEC_LABELS[locale] || SPEC_LABELS.en;
  const dropzone = DROPZONE_TEXT[locale] || DROPZONE_TEXT.en;
  const presetMap = PRESET_NAMES[locale] || PRESET_NAMES.en;

  const getLocalizedOrientation = (orient: 'Landscape' | 'Portrait' | 'Square') => {
    if (orient === 'Landscape') return t(locale, 'calculator.landscape');
    if (orient === 'Portrait') return t(locale, 'calculator.portrait');
    return t(locale, 'calculator.square');
  };

  // Determine relevant platform spec for reference tab
  const slug = tool.slug;
  let defaultSpecKey = 'instagram-post-square';

  if (slug.includes('story')) defaultSpecKey = 'instagram-story';
  else if (slug.includes('reel') || slug.includes('shorts')) defaultSpecKey = 'instagram-reel';
  else if (slug.includes('portrait')) defaultSpecKey = 'instagram-post-portrait';
  else if (slug.includes('landscape')) defaultSpecKey = 'instagram-post-landscape';
  else if (slug.includes('profile')) {
    if (slug.includes('youtube')) defaultSpecKey = 'youtube-profile';
    else if (slug.includes('tiktok')) defaultSpecKey = 'tiktok-profile';
    else defaultSpecKey = 'instagram-profile';
  } else if (slug.includes('youtube') && slug.includes('thumbnail')) defaultSpecKey = 'youtube-thumbnail';
  else if (slug.includes('youtube') && slug.includes('banner')) defaultSpecKey = 'youtube-banner';
  else if (slug.includes('tiktok')) defaultSpecKey = 'tiktok-video';

  const currentSpec: PlatformSpec = SOCIAL_SPECS[defaultSpecKey] || SOCIAL_SPECS['instagram-post-square'];

  // Core Calculator State
  const [activeTab, setActiveTab] = useState<'calculator' | 'spec'>('calculator');
  const [width, setWidth] = useState<number>(currentSpec.width || 1920);
  const [height, setHeight] = useState<number>(currentSpec.height || 1080);
  const [ratioLocked, setRatioLocked] = useState<boolean>(true);
  const [lockedRatio, setLockedRatio] = useState<number>(1920 / 1080);
  const [copiedDim, setCopiedDim] = useState<boolean>(false);
  const [copiedRatio, setCopiedRatio] = useState<boolean>(false);

  // Uploaded Image inspection state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageInfo, setImageInfo] = useState<{ name: string; size: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync locked ratio when locking
  const toggleRatioLock = () => {
    if (!ratioLocked && width > 0 && height > 0) {
      setLockedRatio(width / height);
    }
    setRatioLocked(!ratioLocked);
  };

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (ratioLocked && lockedRatio > 0) {
      setHeight(Math.round(val / lockedRatio));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (ratioLocked && lockedRatio > 0) {
      setWidth(Math.round(val * lockedRatio));
    }
  };

  const handleApplyPreset = (presetW: number, presetH: number, defaultDim?: number[]) => {
    const newRatio = presetW / presetH;
    setLockedRatio(newRatio);
    if (defaultDim) {
      setWidth(defaultDim[0]);
      setHeight(defaultDim[1]);
    } else {
      setHeight(Math.round(width / newRatio));
    }
  };

  const handleScaleMultiplier = (factor: number) => {
    setWidth(Math.round(width * factor));
    setHeight(Math.round(height * factor));
  };

  // Image Upload handler
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedImage(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedImage(e.target.files[0]);
    }
  };

  const processSelectedImage = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
      setLockedRatio(img.naturalWidth / img.naturalHeight);
      setImagePreview(url);
      setImageInfo({
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
      });
    };
    img.src = url;
  };

  const handleClearImage = () => {
    setImagePreview(null);
    setImageInfo(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const simplifiedRatio = getSimplifiedRatio(width, height);
  const decimalRatio = height > 0 ? (width / height).toFixed(2) : '1.00';
  const megapixels = ((width * height) / 1000000).toFixed(2);
  const orientation =
    width > height ? 'Landscape' : height > width ? 'Portrait' : 'Square';

  const handleCopyDimensions = () => {
    navigator.clipboard.writeText(`${width} × ${height}`);
    setCopiedDim(true);
    setTimeout(() => setCopiedDim(false), 2000);
  };

  const handleCopyRatio = () => {
    navigator.clipboard.writeText(simplifiedRatio);
    setCopiedRatio(true);
    setTimeout(() => setCopiedRatio(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Mode Toggle */}
      <div className="flex items-center gap-2 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
        <button
          type="button"
          onClick={() => setActiveTab('calculator')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-[10px] transition-all ${
            activeTab === 'calculator'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800'
          }`}
        >
          <Maximize2 size={16} />
          <span>{t(locale, 'calculator.interactiveTab')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('spec')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-[10px] transition-all ${
            activeTab === 'spec'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800'
          }`}
        >
          <Sliders size={16} />
          <span>{t(locale, 'calculator.specSheetTab')}</span>
        </button>
      </div>

      {activeTab === 'calculator' ? (
        <div className="space-y-8">
          {/* 1. Interactive Inputs & Live Ratio Display */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left: Dimension Inputs */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
                {/* Width input */}
                <div className="flex-1 min-w-[130px] space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    {t(locale, 'calculator.width')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100000"
                    value={width || ''}
                    onChange={(e) => handleWidthChange(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full px-4 py-3 rounded-[12px] border text-lg font-bold font-mono outline-none shadow-sm focus:border-emerald-600"
                    style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--ink)' }}
                  />
                </div>

                {/* Aspect Lock Toggle Button */}
                <div className="flex flex-col items-center justify-end pb-1">
                  <span className="text-[10px] font-semibold text-stone-500 mb-1">
                    {ratioLocked ? t(locale, 'calculator.locked') : t(locale, 'calculator.unlocked')}
                  </span>
                  <button
                    type="button"
                    onClick={toggleRatioLock}
                    title={ratioLocked ? 'Aspect Ratio Locked' : 'Aspect Ratio Unlocked'}
                    className={`p-3 rounded-[12px] border transition-all ${
                      ratioLocked
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-300 dark:border-stone-700'
                    }`}
                  >
                    {ratioLocked ? <Lock size={18} /> : <Unlock size={18} />}
                  </button>
                </div>

                {/* Height input */}
                <div className="flex-1 min-w-[130px] space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    {t(locale, 'calculator.height')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100000"
                    value={height || ''}
                    onChange={(e) => handleHeightChange(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full px-4 py-3 rounded-[12px] border text-lg font-bold font-mono outline-none shadow-sm focus:border-emerald-600"
                    style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--ink)' }}
                  />
                </div>
              </div>

              {/* Quick Preset Chips */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-400">
                  {t(locale, 'calculator.presets')}
                </span>
                <div className="flex flex-wrap gap-2">
                  {COMMON_RATIOS.map((item) => {
                    const isCurrent = simplifiedRatio === item.label;
                    const presetName = presetMap[item.label] || item.name;
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => handleApplyPreset(item.w, item.h, item.defaultDim)}
                        className={`px-3 py-1.5 rounded-[10px] text-xs font-semibold border transition-all ${
                          isCurrent
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-surface border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-emerald-600'
                        }`}
                      >
                        <strong>{item.label}</strong> ({presetName})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scaling Multipliers */}
              <div className="flex items-center gap-2 pt-1 text-xs">
                <span className="font-bold text-stone-600 dark:text-stone-400">
                  {t(locale, 'calculator.scaleResolution')}
                </span>
                {[0.5, 1.5, 2, 3].map((factor) => (
                  <button
                    key={factor}
                    type="button"
                    onClick={() => handleScaleMultiplier(factor)}
                    className="px-2.5 py-1 rounded-[8px] bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 hover:border-emerald-600 font-semibold text-stone-700 dark:text-stone-200"
                  >
                    {factor}x
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Real-time Visual Proportion Preview */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-[18px] border bg-stone-100/70 dark:bg-stone-900/60 shadow-inner" style={{ borderColor: 'var(--border)' }}>
              <div className="h-44 w-full flex items-center justify-center relative">
                {imagePreview ? (
                  <div className="relative max-h-44 max-w-full flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt="Uploaded preview"
                      className="max-h-40 max-w-full object-contain rounded-[10px] border shadow-sm"
                      style={{ borderColor: 'var(--border)' }}
                    />
                    <button
                      type="button"
                      onClick={handleClearImage}
                      title="Clear uploaded image"
                      className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full shadow hover:bg-red-700"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div
                    className="flex flex-col items-center justify-center rounded-[12px] border-2 border-dashed border-emerald-600 dark:border-emerald-400 transition-all duration-300 shadow-sm"
                    style={{
                      width: width >= height ? '200px' : `${Math.max(60, Math.round((200 * width) / height))}px`,
                      height: height >= width ? '160px' : `${Math.max(50, Math.round((160 * height) / width))}px`,
                      background: 'rgba(44, 110, 89, 0.08)',
                    }}
                  >
                    <span className="font-mono text-base font-bold text-emerald-800 dark:text-emerald-300">
                      {simplifiedRatio}
                    </span>
                    <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
                      {decimalRatio}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-3 text-center space-y-1">
                <div className="text-xs font-semibold text-stone-600 dark:text-stone-300">
                  {imageInfo
                    ? `${t(locale, 'common.image')}: ${imageInfo.name}`
                    : `${t(locale, 'calculator.shape')}: ${getLocalizedOrientation(orientation)}`}
                </div>
                <div className="flex items-center gap-2">
                  <ClayButton
                    onClick={handleCopyDimensions}
                    variant="outline"
                    size="sm"
                    icon={copiedDim ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  >
                    {copiedDim ? t(locale, 'calculator.copied') : `${width} × ${height} px`}
                  </ClayButton>

                  <ClayButton
                    onClick={handleCopyRatio}
                    variant="outline"
                    size="sm"
                    icon={copiedRatio ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  >
                    {copiedRatio ? t(locale, 'calculator.copied') : `Ratio: ${simplifiedRatio}`}
                  </ClayButton>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Detected Ratio Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-[14px] border shadow-sm" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="text-xs font-semibold text-stone-500">{t(locale, 'calculator.calculatedRatio')}</div>
              <div className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400 mt-1">
                {simplifiedRatio}
              </div>
            </div>

            <div className="p-4 rounded-[14px] border shadow-sm" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="text-xs font-semibold text-stone-500">{t(locale, 'calculator.decimalRatio')}</div>
              <div className="text-xl font-bold font-mono text-stone-800 dark:text-stone-200 mt-1">
                {decimalRatio}
              </div>
            </div>

            <div className="p-4 rounded-[14px] border shadow-sm" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="text-xs font-semibold text-stone-500">{t(locale, 'calculator.totalMegapixels')}</div>
              <div className="text-xl font-bold font-mono text-stone-800 dark:text-stone-200 mt-1">
                {megapixels} MP
              </div>
            </div>

            <div className="p-4 rounded-[14px] border shadow-sm" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="text-xs font-semibold text-stone-500">{t(locale, 'calculator.orientation')}</div>
              <div className="text-xl font-bold text-stone-800 dark:text-stone-200 mt-1">
                {getLocalizedOrientation(orientation)}
              </div>
            </div>
          </div>

          {/* 3. Image Upload & Inspector Dropzone */}
          <div
            onDrop={handleFileDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="p-6 sm:p-8 rounded-[16px] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all hover:border-emerald-600 hover:bg-emerald-500/5 group text-center"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 mb-3 group-hover:scale-110 transition-transform">
              <UploadCloud size={28} />
            </div>
            <h4 className="text-sm font-bold" style={{ color: 'var(--ink)' }}>
              {dropzone.title}
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              {dropzone.subtitle}
            </p>
          </div>
        </div>
      ) : (
        /* Spec Overview Sheet */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Aspect Ratio Box Preview */}
            <div className="flex flex-col items-center justify-center p-6 rounded-[14px] border bg-stone-100 dark:bg-stone-900/60" style={{ borderColor: 'var(--border)' }}>
              <div
                className="flex items-center justify-center rounded-[8px] border-2 border-dashed border-emerald-600 dark:border-emerald-400 font-mono text-xs font-bold transition-all shadow-sm"
                style={{
                  width: currentSpec.width >= currentSpec.height ? '160px' : `${Math.round((160 * currentSpec.width) / currentSpec.height)}px`,
                  height: currentSpec.height >= currentSpec.width ? '160px' : `${Math.round((160 * currentSpec.height) / currentSpec.width)}px`,
                  background: 'rgba(61, 107, 92, 0.1)',
                  color: 'var(--color-accent-primary)',
                }}
              >
                {currentSpec.aspectRatio}
              </div>
              <span className="mt-3 text-xs font-semibold text-stone-600 dark:text-stone-300">
                {specLabels.aspectRatio}: {currentSpec.aspectRatio}
              </span>
            </div>

            {/* Spec Details */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    {specLabels.official}
                  </span>
                  <h3 className="text-2xl font-bold" style={{ color: 'var(--ink)' }}>
                    {currentSpec.width} × {currentSpec.height} <span className="text-sm font-normal text-stone-500">{specLabels.pixels}</span>
                  </h3>
                </div>

                <ClayButton
                  onClick={handleCopyDimensions}
                  variant="outline"
                  size="sm"
                  icon={copiedDim ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                >
                  {copiedDim ? t(locale, 'calculator.copied') : t(locale, 'calculator.copyDimensions')}
                </ClayButton>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-[10px] border shadow-sm" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                  <div className="text-[11px] font-medium text-stone-500">{specLabels.maxFileSize}</div>
                  <div className="text-sm font-bold mt-0.5">{currentSpec.maxFileSize}</div>
                </div>
                <div className="p-3 rounded-[10px] border shadow-sm" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                  <div className="text-[11px] font-medium text-stone-500">{specLabels.format}</div>
                  <div className="text-sm font-bold mt-0.5">{currentSpec.recommendedFormat}</div>
                </div>
                <div className="p-3 rounded-[10px] border shadow-sm" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                  <div className="text-[11px] font-medium text-stone-500">{specLabels.aspectRatio}</div>
                  <div className="text-sm font-bold mt-0.5">{currentSpec.aspectRatio}</div>
                </div>
              </div>

              {currentSpec.safeArea && (
                <div className="flex items-start gap-2 p-3 rounded-[10px] text-xs bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-900">
                  <Info size={16} className="shrink-0 mt-0.5 text-amber-600" />
                  <span>
                    <strong>{specLabels.safeArea}</strong> {currentSpec.safeArea}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Creator Tips */}
          <div className="p-5 rounded-[14px] border space-y-2.5 shadow-sm" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <h4 className="text-sm font-bold" style={{ color: 'var(--ink)' }}>
              {specLabels.tipsTitle}
            </h4>
            <ul className="space-y-1.5 text-xs text-stone-700 dark:text-stone-300 list-disc list-inside font-medium">
              {currentSpec.tips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
