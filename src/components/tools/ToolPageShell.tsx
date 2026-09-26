import Link from 'next/link';
import { type ReactNode } from 'react';
import {
  Sparkles,
  ArrowRight,
  Zap,
  ShieldCheck,
  Lock,
  Cpu,
  CheckCircle2,
  Smartphone,
  HelpCircle,
  Layers,
  FileCheck,
} from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Accordion } from '@/components/ui/Accordion';
import { ClayCard } from '@/components/ui/ClayCard';
import { JsonLd } from '@/components/seo/JsonLd';
import {
  type Tool,
  getCategoryBySlug,
  getSubcategoryBySlug,
  getRelatedTools,
  getToolUrl,
  getCategoryUrl,
  getSubcategoryUrl,
} from '@/lib/tool-registry';
import { buildToolJsonLd } from '@/lib/seo';
import { type Locale, DEFAULT_LOCALE, getLocalizedPath } from '@/lib/i18n';
import {
  getToolSeoTranslation,
  getCategorySeoTranslation,
  getSubcategorySeoTranslation,
  t,
} from '@/lib/translations';

interface ToolPageShellProps {
  tool: Tool;
  children: ReactNode;
  howToSteps?: string[];
  referenceTable?: ReactNode;
  locale?: Locale;
}

function getCategorySpecificSteps(categorySlug: string, toolName: string): string[] {
  switch (categorySlug) {
    case 'image-social-media-hub':
      return [
        `Select or drag-and-drop your image directly into the ${toolName} canvas.`,
        'Choose your desired resolution, target social platform preset, or enter custom dimensions.',
        'Fine-tune cropping, alignment, and compression strength with instantaneous real-time visual preview.',
        'Click download to save your pixel-perfect, optimized image directly to your device with zero server uploads.',
      ];
    case 'pdf-toolkit':
      return [
        `Open or drag your PDF document(s) into ${toolName}.`,
        'Configure operations such as reordering pages, setting passwords, compressing, or rotating.',
        'Verify document structure and layout with real-time in-browser rendering.',
        'Export your freshly compiled PDF instantly — 100% private with zero data sent to external servers.',
      ];
    case 'developer-tools':
      return [
        `Paste or load your raw code, JSON payload, regex pattern, or network data into ${toolName}.`,
        'Select your formatting rules (indentation spacing, minification, encoding scheme, or diagnostic checks).',
        'Review instant syntax validation, formatted structure, or generated output computed in real time.',
        'Copy the validated result directly to your clipboard or download it as a dedicated file with one click.',
      ];
    case 'image-converter-toolkit':
      return [
        `Upload your image file (PNG, JPG, WebP, HEIC, SVG, BMP, or GIF) into ${toolName}.`,
        'Select your target output format and adjust quality sliders for optimal file size and fidelity.',
        'Inspect the instant preview comparison to ensure crisp visual clarity and accurate dimensions.',
        'Download your converted image locally with lossless fidelity, zero watermarks, and no wait queues.',
      ];
    case 'qr-barcode-tools':
      return [
        `Enter your destination URL, Wi-Fi credentials, contact vCard, or product number into ${toolName}.`,
        'Customize styling, error correction level (L, M, Q, H), and dimensions for maximum scannability.',
        'Test the real-time generated vector code preview directly with your smartphone camera.',
        'Download your crisp high-resolution PNG or vector SVG file ready for digital display or physical print.',
      ];
    default:
      return [
        `Open or input your source data into ${toolName}.`,
        'Adjust parameters, settings, or options to match your exact requirements.',
        'Review the processed result calculated locally in real time on your machine.',
        'Save or copy the final result instantly with zero server transmission.',
      ];
  }
}

function getEnrichedFaqs(tool: Tool, baseFaqs: { q: string; a: string }[]): { q: string; a: string }[] {
  const result = [...baseFaqs];

  const additionalFaqs = [
    {
      q: `Does ${tool.name} upload my files or data to any remote server?`,
      a: `No. ${tool.name} runs 100% client-side in your web browser using HTML5 Canvas, WebAssembly (WASM), and the modern Web Cryptography API. None of your photos, documents, or data ever leave your computer or mobile phone. We have zero access to your information.`,
    },
    {
      q: `Is there any limit on file sizes, daily usage, or conversions?`,
      a: `There are no arbitrary daily quotas, conversion limits, or subscription paywalls. Because all processing takes place locally utilizing your device's memory and CPU, you can process as many files as you need completely free of charge.`,
    },
    {
      q: `Can I use ${tool.name} on my mobile smartphone or tablet?`,
      a: `Yes! ${tool.name} is fully mobile-responsive and engineered with touch-friendly controls. It runs smoothly on modern mobile browsers including Safari on iOS and Chrome on Android without needing any app installation.`,
    },
    {
      q: `Can I use the outputs from this tool for commercial projects?`,
      a: `Absolutely. All assets, documents, and code generated by this tool belong entirely to you with zero restrictions, zero watermarks, and no attribution required. You are free to use them in commercial, freelance, or personal projects.`,
    },
  ];

  for (const extra of additionalFaqs) {
    if (result.length >= 6) break;
    if (!result.some((f) => f.q.toLowerCase() === extra.q.toLowerCase())) {
      result.push(extra);
    }
  }

  return result;
}

