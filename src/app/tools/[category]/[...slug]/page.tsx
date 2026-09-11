import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import { ToolPageShell } from '@/components/tools/ToolPageShell';
import { ToolRenderer } from '@/components/tools/ToolRenderer';
import {
  tools,
  subcategories,
  getCategoryBySlug,
  getSubcategoryBySlug,
  getToolBySlug,
  getToolsBySubcategory,
  getToolUrl,
  getCategoryUrl,
  type Tool,
  type Subcategory,
} from '@/lib/tool-registry';
import {
  buildToolMetadata,
  buildSubcategoryMetadata,
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
} from '@/lib/seo';

type Props = {
  params: Promise<{ category: string; slug: string[] }>;
};

export async function generateStaticParams() {
  const params: { category: string; slug: string[] }[] = [];

  // 1. Subcategory hubs (15)
  for (const sub of subcategories) {
    params.push({
      category: sub.categorySlug,
      slug: [sub.slug],
    });
  }

  // 2. Flat tools (e.g. 26 tools in pdf-toolkit with no subcategory)
  for (const tool of tools) {
    if (!tool.subcategory) {
      params.push({
        category: tool.category,
        slug: [tool.slug],
      });
    } else {
      // 3. Subcategorized tools (130 tools)
      params.push({
        category: tool.category,
        slug: [tool.subcategory, tool.slug],
      });
    }
  }

  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: categorySlug, slug } = await params;
  const category = getCategoryBySlug(categorySlug);
  if (!category || !slug || slug.length === 0) return {};

  if (slug.length === 1) {
    // Either a subcategory or a flat tool
    const subcategory = getSubcategoryBySlug(categorySlug, slug[0]);
    if (subcategory) {
      return buildSubcategoryMetadata(subcategory, category);
    }
    const flatTool = getToolBySlug(categorySlug, slug[0]);
    if (flatTool) {
      return buildToolMetadata(flatTool);
    }
  } else if (slug.length === 2) {
    // Nested tool: slug[0] = subcategory, slug[1] = tool slug
    const nestedTool = getToolBySlug(categorySlug, slug[1], slug[0]);
    if (nestedTool) {
      return buildToolMetadata(nestedTool);
    }
  }

  return {};
}

export default async function DynamicToolOrSubcategoryPage({ params }: Props) {
  const { category: categorySlug, slug } = await params;
  const category = getCategoryBySlug(categorySlug);
  if (!category || !slug || slug.length === 0) {
    notFound();
  }

  // ─── CASE A: Subcategory Hub ───
  if (slug.length === 1) {
    const subcategory = getSubcategoryBySlug(categorySlug, slug[0]);
    if (subcategory) {
      const subcategoryTools = getToolsBySubcategory(categorySlug, subcategory.slug);

      const breadcrumbs = [
        { label: 'Home', href: '/' },
        { label: 'Tools', href: '/tools' },
        { label: category.name, href: getCategoryUrl(category) },
        { label: subcategory.name, href: `/tools/${category.slug}/${subcategory.slug}` },
      ];

      const breadcrumbJsonLd = buildBreadcrumbJsonLd([
        { name: 'Home', url: '/' },
        { name: 'Tools', url: '/tools' },
        { name: category.name, url: getCategoryUrl(category) },
        { name: subcategory.name, url: `/tools/${category.slug}/${subcategory.slug}` },
      ]);

      const collectionJsonLd = buildCollectionPageJsonLd(
        subcategory.name,
        subcategory.description,
        `/tools/${category.slug}/${subcategory.slug}`,
        subcategoryTools.map((t) => ({
          name: t.name,
          url: getToolUrl(t),
        }))
      );

      return (
        <>
          <JsonLd data={breadcrumbJsonLd} />
          <JsonLd data={collectionJsonLd} />

          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
            <div className="mb-6">
              <Breadcrumbs items={breadcrumbs} />
            </div>

            <header className="mb-12 max-w-3xl">
              <div
                className="mb-3 inline-flex items-center gap-2 rounded-[10px] px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-white"
                style={{ background: `var(--color-${category.color})` }}
              >
                <span>{category.name}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4" style={{ color: 'var(--ink)' }}>
                {subcategory.name}
              </h1>
              <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 leading-relaxed">
                {subcategory.description}
              </p>
            </header>

            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--ink)' }}>
                  Tools in this section
                </h2>
                <span className="text-xs text-stone-500 font-medium">
                  {subcategoryTools.length} tools
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {subcategoryTools.map((tool) => (
                  <Link
                    key={tool.slug}
                    href={getToolUrl(tool)}
                    className="group relative flex flex-col justify-between overflow-hidden p-5 rounded-[16px] border transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 no-underline"
                    style={{
                      background: 'var(--surface)',
                      borderColor: 'var(--border)',
                    }}
                  >
                    {/* Replicated Glowing Dot Matrix Pattern Backdrop */}
                    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                      <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-emerald-500/10 dark:bg-emerald-400/15 blur-xl transition-all group-hover:scale-125" />
                      <div className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-amber-500/10 dark:bg-violet-500/15 blur-xl transition-all group-hover:scale-125" />
                      <div className="absolute inset-0 bg-[radial-gradient(#2C6E59_0.9px,transparent_0.9px)] dark:bg-[radial-gradient(#3DD6A0_0.9px,transparent_0.9px)] [background-size:32px_32px] opacity-15 dark:opacity-25" />
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/40 dark:via-emerald-400/50 to-transparent" />
                    </div>

                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-[6px]"
                          style={{
                            background: `var(--color-${category.color}-soft)`,
                            color: `var(--color-${category.color})`,
                          }}
                        >
                          {subcategory.name}
                        </span>
                        <ArrowRight
                          size={14}
                          className="text-stone-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 group-hover:translate-x-1 transition-all"
                        />
                      </div>
                      <h3
                        className="text-base font-semibold mb-1.5 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors"
                        style={{ color: 'var(--ink)' }}
                      >
                        {tool.name}
                      </h3>
                      <p className="text-xs line-clamp-2 leading-relaxed font-medium" style={{ color: 'var(--ink-soft)' }}>
                        {tool.shortDescription}
                      </p>
                    </div>

                    <div className="relative z-10 mt-4 pt-3 border-t flex items-center gap-1.5 text-[11px] font-semibold" style={{ borderColor: 'var(--border)', color: 'var(--ink-soft)' }}>
                      <Sparkles size={12} className="text-emerald-600 dark:text-emerald-400" />
                      <span>Instant Access</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </>
      );
    }

    // ─── CASE B: Flat Tool (e.g. PDF tools directly under /tools/pdf-toolkit/merge-pdf) ───
    const flatTool = getToolBySlug(categorySlug, slug[0]);
    if (flatTool) {
      return (
        <ToolPageShell tool={flatTool}>
          <ToolRenderer tool={flatTool} />
        </ToolPageShell>
      );
    }
  }

  // ─── CASE C: Nested Tool (slug.length === 2: /tools/[cat]/[sub]/[tool]) ───
  if (slug.length === 2) {
    const nestedTool = getToolBySlug(categorySlug, slug[1], slug[0]);
    if (nestedTool) {
      return (
        <ToolPageShell tool={nestedTool}>
          <ToolRenderer tool={nestedTool} />
        </ToolPageShell>
      );
    }
  }

  notFound();
}
