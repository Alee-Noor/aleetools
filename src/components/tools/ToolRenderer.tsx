'use client';

import dynamic from 'next/dynamic';
import type { Tool } from '@/lib/tool-registry';

// Dynamically import tool engines with ssr: false per performance requirements
const ImageTool = dynamic(
  () => import('./ImageTool').then((mod) => mod.ImageTool),
  { ssr: false }
);
const PdfTool = dynamic(
  () => import('./PdfTool').then((mod) => mod.PdfTool),
  { ssr: false }
);
const DevTool = dynamic(
  () => import('./DevTool').then((mod) => mod.DevTool),
  { ssr: false }
);
const NetworkTool = dynamic(
  () => import('./NetworkTool').then((mod) => mod.NetworkTool),
  { ssr: false }
);
const DpiTool = dynamic(
  () => import('./DpiTool').then((mod) => mod.DpiTool),
  { ssr: false }
);
const PixelCalculatorTool = dynamic(
  () => import('./PixelCalculatorTool').then((mod) => mod.PixelCalculatorTool),
  { ssr: false }
);
const ImageColorPickerTool = dynamic(
  () => import('./ImageColorPickerTool').then((mod) => mod.ImageColorPickerTool),
  { ssr: false }
);
const ExifMetadataTool = dynamic(
  () => import('./ExifMetadataTool').then((mod) => mod.ExifMetadataTool),
  { ssr: false }
);
const SocialHubTools = dynamic(
  () => import('./SocialHubTools').then((mod) => mod.SocialHubTools),
  { ssr: false }
);
const JsonTool = dynamic(
  () => import('./JsonTool').then((mod) => mod.JsonTool),
  { ssr: false }
);
const Base64Tool = dynamic(
  () => import('./Base64Tool').then((mod) => mod.Base64Tool),
  { ssr: false }
);
const CalculatorTool = dynamic(
  () => import('./CalculatorTool').then((mod) => mod.CalculatorTool),
  { ssr: false }
);
const GeneratorTool = dynamic(
  () => import('./GeneratorTool').then((mod) => mod.GeneratorTool),
  { ssr: false }
);
const QrTool = dynamic(
  () => import('./QrTool').then((mod) => mod.QrTool),
  { ssr: false }
);
const DefaultToolFallback = dynamic(
  () => import('./DefaultToolFallback').then((mod) => mod.DefaultToolFallback),
  { ssr: false }
);

interface ToolRendererProps {
  tool: Tool;
}

export function ToolRenderer({ tool }: ToolRendererProps) {
  const slug = tool.slug;
  const category = tool.category;

  // 1. PDF tools (Merge, Split, Images-to-PDF, Rotate, Watermark, etc.)
  if (category === 'pdf-toolkit' || slug.includes('pdf')) {
    return <PdfTool tool={tool} />;
  }

  // 2. Specific Image Calculators & Specialized Utilities
  if (slug.includes('dpi')) {
    return <DpiTool tool={tool} />;
  }

  if (slug.includes('pixel-calculator')) {
    return <PixelCalculatorTool tool={tool} />;
  }

  if (slug.includes('color-picker')) {
    return <ImageColorPickerTool tool={tool} />;
  }

  if (slug.includes('exif') || slug.includes('metadata-viewer')) {
    return <ExifMetadataTool tool={tool} />;
  }

  // 3. Social Hub Interactive Tools (Grid Splitter, YouTube chapters, thumbnail preview)
  if (
    slug.includes('grid-maker') ||
    slug.includes('grid-splitter') ||
    slug === 'youtube-timestamp-generator' ||
    slug.includes('thumbnail-preview') ||
    slug.includes('thumbnail-downloader')
  ) {
    return <SocialHubTools tool={tool} />;
  }

  // 4. Developer Network Utilities & Calculators
  if (
    category === 'developer-tools' &&
    (slug.includes('ip') ||
      slug.includes('cidr') ||
      slug.includes('subnet') ||
      slug.includes('binary') ||
      slug.includes('mac') ||
      slug.includes('user-agent'))
  ) {
    return <NetworkTool tool={tool} />;
  }

  // 5. Image Converters, Resizers, Croppers & Editors
  if (
    category === 'image-converter-toolkit' ||
    slug.includes('compress') ||
    slug.includes('resize') ||
    slug.includes('cropper') ||
    slug.includes('to-jpg') ||
    slug.includes('to-png') ||
    slug.includes('to-webp') ||
    slug.includes('banner') ||
    slug.includes('rotat') ||
    slug.includes('flip') ||
    slug.includes('blur') ||
    slug.includes('pixelate') ||
    slug.includes('grayscale') ||
    slug.includes('brightness') ||
    slug.includes('contrast') ||
    slug.includes('sharpen') ||
    slug.includes('watermark') ||
    slug.includes('thumbnail-maker') ||
    slug.includes('profile-picture')
  ) {
    return <ImageTool tool={tool} />;
  }

  // 6. Genuine Aspect Ratio & Social Media Size Checkers
  if (
    slug.includes('aspect-ratio') ||
    slug.includes('size-calculator') ||
    slug.includes('size-checker')
  ) {
    return <CalculatorTool tool={tool} />;
  }

  // 7. JSON tools
  if (slug.includes('json')) {
    return <JsonTool tool={tool} />;
  }

  // 8. Base64
  if (slug.includes('base64')) {
    return <Base64Tool tool={tool} />;
  }

  // 9. Generators (UUID, Password, Hash)
  if (slug.includes('uuid') || slug.includes('password') || slug.includes('hash')) {
    return <GeneratorTool tool={tool} />;
  }

  // 10. QR & Barcodes
  if (category === 'qr-barcode-tools' || slug.includes('qr') || slug.includes('barcode') || slug.includes('ean') || slug.includes('upc') || slug.includes('code-') || slug.includes('isbn')) {
    return <QrTool tool={tool} />;
  }

  // 11. Remaining Developer Tools & Code/Styling Utilities
  if (category === 'developer-tools') {
    return <DevTool tool={tool} />;
  }

  // Fallback
  return <DefaultToolFallback tool={tool} />;
}