export async function ToolPageShell({
  tool,
  children,
  howToSteps,
  referenceTable,
  locale = DEFAULT_LOCALE,
}: ToolPageShellProps) {
  const category = getCategoryBySlug(tool.category);
  const subcategory = tool.subcategory
    ? getSubcategoryBySlug(tool.category, tool.subcategory)
    : undefined;
  const relatedTools = getRelatedTools(tool);
  const localizedRelatedTools = await Promise.all(
    relatedTools.map(async (rel) => {
      const relSeo = await getToolSeoTranslation(locale, rel.slug);
      return {
        ...rel,
        displayName: relSeo?.name || rel.name,
        displayShortDescription: relSeo?.shortDescription || rel.shortDescription,
      };
    })
  );

  // Multilingual SEO overrides
  const seo = await getToolSeoTranslation(locale, tool.slug);
  const categorySeo = await getCategorySeoTranslation(locale, tool.category);
  const subcategorySeo = tool.subcategory
    ? await getSubcategorySeoTranslation(locale, tool.subcategory)
    : null;

  const toolName = seo?.name || tool.name;
  const toolH1 = seo?.h1 || tool.h1;
  const toolMetaDesc = seo?.metaDescription || tool.metaDescription;
  const categoryName = categorySeo?.name || category?.name || 'Tool';
  const subcategoryName = subcategorySeo?.name || subcategory?.name;

  const baseFaqs = (seo?.faqs && seo.faqs.length > 0) ? seo.faqs : tool.faqs;
  const faqsToDisplay = getEnrichedFaqs(tool, baseFaqs);

  const stepsToDisplay = howToSteps && howToSteps.length > 0
    ? howToSteps
    : getCategorySpecificSteps(tool.category, toolName);

  const { softwareApp, faqPage, howToSchema } = await buildToolJsonLd(tool, locale, stepsToDisplay);

  // Build localized breadcrumb items
  const breadcrumbItems = [
    { label: t(locale, 'breadcrumbs.home'), href: getLocalizedPath(locale, '/') },
    { label: t(locale, 'breadcrumbs.tools'), href: getLocalizedPath(locale, '/tools') },
  ];
  if (category) {
    breadcrumbItems.push({
      label: categoryName,
      href: getLocalizedPath(locale, getCategoryUrl(category)),
    });
  }
  if (subcategory && category) {
    breadcrumbItems.push({
      label: subcategoryName || subcategory.name,
      href: getLocalizedPath(locale, getSubcategoryUrl(subcategory)),
    });
  }
  breadcrumbItems.push({
    label: toolName,
    href: getLocalizedPath(locale, getToolUrl(tool)),
  });

  return (
    <>
      <JsonLd data={softwareApp} />
      {faqPage && <JsonLd data={faqPage} />}
      {howToSchema && <JsonLd data={howToSchema} />}

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
        {/* 1. Breadcrumbs */}
        <div className="mb-4 sm:mb-6">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* 2. Header: H1 + Intro */}
        <header className="mb-6 sm:mb-8">
          <div
            className="mb-3 inline-flex items-center gap-2 rounded-[10px] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white"
            style={{
              background: category ? `var(--color-${category.color})` : 'var(--color-accent-primary)',
            }}
          >
            <Layers size={13} />
            <span>{categoryName}</span>
          </div>
          <h1
            className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3 sm:mb-4 leading-tight"
            style={{ color: 'var(--ink)' }}
          >
            {toolH1}
          </h1>
          <p
            className="text-base sm:text-lg leading-relaxed max-w-3xl font-medium"
            style={{ color: 'var(--ink-soft)' }}
          >
            {toolMetaDesc}
          </p>
        </header>

        {/* 3. Primary Interactive Tool Panel (Above the fold) */}
        <section className="mb-6">
          <ClayCard className="border border-white/60 dark:border-white/10 overflow-hidden shadow-lg">
            {children}
          </ClayCard>
        </section>

        {/* 4. Feature Trust Badge Bar */}
        <div
          className="mb-10 sm:mb-14 flex flex-wrap items-center justify-between gap-3 sm:gap-4 rounded-[14px] p-4 sm:px-5 sm:py-3.5 border shadow-sm"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold" style={{ color: 'var(--ink)' }}>
            <Zap size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              <strong>{t(locale, 'features.instantExecution')}:</strong> 100% in-browser WebAssembly & Canvas engine
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-300 font-medium">
            <Sparkles size={14} className="text-amber-500 shrink-0" />
            <span>Zero Server Uploads • No Signup Required • 100% Free Forever</span>
          </div>
        </div>

        {/* 5. Optional Reference Table / Platform Specs */}
        {referenceTable && (
          <section className="mb-10 sm:mb-14">
            <h2 className="text-xl sm:text-2xl font-bold mb-4" style={{ color: 'var(--ink)' }}>
              {t(locale, 'tools.specsAndDimensions')}
            </h2>
            <div
              className="overflow-x-auto rounded-[14px] border -webkit-overflow-scrolling-touch"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
            >
              {referenceTable}
            </div>
          </section>
        )}

        {/* 6. Step-by-Step Practical How-to Guide */}
        <section className="mb-10 sm:mb-14">
          <div className="mb-5 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2" style={{ color: 'var(--ink)' }}>
              {t(locale, 'tools.howToUse')} {toolName}
            </h2>
            <p className="text-xs sm:text-sm font-medium" style={{ color: 'var(--ink-soft)' }}>
              Follow these simple steps to process your files securely in your browser with zero latency.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stepsToDisplay.map((step, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3.5 p-4 sm:p-5 rounded-[14px] border"
                style={{
                  background: 'var(--surface)',
                  borderColor: 'var(--border)',
                }}
              >
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm"
                  style={{ background: 'var(--color-accent-primary)' }}
                >
                  {idx + 1}
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Step {idx + 1}
                  </span>
                  <p className="text-xs sm:text-sm font-medium leading-relaxed" style={{ color: 'var(--ink)' }}>
                    {step}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 7. Comprehensive Differentiator: Client-Side Security & Architecture */}
        <section
          className="mb-10 sm:mb-14 rounded-[18px] border p-6 sm:p-8 relative overflow-hidden"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[8px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck size={14} />
              <span>The Alee Privacy & Security Advantage</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: 'var(--ink)' }}>
              Why In-Browser Processing is Safer Than Cloud Uploads
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed font-medium" style={{ color: 'var(--ink-soft)' }}>
              Traditional online utilities force you to upload your personal photographs, sensitive corporate documents, contracts, and code to remote servers. This introduces real security risks: your files can be intercepted over the network, stored on third-party cloud disks, or retained indefinitely.
            </p>
            <p className="text-xs sm:text-sm leading-relaxed font-medium" style={{ color: 'var(--ink-soft)' }}>
              <strong>Alee Tools works completely differently:</strong> every calculation, conversion, resizing, and encryption operation in <strong>{toolName}</strong> is performed 100% locally in your device&apos;s browser memory via modern WebAssembly and HTML5 Canvas APIs. Zero bytes are uploaded to our servers, zero telemetry logs your file content, and your data remains strictly confidential and secure.
            </p>
          </div>

          {/* 6 Key Pillars Grid */}
          <div className="mt-6 pt-6 border-t grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 shrink-0">
                <Lock size={16} />
              </div>
              <div>
                <h3 className="text-xs font-bold" style={{ color: 'var(--ink)' }}>100% Local Privacy</h3>
                <p className="text-[11px] font-medium leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
                  Files never leave your machine. GDPR and CCPA compliant by design.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-[10px] bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 shrink-0">
                <Cpu size={16} />
              </div>
              <div>
                <h3 className="text-xs font-bold" style={{ color: 'var(--ink)' }}>Zero Network Latency</h3>
                <p className="text-[11px] font-medium leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
                  Hardware-accelerated processing bypasses slow upload & download queues.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 shrink-0">
                <CheckCircle2 size={16} />
              </div>
              <div>
                <h3 className="text-xs font-bold" style={{ color: 'var(--ink)' }}>Pixel-Perfect Quality</h3>
                <p className="text-[11px] font-medium leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
                  Mathematical precision ensures crisp output without generational compression.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-[10px] bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 shrink-0">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="text-xs font-bold" style={{ color: 'var(--ink)' }}>No Accounts or Paywalls</h3>
                <p className="text-[11px] font-medium leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
                  Enjoy unrestricted access with no signup, credit card, or subscription traps.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-[10px] bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400 shrink-0">
                <Smartphone size={16} />
              </div>
              <div>
                <h3 className="text-xs font-bold" style={{ color: 'var(--ink)' }}>Mobile & Desktop Ready</h3>
                <p className="text-[11px] font-medium leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
                  Responsive tactile layout engineered for smartphones, tablets, and laptops.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-[10px] bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 shrink-0">
                <FileCheck size={16} />
              </div>
              <div>
                <h3 className="text-xs font-bold" style={{ color: 'var(--ink)' }}>Safe for Sensitive Work</h3>
                <p className="text-[11px] font-medium leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
                  Ideal for financial records, confidential legal forms, personal photos, and code.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Technical Specifications & Environment Breakdown */}
        <section
          className="mb-10 sm:mb-14 rounded-[16px] border p-6"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Cpu size={18} className="text-emerald-700 dark:text-emerald-400" />
            <h2 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--ink)' }}>
              Technical Specifications & Compatibility
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 rounded-[10px] border bg-stone-50/60 dark:bg-stone-900/40" style={{ borderColor: 'var(--border)' }}>
              <span className="text-[10px] font-bold uppercase text-stone-500 block mb-1">Execution Engine</span>
              <strong style={{ color: 'var(--ink)' }}>Local WASM & Canvas</strong>
            </div>
            <div className="p-3 rounded-[10px] border bg-stone-50/60 dark:bg-stone-900/40" style={{ borderColor: 'var(--border)' }}>
              <span className="text-[10px] font-bold uppercase text-stone-500 block mb-1">Server Upload</span>
              <strong className="text-emerald-700 dark:text-emerald-400">0 KB (Strictly Local)</strong>
            </div>
            <div className="p-3 rounded-[10px] border bg-stone-50/60 dark:bg-stone-900/40" style={{ borderColor: 'var(--border)' }}>
              <span className="text-[10px] font-bold uppercase text-stone-500 block mb-1">Supported Browsers</span>
              <strong style={{ color: 'var(--ink)' }}>Chrome, Safari, Firefox, Edge</strong>
            </div>
            <div className="p-3 rounded-[10px] border bg-stone-50/60 dark:bg-stone-900/40" style={{ borderColor: 'var(--border)' }}>
              <span className="text-[10px] font-bold uppercase text-stone-500 block mb-1">License & Cost</span>
              <strong className="text-emerald-700 dark:text-emerald-400">100% Free Forever</strong>
            </div>
          </div>
        </section>

        {/* 9. Comprehensive FAQ Accordion */}
        {faqsToDisplay && faqsToDisplay.length > 0 && (
          <section className="mb-10 sm:mb-14">
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle size={20} className="text-emerald-700 dark:text-emerald-400" />
              <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--ink)' }}>
                Frequently Asked Questions about {toolName}
              </h2>
            </div>
            <p className="text-xs sm:text-sm font-medium mb-6" style={{ color: 'var(--ink-soft)' }}>
              Everything you need to know about functionality, privacy, file formats, and troubleshooting.
            </p>
            <div
              className="rounded-[14px] border p-5 sm:p-8"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
              }}
            >
              <Accordion items={faqsToDisplay} />
            </div>
          </section>
        )}

        {/* 10. Related Tools (Internal Linking Network) */}
        {relatedTools.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--ink)' }}>
                  {t(locale, 'tools.relatedTools')}
                </h2>
                <p className="text-xs sm:text-sm font-medium mt-1" style={{ color: 'var(--ink-soft)' }}>
                  Discover more free client-side utilities in the {categoryName} collection.
                </p>
              </div>
              <Link
                href={getLocalizedPath(locale, '/tools')}
                className="text-xs sm:text-sm font-semibold flex items-center gap-1 hover:underline shrink-0"
                style={{ color: 'var(--color-accent-primary)' }}
              >
                <span>{t(locale, 'home.viewAllTools')}</span>
                <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {localizedRelatedTools.map((rel) => (
                <Link
                  key={rel.slug}
                  href={getLocalizedPath(locale, getToolUrl(rel))}
                  className="group block p-4 sm:p-5 rounded-[14px] border transition-all duration-150 hover:shadow-md no-underline"
                  style={{
                    background: 'var(--surface)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <h3
                    className="text-sm sm:text-base font-semibold mb-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors"
                    style={{ color: 'var(--ink)' }}
                  >
                    {rel.displayName}
                  </h3>
                  <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed font-medium">
                    {rel.displayShortDescription}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
