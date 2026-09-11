# Alee / AleeTools — AI Coding Agent Build Instructions

**Project:** Alee Tools
**Domain:** `alee.software`
**Type:** Single website, multi-tool "micro-SaaS hub" — 156 free browser-based micro-tools organized into 5 categories and 15 sub-categories
**Audience for this document:** an AI coding agent / coding assistant (e.g. Claude Code, Cursor, Copilot Workspace) that will scaffold and build this application from scratch.

> Read this entire document before writing any code. It defines the tech stack, the full information architecture (every tool's URL), the SEO system, the design system, and the build order. Do not deviate from the URL structure in Section 4 — it is the backbone of the site's SEO and must not change once tools are indexed.

---

## Table of Contents

1. [Product Summary](#1-product-summary)
2. [Tech Stack Decision](#2-tech-stack-decision)
3. [Information Architecture & Folder Structure](#3-information-architecture--folder-structure)
4. [URL Structure Rules](#4-url-structure-rules)
5. [SEO System](#5-seo-system)
6. [Design System — "Soft Workshop"](#6-design-system--soft-workshop-minimalist--claymorphismretro)
7. [Homepage Specification](#7-homepage-specification)
8. [Individual Tool Page Template](#8-individual-tool-page-template)
9. [Build Order](#9-build-order-recommended-sequence-for-the-ai-agent)
10. [Deployment](#10-deployment)
11. [Pre-Launch SEO/Quality Checklist](#11-pre-launch-seoquality-checklist)
12. [Full Tool Catalog (156 tools)](#12-full-tool-catalog-authoritative-source-for-libtool-registryts)
13. [Non-Negotiable Constraints Summary](#13-non-negotiable-constraints-summary-for-quick-agent-reference)

---

## 1. Product Summary

Alee ("AleeTools") is a single Next.js website hosting **156 independent, single-purpose utility tools** (image, PDF, developer, QR/barcode) plus a homepage and category/sub-category directory pages. Every tool:

- Runs **100% client-side** in the user's browser. No file the user uploads ever leaves their device — there is no backend server, no file storage, and no database for user content.
- Has its **own indexable URL** with unique, keyword-rich metadata (title, description, H1, structured data), so it can rank independently in Google/Bing for its own long-tail search query (e.g. "instagram post size calculator", "merge pdf online free").
- Is reachable both directly (deep link) and through a category → sub-category → tool navigation hierarchy, plus the homepage.
- Loads fast, works offline-friendly where feasible, and requires no sign-up, no email, no payment.

**Positioning / one-line pitch:** "Free, private, browser-only tools for creators, students, and developers — nothing you upload ever leaves your device."

**Business model note for the agent:** no accounts, no server costs beyond static hosting/CDN — this keeps the app deployable as a fully static export, which is both cheap to run and ideal for SEO (fast Time-to-First-Byte, trivial CDN caching, no server cold starts).

---

## 2. Tech Stack Decision

**Use Next.js 14+ (App Router) with static export**, not plain HTML/CSS/JS, and not a server-rendered Next.js deployment. Rationale for the agent:

| Requirement | Why Next.js (App Router, static export) wins |
|---|---|
| ~176 unique indexable URLs, each needing unique `<title>`, `<meta description>`, canonical, Open Graph, JSON-LD | Next.js's file-based routing + `generateMetadata`/static `metadata` export make per-route SEO metadata trivial and type-safe, versus hand-maintaining 176 static HTML files |
| Shared design system / header / footer / nav across 176 pages | React layouts (`layout.tsx`) give one source of truth instead of copy-pasted HTML partials |
| Client-only processing (Canvas API, File API, WASM libs like `pdf-lib`, `pdfjs-dist`, `browser-image-compression`, `qrcode`, `jsbarcode`) | Next.js supports `"use client"` components while still statically prerendering the page shell/SEO content — best of both worlds: crawlable HTML + interactive client tool |
| Automatic sitemap.xml / robots.txt generation from a single tool registry | Next.js App Router supports `app/sitemap.ts` and `app/robots.ts` which can programmatically emit all 176 URLs from one data source (see Section 6) |
| Future growth (site will likely grow past 156 tools) | Adding a tool = adding one data-registry entry + one route folder; the pattern scales cleanly |
| Performance (Core Web Vitals matter for SEO ranking) | Static export ships pure static HTML/CSS/JS to a CDN — no server render cost, near-instant TTFB |

**Deployment target:** static export (`next.config.js` → `output: 'export'`), deployable to any static host/CDN (Cloudflare Pages, Netlify, Vercel static, GitHub Pages + custom domain). Since every tool is client-side JS/WASM, there is no need for Next.js server functions, API routes, edge middleware, or ISR. Confirm no feature you add requires a Node.js server at runtime (dynamic OG image generation via `next/og`, for example, requires a server — if used, pre-render the images at build time instead, or hand-design a small set of static OG templates).

**Do not** introduce a backend database, auth system, or file-upload API. If a future tool seems to need server processing, prefer a WASM/client-side library first; only fall back to a server if genuinely impossible client-side, and flag that as a scope exception rather than silently adding server infrastructure.

### Core libraries (client-side, no server)

- **Images:** Canvas API / `browser-image-compression`, `heic2any` (HEIC decode), native `<canvas>` for resize/crop/rotate/filters, `exifr` (read/strip EXIF)
- **PDF:** `pdf-lib` (create/merge/split/rotate/watermark/page ops), `pdfjs-dist` (render/view/extract text), `jspdf` (images→PDF, generated PDFs like resumes)
- **JSON/YAML/CSV:** native `JSON`, `js-yaml`, `papaparse`
- **Regex/Cron/JWT:** native `RegExp`, `cron-parser` (client-safe subset or hand-rolled), `jose` or hand-rolled base64url decode for JWT (decode only — never send secrets anywhere)
- **QR/Barcode:** `qrcode` (generate), `jsqr` or `@zxing/browser` (scan via camera/file), `jsbarcode` (generate), `@zxing/browser` (scan)
- **Color/CSS generators:** hand-rolled conversion math (HEX/RGB/HSL), no library needed
- **Networking calculators (IPv4/IPv6/CIDR/subnet):** hand-rolled bitwise math, no library needed
- All processing happens in-browser; use Web Workers for heavy operations (large image compression, big PDF merges) to keep the UI thread responsive.

---
## 3. Information Architecture & Folder Structure

Three levels of hierarchy sit under `/tools`, matching the URL structure in Section 4:

```
/                                              → Homepage (landing page)
/tools                                          → All-tools directory / search & browse page
/tools/{category}                               → Category hub page (e.g. /tools/pdf-toolkit)
/tools/{category}/{sub-category}                → Sub-category hub page (e.g. /tools/developer-tools/json)
/tools/{category}/{sub-category}/{tool-slug}    → Individual tool page (the actual working tool)
/tools/{category}/{tool-slug}                   → For categories with no sub-category (PDF Toolkit only)
```

5 categories, 15 sub-categories (PDF Toolkit has none — it's a flat list), 156 tools. Full list with exact slugs is in **Section 5 — Full Tool Catalog**.

### Recommended Next.js App Router folder structure

```
app/
  layout.tsx                      → root layout: <html>, global <head> defaults, fonts, ThemeProvider
  page.tsx                        → homepage
  globals.css
  sitemap.ts                      → generates sitemap.xml from lib/tool-registry.ts
  robots.ts                       → generates robots.txt
  manifest.ts                     → PWA manifest (optional but recommended)
  tools/
    page.tsx                      → /tools directory page (search + filter across all 156)
    [category]/
      page.tsx                    → category hub — generateStaticParams from registry
      [subcategory]/
        page.tsx                  → sub-category hub — generateStaticParams from registry
        [tool]/
          page.tsx                → individual tool page — generateStaticParams from registry
      [tool]/
        page.tsx                  → for flat categories (pdf-toolkit) — tool page directly under category
  about/page.tsx
  privacy/page.tsx                → REQUIRED — state explicitly that files never leave the browser
  contact/page.tsx
components/
  layout/                         → Header, Footer, Breadcrumbs, MobileNav
  ui/                              → Button, Card, Panel, Dropzone, Tabs, Tooltip, ClayCard (design system primitives)
  tools/                           → shared tool-page shell: FileDropzone, ToolLayout, ResultPanel, FAQAccordion, RelatedTools
  seo/                             → JsonLd, Breadcrumbs schema helper
lib/
  tool-registry.ts                → SINGLE SOURCE OF TRUTH: array of every category/subcategory/tool with slug, title, metaDescription, h1, icon, processingLibs, faq[]
  seo.ts                          → buildMetadata(tool) helper → generates Next Metadata object + JSON-LD
  utils/                          → image, pdf, json, qr, color, network helper functions (pure, client-safe)
public/
  og/                             → static Open Graph images (one per category is enough; tool pages can share a category template with tool name overlaid at build time, or use a single site-wide OG image to start)
  icons/
```

**Critical implementation rule for the agent:** Build `lib/tool-registry.ts` FIRST, before any page. It should be a typed array (see shape below) containing all 156 tools plus the 5 categories and 15 sub-categories. Every page (`[category]/page.tsx`, `[subcategory]/page.tsx`, `[tool]/page.tsx`), `sitemap.ts`, the homepage's "all tools" links, breadcrumbs, and related-tools widgets should all read from this single registry — never hardcode a tool list in more than one place. This is what makes the 156-page site maintainable and keeps SEO metadata consistent.

```ts
// lib/tool-registry.ts (shape — agent should fully populate from Section 5)
export type Tool = {
  slug: string;                // e.g. "instagram-post-size-calculator"
  name: string;                // e.g. "Instagram Post Size Calculator"
  category: string;            // category slug, e.g. "image-social-media-hub"
  subcategory?: string;        // subcategory slug, e.g. "instagram" (omit for flat categories)
  h1: string;                  // on-page H1, usually == name
  title: string;               // <title> tag, ~50-60 chars
  metaDescription: string;     // ~150-160 chars, unique, keyword-rich
  shortDescription: string;    // 1 sentence, used in cards/listings
  keywords: string[];          // 3-6 target keywords for internal use / schema
  icon: string;                // icon identifier (lucide-react icon name or custom svg id)
  faqs: { q: string; a: string }[]; // 3-5 FAQ entries → renders as FAQ schema + accordion
  relatedSlugs: string[];      // 3-6 related tool slugs (same category preferred) for internal linking
};

export type Category = {
  slug: string;
  name: string;
  description: string;
  icon: string;
};

export type Subcategory = {
  slug: string;
  categorySlug: string;
  name: string;
  description: string;
};

export const categories: Category[] = [ /* 5 entries, Section 5 */ ];
export const subcategories: Subcategory[] = [ /* 15 entries, Section 5 */ ];
export const tools: Tool[] = [ /* 156 entries, Section 5 */ ];
```

---

## 4. URL Structure Rules

1. All lowercase, kebab-case, no trailing slash, no query strings for canonical tool identity.
2. `→` in the source tool list always becomes `to` in the slug (e.g. "JPG → PNG" → `jpg-to-png`).
3. Ampersands, slashes, colons, and special characters are removed or replaced with words (e.g. "9:16 Cropper" → `9-16-cropper`... note: numeric leading segments are fine in Next.js route segments; if the agent's stack disallows a leading digit anywhere, prefix contextually, e.g. `instagram-9-16-cropper` — the tool always sits under its parent path, so this is not a real conflict).
4. **The same tool name can legitimately appear in more than one place** in the catalog (e.g. "Image Resizer" exists under both `image-social-media-hub/general` and `image-converter-toolkit/editing`; "JPG to PNG" exists under both `image-social-media-hub/general` and `image-converter-toolkit/conversion`). This is intentional — the two hubs target different search intents ("resize image for instagram" vs. "convert jpg to png"). Give each instance **distinct metadata** (different meta description, different FAQ angle, different related-tools) even when the underlying tool component is shared/reused. Do not `noindex` or canonicalize one to the other — they serve different queries. Do not literally duplicate all body copy; vary the intro paragraph per instance so Google does not flag them as near-duplicate content.
5. Never change a tool's slug after it's been deployed/indexed. If a tool must be renamed, keep the old slug as a 301 redirect (static export: use a `_redirects`/`vercel.json`/`netlify.toml` redirects file, since static hosting has no server-side redirect logic).
6. Canonical URL for every page = `https://alee.software{path}`, no `www`, always `https`.

---

## 5. SEO System

### 5.1 Metadata formula (per tool page)

Give the agent this exact formula to generate all 156 unique meta descriptions and titles — do not write 156 generic templates; vary the verb and value proposition by tool type as shown, and always name the specific platform/format/subject:

**Title tag pattern** (50–60 chars): `{Tool Name} – Free Online {Tool Type} | Alee Tools`
Examples:
- `Instagram Post Size Calculator – Free Tool | Alee Tools`
- `Merge PDF Online Free – No Upload Limits | Alee Tools`
- `JSON Formatter & Validator – Free Online | Alee Tools`

**Meta description pattern** (150–160 chars) — select the template matching the tool's action verb, then customize the `{subject}` and one differentiator:

| Tool type (detect from name) | Template |
|---|---|
| Calculator / Checker | "Calculate {subject} instantly with {Tool Name} — free, accurate, and runs entirely in your browser. No uploads, no sign-up, no watermark." |
| Resizer | "Resize {subject} to the exact size you need with {Tool Name}. Free, fast, and 100% private — your files never leave your device." |
| Compressor | "Compress {subject} online for free with {Tool Name}. Shrink file size in seconds without losing quality — no uploads required." |
| Converter (X → Y) | "Convert {subject} free and instantly with {Tool Name}. Private, browser-based conversion — no uploads, no watermark, no limits." |
| Generator | "Generate {subject} free in seconds with {Tool Name}. No sign-up, no watermark, 100% private — everything runs in your browser." |
| Viewer / Extractor / Decoder | "View and inspect {subject} instantly with {Tool Name} — free, fast, and completely private. Nothing you upload is ever sent to a server." |
| Maker / Splitter / Cropper / Editor | "{Tool Name} lets you {action} {subject} free, right in your browser. No installs, no uploads, no watermark." |

Always end with a private/no-upload trust signal — it is the site's core differentiator against server-based competitors (TinyPNG, iLovePDF, etc.) and directly supports E-E-A-T (trustworthiness) signals Google rewards.

**H1** = the tool name exactly as listed in Section 5's catalog (do not restyle with ALL CAPS or add taglines to the H1 itself — keep it literal and matchable to the search query).

**On-page body content requirement (not just metadata):** every tool page needs at minimum:
1. The working tool UI itself (above the fold).
2. A short (40–80 word) intro paragraph under/beside the H1 explaining what the tool does and who it's for, written in plain language (see frontend-design writing guidance — no filler, active voice).
3. A "How to use" 3–5 step list (also mark up as `HowTo` schema where it fits — see 5.3).
4. 3–5 FAQs pulled from `tool.faqs` in the registry, rendered as a visible accordion AND as `FAQPage` JSON-LD.
5. A "Related tools" section linking 3–6 tools from `tool.relatedSlugs` — this is the internal-linking backbone that spreads PageRank across all 156 pages and keeps crawl depth shallow (every tool should be reachable within 3 clicks of the homepage: home → tools index or category card → tool).

This body content is also what prevents thin-content penalties — a page that is only a file dropzone with no text has a high risk of being filtered from the index as "low value."

### 5.2 Structured data (JSON-LD) — required per page type

- **Every tool page:** `SoftwareApplication` (or `WebApplication`) schema — `applicationCategory: "UtilitiesApplication"`, `operatingSystem: "Any (runs in browser)"`, `offers: { price: "0" }`, plus `FAQPage` schema from the tool's FAQs, plus `BreadcrumbList` schema matching the visible breadcrumb.
- **Homepage:** `WebSite` schema with a `SearchAction` (potentialAction) pointing at `/tools?q={search_term_string}` if the `/tools` page supports a `?q=` query param search — implement client-side search on `/tools` to make this valid.
- **Category & sub-category hub pages:** `CollectionPage` + `BreadcrumbList` schema, `ItemList` listing child tools/subcategories.
- Centralize schema generation in `components/seo/JsonLd.tsx` + `lib/seo.ts`, driven by the same `tool-registry.ts` — never hand-write JSON-LD per page.

### 5.3 `sitemap.ts` and `robots.ts`

Generate programmatically from the registry — do not hand-maintain a static sitemap file.

```ts
// app/sitemap.ts
import { MetadataRoute } from 'next';
import { categories, subcategories, tools } from '@/lib/tool-registry';

const BASE = 'https://alee.software';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ['', '/tools', '/about', '/privacy', '/contact'].map((p) => ({
    url: `${BASE}${p}`,
    changeFrequency: 'weekly' as const,
    priority: p === '' ? 1.0 : 0.7,
  }));

  const categoryPages = categories.map((c) => ({
    url: `${BASE}/tools/${c.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const subcategoryPages = subcategories.map((s) => ({
    url: `${BASE}/tools/${s.categorySlug}/${s.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const toolPages = tools.map((t) => ({
    url: `${BASE}/tools/${t.category}${t.subcategory ? '/' + t.subcategory : ''}/${t.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.9,
    lastModified: new Date(),
  }));

  return [...staticPages, ...categoryPages, ...subcategoryPages, ...toolPages];
}
```

```ts
// app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: 'https://alee.software/sitemap.xml',
    host: 'https://alee.software',
  };
}
```

### 5.4 Other SEO requirements

- Every page sets `<link rel="canonical">` to its own exact URL via Next Metadata API.
- Open Graph + Twitter Card metadata on every page (`og:title`, `og:description`, `og:image`, `og:url`, `twitter:card=summary_large_image`).
- Semantic HTML: one `<h1>` per page, logical `<h2>`/`<h3>` nesting, `<nav aria-label="Breadcrumb">` for breadcrumbs.
- `alt` text on every image, including generated/decorative ones described meaningfully (accessibility + image search SEO).
- Core Web Vitals: lazy-load below-the-fold images, avoid layout shift (reserve space for dropzones/previews), keep JS bundles per-tool code-split (dynamic `import()` per tool component so the homepage doesn't ship pdf-lib + qrcode + heic2any etc. — only the active tool's libs load).
- `lang="en"` on `<html>`; add `hreflang` only if/when localized versions are built (not in v1 scope).
- Submit sitemap to Google Search Console and Bing Webmaster Tools post-launch (note this as a manual post-deploy step, not something the agent can automate).
## 6. Design System — "Soft Workshop" (Minimalist × Claymorphism/Retro)

### 6.1 Design concept

Ground the design in what this product actually is: a **workshop of hand tools**, not a SaaS dashboard. The user opens the site, picks up a specific tool, uses it once, puts it down. That "physical toolbox" idea is the source of the claymorphism direction — soft, puffy, tactile surfaces that look like something you could press — balanced against a minimalist, uncluttered layout so 156 tools never feel overwhelming. The retro accent comes from a warm, slightly saturated palette and rounded geometric shapes reminiscent of late-90s/2000s toy and hardware design (think a physical toolbox, a retro calculator, a label-maker), not from skeuomorphic gradients or drop-shadow-heavy 2013-era UI.

**Do not default to:** warm cream (#F4F1EA) + terracotta (#D97757) serif-headline combo, near-black background with one neon accent, or the generic SaaS card kit (identical rounded cards, one soft grey shadow on everything, gradient-wash decoration). These are the common AI-generated defaults — Alee's palette and shadow system below are deliberately different.

### 6.2 Color tokens

| Token | Hex | Use |
|---|---|---|
| `--clay-base` | `#EDEAE3` | Page background — warm, slightly greige, not stark white |
| `--clay-surface` | `#FBF9F5` | Card/panel surface (slightly lighter than base, creates the "raised clay" effect against the background) |
| `--clay-ink` | `#26241F` | Primary text — warm near-black, not pure black |
| `--clay-ink-soft` | `#615C51` | Secondary text |
| `--accent-primary` | `#3D6B5C` | Primary brand accent — deep pine/teal-green (tool + workshop association, distinct from the common terracotta default) |
| `--accent-secondary` | `#D9822B` | Secondary accent — warm amber/ochre, used sparingly for highlights, active states, category #2 |
| `--accent-tertiary` | `#B24C3A` | Tertiary accent — brick red, used for a 3rd category color and destructive/reset actions |
| `--accent-quaternary` | `#3A6EA5` | 4th category color — dusty blue, developer tools |
| `--accent-quinary` | `#7A5C99` | 5th category color — muted plum, QR/barcode tools |
| `--clay-border` | `#DCD6C9` | Hairline borders on surfaces |

Each of the 5 tool categories is assigned one accent color (green, amber, brick, blue, plum) used consistently for that category's icon background, hub-page accent, and tool-page icon chip — this becomes a wayfinding device: users learn "blue = developer tools" the way a physical toolbox uses colored trays.

### 6.3 Typography

- **Display/headline face:** a rounded-geometric sans with some personality and weight contrast — e.g. **Fredoka** or **Space Grotesk** for headlines (Space Grotesk preferred: geometric but not toy-ish, pairs with the retro-but-serious tone; use Fredoka only for playful homepage hero numerals if a rounder feel is wanted). Weight 600–700 for H1/H2.
- **Body/UI face:** **Inter** or **IBM Plex Sans** for body copy, form labels, and tool UI — highly legible at small sizes, standard for 156 dense utility pages.
- **Monospace (used ONLY where semantically correct — JSON/code output, timestamps, hex/color values, regex, cron expressions):** **IBM Plex Mono** or **JetBrains Mono**. Do not apply monospace to generic labels or metadata as decoration — reserve it for actual code/data values, per the "no monospace as decoration" anti-pattern.
- Type scale (rem, base 16px): H1 `2.5–3rem` / H2 `1.75rem` / H3 `1.25rem` / body `1rem` / small `0.875rem`. Line length for body copy under 75 characters.

### 6.4 The claymorphism component language

Define one consistent "clay" shadow/surface system and apply it deliberately, not on every element:

```css
.clay-surface {
  background: var(--clay-surface);
  border-radius: 20px;
  box-shadow:
    -6px -6px 14px rgba(255, 255, 255, 0.7),
     8px 8px 18px rgba(38, 36, 31, 0.12);
  border: 1px solid rgba(255,255,255,0.4);
}

.clay-surface--pressed {
  box-shadow:
    inset -4px -4px 10px rgba(255,255,255,0.6),
    inset 4px 4px 10px rgba(38,36,31,0.12);
}

.clay-button {
  border-radius: 14px;
  box-shadow: 4px 4px 10px rgba(38,36,31,0.15), -3px -3px 8px rgba(255,255,255,0.6);
  transition: box-shadow 120ms ease, transform 120ms ease;
}
.clay-button:active {
  box-shadow: inset 2px 2px 6px rgba(38,36,31,0.2), inset -2px -2px 6px rgba(255,255,255,0.5);
  transform: translateY(1px);
}
```

**Rules of restraint (critical — this is what separates it from a generic claymorphism template):**
- Only 3 border-radius sizes exist in the whole system: `10px` (small chips/badges), `14px` (buttons/inputs), `20px` (cards/panels). Never an arbitrary 4th value.
- The dual-shadow "clay" effect is reserved for **interactive surfaces**: buttons, the file dropzone, active tool panels, category cards. Static content blocks (paragraphs, FAQ text, footer) stay flat with no shadow — this is the minimalist half of the hybrid, and it's what keeps 156 tool pages from feeling like visual noise.
- Never combine the clay shadow with a colored gradient wash — the light-source-based dual shadow is the whole effect; adding gradients on top reads as generic SaaS decoration.
- Category accent colors appear as solid fills (icon chips, active tab underline, link hover) — never as gradients.

### 6.5 Layout principles

- **Homepage:** center-aligned hero, then left-aligned/grid content below. Generous whitespace between sections (not dense).
- **Category/sub-category hub pages:** left-aligned page header (breadcrumb → H1 → intro paragraph), then a responsive grid of clay-surface tool cards (3–4 columns desktop, 2 tablet, 1 mobile).
- **Tool pages:** two-zone layout — the tool UI itself (dropzone/input + controls + output) takes visual priority in a clay-surface panel near the top; supporting SEO content (intro, how-to, FAQ, related tools) flows below in a flatter, minimalist reading layout. This satisfies both the user (fast access to the tool) and search engines (substantial indexable text content).
- Sticky, slim category-colored top utility bar is optional; primary nav should stay lightweight (logo, "Browse Tools" mega-menu or link to `/tools`, search, theme toggle) since the real navigation depth lives in the tools directory, not the header.
- Respect `prefers-reduced-motion`; keep motion to purposeful moments (a tool completing processing, a copy-to-clipboard confirmation, the mobile menu opening) — not scroll-triggered fade-ins on every card.

### 6.6 Iconography

Use a single consistent icon set (`lucide-react` is a solid, easy default for an AI agent to implement) at consistent stroke width. Each tool in the registry has an assigned icon name. Category icon chips use the clay-surface treatment with the category's accent color as background and a white/cream icon.

---

## 7. Homepage Specification

The homepage's job: instantly communicate "free, private, no-signup toolbox" and route the visitor to one of 5 categories or directly into search/browse — in under 2 clicks.

**Section-by-section spec (agent should write actual on-brand copy, not lorem ipsum, following the frontend-design writing guidance — plain, active-voice, user-perspective language):**

1. **Header/nav:** Logo ("alee"), primary link to `/tools`, a prominent search input (client-side fuzzy search across all 156 tool names — instant dropdown results linking straight to tool pages), theme toggle (light/dark — clay system should have a defined dark-mode token set), no accounts/login (there are none).

2. **Hero:** Not the generic "big number + gradient" default. Lead with the concrete, characteristic thing about this product: a short, honest headline stating what it is ("A toolbox of small, fast tools that never leave your browser" or similar — agent to refine voice), a one-sentence subhead reinforcing the privacy/no-signup angle, the search bar repeated/prominent here, and 5 clay-surface category chips (color-coded per Section 6.2) as the primary hero CTA row — this doubles as the primary above-the-fold internal link set for crawlers.

3. **Category grid:** All 5 categories as larger clay-surface cards: icon, name, 1-sentence description, tool count ("26 tools"), linking to the category hub. This is both a user-navigation element and a strong internal-linking SEO block.

4. **"Popular tools" strip:** A curated, hand-picked list of ~10–12 high-search-volume tools across categories (e.g. Merge PDF, Image Compressor, QR Code Generator, JSON Formatter, Instagram Post Size Calculator) as compact clay chips/pills — gives the homepage direct links to the site's highest-value pages 1 click deep.

5. **"Why alee" / trust section:** 3–4 short value props as flat (non-clay) minimal cards: "Nothing you upload leaves your device," "No sign-up, no email, no watermark," "Free, forever," "Works offline once loaded" (if a PWA/service-worker is implemented). Keep this honest and specific — no generic marketing fluff.

6. **How it works:** A simple 3-step visual (Pick a tool → Drop your file or paste your data → Get your result) — only use numbered steps here since it genuinely is a sequence (per frontend-design guidance on when numbering is appropriate).

7. **Footer:** Full sitemap-style link block organized by the 5 categories (every category + subcategory linked — this is a major internal-linking and crawlability asset, effectively a visible HTML sitemap), plus About/Privacy/Contact, plus a note that Alee is independent and not affiliated with Instagram/YouTube/TikTok/etc. (important given platform-name usage throughout the tool catalog).

Apply the same hybrid clay/minimal treatment to category hub pages (Section 6.5) and give each a unique intro paragraph (not a templated stub) describing that category's tools and who uses them, to avoid thin/duplicate content across 5 hub + 15 sub-hub pages.

---

## 8. Individual Tool Page Template

Every one of the 156 tool pages should be generated from a single shared page template/component (`components/tools/ToolPageShell.tsx`) that takes the tool's registry entry + a tool-specific interactive component as children, so structure and SEO scaffolding stay perfectly consistent while the actual tool logic varies.

**Template structure (top to bottom):**

1. `<Breadcrumbs>` — Home / Category / Subcategory / Tool Name, with `BreadcrumbList` JSON-LD.
2. `<h1>` = tool name, plus the 40–80 word intro paragraph directly beneath it.
3. **Tool panel** (clay-surface): the actual functional UI — file dropzone or input fields, options/controls, a clear primary action button, and the result/output area with a download/copy action. Show inline validation and errors in plain language ("This file is too large — try a file under 25MB" rather than a raw exception).
4. Trust microcopy directly under the tool panel: "Processed entirely in your browser — this file is never uploaded to a server."
5. "How to use `{Tool Name}`" — numbered 3–5 step list.
6. Optional tool-specific reference content where relevant (e.g. the Instagram Post Size Calculator page should show the actual current Instagram dimension specs in a small table — this is exactly the kind of specific, useful, non-generic content that earns rankings and answers the query directly on-page).
7. FAQ accordion (3–5 Qs from the registry) + `FAQPage` JSON-LD.
8. "Related tools" card row (3–6 tools from `relatedSlugs`).
9. Standard footer.

**Performance rule:** the tool-specific interactive component (and its heavy dependency, e.g. `pdf-lib` or `heic2any`) must be loaded via `next/dynamic` with `ssr: false` and no eager import from the shared shell, so visiting one tool page never downloads another tool's processing library.

**Privacy/UX rule:** every tool that accepts a file must process it fully client-side and must never call `fetch`/`XMLHttpRequest` to send file contents anywhere. State this plainly on `/privacy` and reference it in tool-page trust microcopy — this is the site's core credibility claim and must be true in the implementation, not just the marketing copy.
## 9. Build Order (recommended sequence for the AI agent)

1. Scaffold Next.js 14+ App Router project, TypeScript, Tailwind CSS (Tailwind pairs well with the token-based clay system — define the tokens in `tailwind.config.ts` `theme.extend.colors`/`boxShadow`), `output: 'export'` in `next.config.js`.
2. Build `lib/tool-registry.ts` fully populated with all 5 categories, 15 subcategories, and 156 tools (see Section 10 catalog — use it as the authoritative slug/URL source; write full metaDescription/faqs/relatedSlugs for each entry following the Section 5.1 formula).
3. Build the design system: Tailwind tokens, `components/ui/` primitives (ClayCard, ClayButton, Chip, Breadcrumbs, Accordion, SearchInput, Tabs), dark mode tokens.
4. Build shared layout: `app/layout.tsx`, Header (with client-side fuzzy search — e.g. a small in-memory Fuse.js index over the registry), Footer (full sitemap link block from registry), MobileNav.
5. Build `app/sitemap.ts` and `app/robots.ts` from the registry (Section 5.3) — do this early so every subsequent page you add is automatically covered.
6. Build the homepage (`app/page.tsx`) per Section 7.
7. Build `app/tools/page.tsx` — the all-tools directory with client-side search + category filter chips, rendering from the registry.
8. Build `app/tools/[category]/page.tsx` (category hub) and `app/tools/[category]/[subcategory]/page.tsx` (sub-category hub) — both driven by `generateStaticParams()` from the registry, both using the shared hub-page layout described in Section 6.5/7.
9. Build `components/tools/ToolPageShell.tsx` (Section 8) and `app/tools/[category]/[subcategory]/[tool]/page.tsx` + the flat-category variant `app/tools/[category]/[tool]/page.tsx` for `pdf-toolkit`, using `generateStaticParams()` + `generateMetadata()` from the registry.
10. Implement tool logic in priority order — build the highest-search-volume / simplest-to-implement tools first to get real pages live, then fill in the rest:
    - **Wave 1 (simple, high value):** Image Compressor, Image Resizer, JPG↔PNG↔WebP converters, QR Code Generator, Password Generator, UUID Generator, JSON Formatter/Validator/Minifier, Base64 Encoder/Decoder, Color Converter/HEX↔RGB, Instagram/YouTube size calculators (pure lookup-table math, no file processing needed).
    - **Wave 2 (PDF core):** Merge PDF, Split PDF, PDF Compressor, Images→PDF, PDF→JPG, PDF Rotator, PDF Watermark.
    - **Wave 3 (remaining developer tools):** regex tester, cron tools, JWT decoder, networking calculators, CSS generators.
    - **Wave 4 (remaining image editing, EXIF, HEIC, barcode, remaining platform-specific tools, grid/splitter tools).**
    - Many tool "instances" reuse the same underlying component (e.g. all resize/compress/convert tools share a generic image-processing engine parameterized by target format/dimensions) — build 4–6 generic engines (Image engine, PDF engine, JSON/text engine, QR/Barcode engine, Networking/Calculator engine, Generator engine) rather than 156 bespoke implementations.
11. Add JSON-LD (Section 5.2) across all page types.
12. Add PWA manifest + service worker for offline-after-first-load (optional but strengthens the "works offline" trust claim).
13. Accessibility pass: keyboard navigation through every tool, visible focus states on clay buttons (don't lose focus rings to custom shadow styling), color-contrast check on all 5 accent colors against both surface tones, screen-reader labels on icon-only buttons.
14. Performance pass: Lighthouse on homepage + one tool page from each category, code-splitting check (confirm no cross-tool bundle bleed), image optimization for any static marketing imagery.
15. Final SEO QA (Section 11 checklist) before deploy.

---

## 10. Deployment

1. `next.config.js`: `output: 'export'`, `images: { unoptimized: true }` (static export can't use the Next.js image optimization server — either pre-optimize marketing images at build time or use a CDN-based image service for the handful of static site images; this does not affect user-uploaded content, which never touches `next/image`).
2. Build: `next build` → static output in `out/`.
3. Host on any static/CDN platform pointed at `alee.software`: Cloudflare Pages, Netlify, or Vercel (static mode). Cloudflare Pages is a strong default (generous free tier, fast global CDN, easy custom-domain + HTTPS setup, matches the "no server cost" model).
4. DNS: point `alee.software` (apex) and optionally `www.alee.software` (redirect to apex) at the host; enforce HTTPS; set the canonical host (apex, no `www`, per Section 4) at the DNS/redirect level, not just via `<link rel=canonical>`.
5. Post-deploy manual steps (agent should list these for the human, not attempt them): submit `sitemap.xml` to Google Search Console and Bing Webmaster Tools; verify domain ownership; request indexing for the homepage and a few key category pages to bootstrap crawl.

---

## 11. Pre-Launch SEO/Quality Checklist

- [ ] All 156 tool pages + 5 category hubs + 15 sub-category hubs + homepage + `/tools` + `/about` + `/privacy` + `/contact` return 200 and are listed in `sitemap.xml`
- [ ] No two pages share an identical `<title>` or meta description
- [ ] Every page has exactly one `<h1>`
- [ ] Every tool page has working FAQ + BreadcrumbList + SoftwareApplication JSON-LD (validate with Google's Rich Results Test)
- [ ] Every image has meaningful `alt` text
- [ ] `robots.txt` allows all crawlers and references the correct sitemap URL
- [ ] No tool ever makes a network request with user file/data content (manually audit each processing engine)
- [ ] `/privacy` page explicitly and accurately describes the client-side-only processing model
- [ ] Mobile layout tested for all 5 category color themes and at least one tool page per category
- [ ] Lighthouse SEO score ≥ 95, Performance ≥ 90 on homepage and a representative tool page
- [ ] Internal links: every tool reachable within 3 clicks from homepage; footer sitemap links to every category and subcategory
- [ ] 404 page exists and is on-brand (clay style), links back to `/tools`

---

## 12. Full Tool Catalog (Authoritative Source for `lib/tool-registry.ts`)

5 categories, 15 subcategories, 156 tools. Category slug is always the first path segment after `/tools/`; subcategory (where present) is the second; tool slug is last. `pdf-toolkit` has no subcategories — its tools sit directly at `/tools/pdf-toolkit/{tool-slug}`.

### Category index

| # | Category | Slug | Hub URL | Sub-categories |
|---|---|---|---|---|
| 1 | Image & Social Media Utility Hub | `image-social-media-hub` | `/tools/image-social-media-hub` | Instagram, YouTube, TikTok, General |
| 2 | PDF Student/Office Toolkit | `pdf-toolkit` | `/tools/pdf-toolkit` | — (flat) |
| 3 | Developer Tools | `developer-tools` | `/tools/developer-tools` | JSON, Web, Developer, Networking |
| 4 | Image → Everything Toolkit | `image-converter-toolkit` | `/tools/image-converter-toolkit` | Conversion, Compression, Editing |
| 5 | QR & Barcode Tools | `qr-barcode-tools` | `/tools/qr-barcode-tools` | QR Codes, Barcodes |

**Note on overlap:** categories 1 and 4 intentionally share several tool concepts (Image Compressor, Image Resizer, JPG↔PNG↔WebP, etc.) under different framing — category 1's "General" sub-hub frames them for social-media prep, category 4 frames them as a general-purpose converter suite. Build one shared image-processing engine and mount it at both URLs with distinct metadata/copy per Section 4, rule 4.


#### `image-social-media-hub` — Image & Social Media Utility Hub

Category hub URL: `/tools/image-social-media-hub`


**Sub-hub `instagram` — Instagram Tools** — URL: `/tools/image-social-media-hub/instagram`

| Tool Name | URL | Suggested H1 |
|---|---|---|
| Instagram Post Size Calculator | `/tools/image-social-media-hub/instagram/instagram-post-size-calculator` | Instagram Post Size Calculator |
| Instagram Story Size Calculator | `/tools/image-social-media-hub/instagram/instagram-story-size-calculator` | Instagram Story Size Calculator |
| Instagram Reel Size Checker | `/tools/image-social-media-hub/instagram/instagram-reel-size-checker` | Instagram Reel Size Checker |
| Instagram Profile Picture Resizer | `/tools/image-social-media-hub/instagram/instagram-profile-picture-resizer` | Instagram Profile Picture Resizer |
| Instagram Image Compressor | `/tools/image-social-media-hub/instagram/instagram-image-compressor` | Instagram Image Compressor |
| Instagram Thumbnail Downloader | `/tools/image-social-media-hub/instagram/instagram-thumbnail-downloader` | Instagram Thumbnail Downloader |
| Instagram Grid Maker | `/tools/image-social-media-hub/instagram/instagram-grid-maker` | Instagram Grid Maker |
| Instagram 3x3 Grid Splitter | `/tools/image-social-media-hub/instagram/instagram-3x3-grid-splitter` | Instagram 3x3 Grid Splitter |
| Instagram 9:16 Cropper | `/tools/image-social-media-hub/instagram/instagram-916-cropper` | Instagram 9:16 Cropper |


**Sub-hub `youtube` — YouTube Tools** — URL: `/tools/image-social-media-hub/youtube`

| Tool Name | URL | Suggested H1 |
|---|---|---|
| YouTube Thumbnail Resizer | `/tools/image-social-media-hub/youtube/youtube-thumbnail-resizer` | YouTube Thumbnail Resizer |
| YouTube Thumbnail Compressor | `/tools/image-social-media-hub/youtube/youtube-thumbnail-compressor` | YouTube Thumbnail Compressor |
| YouTube Banner Maker | `/tools/image-social-media-hub/youtube/youtube-banner-maker` | YouTube Banner Maker |
| YouTube Profile Picture Resizer | `/tools/image-social-media-hub/youtube/youtube-profile-picture-resizer` | YouTube Profile Picture Resizer |
| YouTube Shorts Size Calculator | `/tools/image-social-media-hub/youtube/youtube-shorts-size-calculator` | YouTube Shorts Size Calculator |
| YouTube Thumbnail Preview | `/tools/image-social-media-hub/youtube/youtube-thumbnail-preview` | YouTube Thumbnail Preview |
| YouTube Timestamp Generator | `/tools/image-social-media-hub/youtube/youtube-timestamp-generator` | YouTube Timestamp Generator |


**Sub-hub `tiktok` — TikTok Tools** — URL: `/tools/image-social-media-hub/tiktok`

| Tool Name | URL | Suggested H1 |
|---|---|---|
| TikTok Video Size Checker | `/tools/image-social-media-hub/tiktok/tiktok-video-size-checker` | TikTok Video Size Checker |
| TikTok Profile Picture Resizer | `/tools/image-social-media-hub/tiktok/tiktok-profile-picture-resizer` | TikTok Profile Picture Resizer |
| TikTok Thumbnail Maker | `/tools/image-social-media-hub/tiktok/tiktok-thumbnail-maker` | TikTok Thumbnail Maker |
| TikTok Video Compressor | `/tools/image-social-media-hub/tiktok/tiktok-video-compressor` | TikTok Video Compressor |


**Sub-hub `general` — General Image Tools** — URL: `/tools/image-social-media-hub/general`

| Tool Name | URL | Suggested H1 |
|---|---|---|
| Image Compressor | `/tools/image-social-media-hub/general/image-compressor` | Image Compressor |
| Image Resizer | `/tools/image-social-media-hub/general/image-resizer` | Image Resizer |
| Image Cropper | `/tools/image-social-media-hub/general/image-cropper` | Image Cropper |
| JPG to PNG | `/tools/image-social-media-hub/general/jpg-to-png` | JPG to PNG |
| PNG to JPG | `/tools/image-social-media-hub/general/png-to-jpg` | PNG to JPG |
| WebP to JPG | `/tools/image-social-media-hub/general/webp-to-jpg` | WebP to JPG |
| WebP to PNG | `/tools/image-social-media-hub/general/webp-to-png` | WebP to PNG |
| Image to WebP | `/tools/image-social-media-hub/general/image-to-webp` | Image to WebP |
| Image Metadata Viewer | `/tools/image-social-media-hub/general/image-metadata-viewer` | Image Metadata Viewer |
| EXIF Remover | `/tools/image-social-media-hub/general/exif-remover` | EXIF Remover |
| Image DPI Calculator | `/tools/image-social-media-hub/general/image-dpi-calculator` | Image DPI Calculator |
| Aspect Ratio Calculator | `/tools/image-social-media-hub/general/aspect-ratio-calculator` | Aspect Ratio Calculator |
| Image Pixel Calculator | `/tools/image-social-media-hub/general/image-pixel-calculator` | Image Pixel Calculator |
| Image Color Picker | `/tools/image-social-media-hub/general/image-color-picker` | Image Color Picker |


#### `pdf-toolkit` — PDF Student/Office Toolkit

Category hub URL: `/tools/pdf-toolkit`

| Tool Name | URL | Suggested H1 |
|---|---|---|
| Merge PDF | `/tools/pdf-toolkit/merge-pdf` | Merge PDF |
| Split PDF | `/tools/pdf-toolkit/split-pdf` | Split PDF |
| PDF Page Extractor | `/tools/pdf-toolkit/pdf-page-extractor` | PDF Page Extractor |
| PDF Page Deleter | `/tools/pdf-toolkit/pdf-page-deleter` | PDF Page Deleter |
| PDF Rotator | `/tools/pdf-toolkit/pdf-rotator` | PDF Rotator |
| PDF Reorder | `/tools/pdf-toolkit/pdf-reorder` | PDF Reorder |
| PDF Compressor | `/tools/pdf-toolkit/pdf-compressor` | PDF Compressor |
| PDF to JPG | `/tools/pdf-toolkit/pdf-to-jpg` | PDF to JPG |
| JPG to PDF | `/tools/pdf-toolkit/jpg-to-pdf` | JPG to PDF |
| PNG to PDF | `/tools/pdf-toolkit/png-to-pdf` | PNG to PDF |
| Images to PDF | `/tools/pdf-toolkit/images-to-pdf` | Images to PDF |
| PDF Metadata Viewer | `/tools/pdf-toolkit/pdf-metadata-viewer` | PDF Metadata Viewer |
| PDF Password Generator | `/tools/pdf-toolkit/pdf-password-generator` | PDF Password Generator |
| PDF Unlocker | `/tools/pdf-toolkit/pdf-unlocker` | PDF Unlocker |
| PDF Page Numberer | `/tools/pdf-toolkit/pdf-page-numberer` | PDF Page Numberer |
| PDF Watermark | `/tools/pdf-toolkit/pdf-watermark` | PDF Watermark |
| PDF Text Extractor | `/tools/pdf-toolkit/pdf-text-extractor` | PDF Text Extractor |
| PDF Viewer | `/tools/pdf-toolkit/pdf-viewer` | PDF Viewer |
| PDF Print Optimizer | `/tools/pdf-toolkit/pdf-print-optimizer` | PDF Print Optimizer |
| A4 PDF Maker | `/tools/pdf-toolkit/a4-pdf-maker` | A4 PDF Maker |
| Letter PDF Maker | `/tools/pdf-toolkit/letter-pdf-maker` | Letter PDF Maker |
| Resume PDF Maker | `/tools/pdf-toolkit/resume-pdf-maker` | Resume PDF Maker |
| Assignment PDF Maker | `/tools/pdf-toolkit/assignment-pdf-maker` | Assignment PDF Maker |
| Notes to PDF | `/tools/pdf-toolkit/notes-to-pdf` | Notes to PDF |
| Images to A4 PDF | `/tools/pdf-toolkit/images-to-a4-pdf` | Images to A4 PDF |
| Scan to PDF | `/tools/pdf-toolkit/scan-to-pdf` | Scan to PDF |


#### `developer-tools` — Developer Tools

Category hub URL: `/tools/developer-tools`


**Sub-hub `json` — JSON Tools** — URL: `/tools/developer-tools/json`

| Tool Name | URL | Suggested H1 |
|---|---|---|
| JSON Formatter | `/tools/developer-tools/json/json-formatter` | JSON Formatter |
| JSON Minifier | `/tools/developer-tools/json/json-minifier` | JSON Minifier |
| JSON Validator | `/tools/developer-tools/json/json-validator` | JSON Validator |
| JSON Viewer | `/tools/developer-tools/json/json-viewer` | JSON Viewer |
| JSON Tree Viewer | `/tools/developer-tools/json/json-tree-viewer` | JSON Tree Viewer |
| JSON to CSV | `/tools/developer-tools/json/json-to-csv` | JSON to CSV |
| CSV to JSON | `/tools/developer-tools/json/csv-to-json` | CSV to JSON |
| JSON to YAML | `/tools/developer-tools/json/json-to-yaml` | JSON to YAML |
| YAML to JSON | `/tools/developer-tools/json/yaml-to-json` | YAML to JSON |
| JSON Diff | `/tools/developer-tools/json/json-diff` | JSON Diff |
| JSON Escape | `/tools/developer-tools/json/json-escape` | JSON Escape |
| JSON Unescape | `/tools/developer-tools/json/json-unescape` | JSON Unescape |


**Sub-hub `web` — Web Encoding Tools** — URL: `/tools/developer-tools/web`

| Tool Name | URL | Suggested H1 |
|---|---|---|
| URL Encoder | `/tools/developer-tools/web/url-encoder` | URL Encoder |
| URL Decoder | `/tools/developer-tools/web/url-decoder` | URL Decoder |
| HTML Encoder | `/tools/developer-tools/web/html-encoder` | HTML Encoder |
| HTML Decoder | `/tools/developer-tools/web/html-decoder` | HTML Decoder |
| Base64 Encoder | `/tools/developer-tools/web/base64-encoder` | Base64 Encoder |
| Base64 Decoder | `/tools/developer-tools/web/base64-decoder` | Base64 Decoder |
| HTML Minifier | `/tools/developer-tools/web/html-minifier` | HTML Minifier |
| CSS Minifier | `/tools/developer-tools/web/css-minifier` | CSS Minifier |
| JS Minifier | `/tools/developer-tools/web/js-minifier` | JS Minifier |
| CSS Formatter | `/tools/developer-tools/web/css-formatter` | CSS Formatter |
| HTML Formatter | `/tools/developer-tools/web/html-formatter` | HTML Formatter |
| JS Formatter | `/tools/developer-tools/web/js-formatter` | JS Formatter |


**Sub-hub `developer` — Developer Utilities** — URL: `/tools/developer-tools/developer`

| Tool Name | URL | Suggested H1 |
|---|---|---|
| UUID Generator | `/tools/developer-tools/developer/uuid-generator` | UUID Generator |
| GUID Generator | `/tools/developer-tools/developer/guid-generator` | GUID Generator |
| Password Generator | `/tools/developer-tools/developer/password-generator` | Password Generator |
| JWT Decoder | `/tools/developer-tools/developer/jwt-decoder` | JWT Decoder |
| JWT Generator | `/tools/developer-tools/developer/jwt-generator` | JWT Generator |
| Regex Tester | `/tools/developer-tools/developer/regex-tester` | Regex Tester |
| Regex Generator | `/tools/developer-tools/developer/regex-generator` | Regex Generator |
| Cron Expression Generator | `/tools/developer-tools/developer/cron-expression-generator` | Cron Expression Generator |
| Cron Expression Translator | `/tools/developer-tools/developer/cron-expression-translator` | Cron Expression Translator |
| Unix Timestamp Converter | `/tools/developer-tools/developer/unix-timestamp-converter` | Unix Timestamp Converter |
| Unix Timestamp Generator | `/tools/developer-tools/developer/unix-timestamp-generator` | Unix Timestamp Generator |
| Timestamp to Date | `/tools/developer-tools/developer/timestamp-to-date` | Timestamp to Date |
| Color Converter | `/tools/developer-tools/developer/color-converter` | Color Converter |
| HEX to RGB | `/tools/developer-tools/developer/hex-to-rgb` | HEX to RGB |
| RGB to HEX | `/tools/developer-tools/developer/rgb-to-hex` | RGB to HEX |
| HEX to HSL | `/tools/developer-tools/developer/hex-to-hsl` | HEX to HSL |
| CSS Gradient Generator | `/tools/developer-tools/developer/css-gradient-generator` | CSS Gradient Generator |
| CSS Box Shadow Generator | `/tools/developer-tools/developer/css-box-shadow-generator` | CSS Box Shadow Generator |
| CSS Border Radius Generator | `/tools/developer-tools/developer/css-border-radius-generator` | CSS Border Radius Generator |


**Sub-hub `networking` — Networking Tools** — URL: `/tools/developer-tools/networking`

| Tool Name | URL | Suggested H1 |
|---|---|---|
| IPv4 Calculator | `/tools/developer-tools/networking/ipv4-calculator` | IPv4 Calculator |
| IPv6 Calculator | `/tools/developer-tools/networking/ipv6-calculator` | IPv6 Calculator |
| CIDR Calculator | `/tools/developer-tools/networking/cidr-calculator` | CIDR Calculator |
| Subnet Calculator | `/tools/developer-tools/networking/subnet-calculator` | Subnet Calculator |
| IP to Binary | `/tools/developer-tools/networking/ip-to-binary` | IP to Binary |
| Binary to Decimal | `/tools/developer-tools/networking/binary-to-decimal` | Binary to Decimal |
| MAC Address Generator | `/tools/developer-tools/networking/mac-address-generator` | MAC Address Generator |
| User-Agent Parser | `/tools/developer-tools/networking/user-agent-parser` | User-Agent Parser |


#### `image-converter-toolkit` — Image to Everything Toolkit

Category hub URL: `/tools/image-converter-toolkit`


**Sub-hub `conversion` — Image Conversion** — URL: `/tools/image-converter-toolkit/conversion`

| Tool Name | URL | Suggested H1 |
|---|---|---|
| JPG to PNG | `/tools/image-converter-toolkit/conversion/jpg-to-png` | JPG to PNG |
| PNG to JPG | `/tools/image-converter-toolkit/conversion/png-to-jpg` | PNG to JPG |
| JPG to WebP | `/tools/image-converter-toolkit/conversion/jpg-to-webp` | JPG to WebP |
| PNG to WebP | `/tools/image-converter-toolkit/conversion/png-to-webp` | PNG to WebP |
| WebP to JPG | `/tools/image-converter-toolkit/conversion/webp-to-jpg` | WebP to JPG |
| WebP to PNG | `/tools/image-converter-toolkit/conversion/webp-to-png` | WebP to PNG |
| HEIC to JPG | `/tools/image-converter-toolkit/conversion/heic-to-jpg` | HEIC to JPG |
| HEIC to PNG | `/tools/image-converter-toolkit/conversion/heic-to-png` | HEIC to PNG |
| SVG to PNG | `/tools/image-converter-toolkit/conversion/svg-to-png` | SVG to PNG |
| BMP to JPG | `/tools/image-converter-toolkit/conversion/bmp-to-jpg` | BMP to JPG |
| GIF to JPG | `/tools/image-converter-toolkit/conversion/gif-to-jpg` | GIF to JPG |


**Sub-hub `compression` — Image Compression** — URL: `/tools/image-converter-toolkit/compression`

| Tool Name | URL | Suggested H1 |
|---|---|---|
| JPG Compressor | `/tools/image-converter-toolkit/compression/jpg-compressor` | JPG Compressor |
| PNG Compressor | `/tools/image-converter-toolkit/compression/png-compressor` | PNG Compressor |
| WebP Compressor | `/tools/image-converter-toolkit/compression/webp-compressor` | WebP Compressor |
| HEIC Compressor | `/tools/image-converter-toolkit/compression/heic-compressor` | HEIC Compressor |


**Sub-hub `editing` — Image Editing** — URL: `/tools/image-converter-toolkit/editing`

| Tool Name | URL | Suggested H1 |
|---|---|---|
| Image Resizer | `/tools/image-converter-toolkit/editing/image-resizer` | Image Resizer |
| Image Cropper | `/tools/image-converter-toolkit/editing/image-cropper` | Image Cropper |
| Image Rotator | `/tools/image-converter-toolkit/editing/image-rotator` | Image Rotator |
| Image Flipper | `/tools/image-converter-toolkit/editing/image-flipper` | Image Flipper |
| Image Background Blur | `/tools/image-converter-toolkit/editing/image-background-blur` | Image Background Blur |
| Image Pixelate | `/tools/image-converter-toolkit/editing/image-pixelate` | Image Pixelate |
| Image Grayscale | `/tools/image-converter-toolkit/editing/image-grayscale` | Image Grayscale |
| Image Brightness | `/tools/image-converter-toolkit/editing/image-brightness` | Image Brightness |
| Image Contrast | `/tools/image-converter-toolkit/editing/image-contrast` | Image Contrast |
| Image Sharpen | `/tools/image-converter-toolkit/editing/image-sharpen` | Image Sharpen |
| Image Watermark | `/tools/image-converter-toolkit/editing/image-watermark` | Image Watermark |


#### `qr-barcode-tools` — QR & Barcode Tools

Category hub URL: `/tools/qr-barcode-tools`


**Sub-hub `qr-codes` — QR Code Tools** — URL: `/tools/qr-barcode-tools/qr-codes`

| Tool Name | URL | Suggested H1 |
|---|---|---|
| QR Code Generator | `/tools/qr-barcode-tools/qr-codes/qr-code-generator` | QR Code Generator |
| QR Code Scanner | `/tools/qr-barcode-tools/qr-codes/qr-code-scanner` | QR Code Scanner |
| URL QR | `/tools/qr-barcode-tools/qr-codes/url-qr` | URL QR |
| Wi-Fi QR | `/tools/qr-barcode-tools/qr-codes/wi-fi-qr` | Wi-Fi QR |
| Text QR | `/tools/qr-barcode-tools/qr-codes/text-qr` | Text QR |
| Email QR | `/tools/qr-barcode-tools/qr-codes/email-qr` | Email QR |
| Phone QR | `/tools/qr-barcode-tools/qr-codes/phone-qr` | Phone QR |
| WhatsApp QR | `/tools/qr-barcode-tools/qr-codes/whatsapp-qr` | WhatsApp QR |
| vCard QR | `/tools/qr-barcode-tools/qr-codes/vcard-qr` | vCard QR |
| Location QR | `/tools/qr-barcode-tools/qr-codes/location-qr` | Location QR |
| SMS QR | `/tools/qr-barcode-tools/qr-codes/sms-qr` | SMS QR |
| Bitcoin QR | `/tools/qr-barcode-tools/qr-codes/bitcoin-qr` | Bitcoin QR |


**Sub-hub `barcodes` — Barcode Tools** — URL: `/tools/qr-barcode-tools/barcodes`

| Tool Name | URL | Suggested H1 |
|---|---|---|
| Barcode Generator | `/tools/qr-barcode-tools/barcodes/barcode-generator` | Barcode Generator |
| EAN Generator | `/tools/qr-barcode-tools/barcodes/ean-generator` | EAN Generator |
| UPC Generator | `/tools/qr-barcode-tools/barcodes/upc-generator` | UPC Generator |
| Code 128 Generator | `/tools/qr-barcode-tools/barcodes/code-128-generator` | Code 128 Generator |
| Code 39 Generator | `/tools/qr-barcode-tools/barcodes/code-39-generator` | Code 39 Generator |
| ISBN Barcode | `/tools/qr-barcode-tools/barcodes/isbn-barcode` | ISBN Barcode |
| Barcode Scanner | `/tools/qr-barcode-tools/barcodes/barcode-scanner` | Barcode Scanner |
### Worked metadata examples (model these exactly when generating the other 150+ entries)

Use these five as the calibration reference — same rigor, same length discipline, same trust-signal close, applied to every registry entry.

**Instagram Post Size Calculator** (`/tools/image-social-media-hub/instagram/instagram-post-size-calculator`)
- Title: `Instagram Post Size Calculator – Free | Alee Tools`
- Meta: "Calculate the perfect Instagram post size instantly with Instagram Post Size Calculator — free, accurate, and runs entirely in your browser. No uploads, no sign-up, no watermark."
- H1: `Instagram Post Size Calculator`
- FAQ seed: "What is the best Instagram post size in 2026?", "Does Instagram crop non-square posts?", "What's the difference between portrait and landscape post dimensions?"

**Merge PDF** (`/tools/pdf-toolkit/merge-pdf`)
- Title: `Merge PDF Online Free – No Limits | Alee Tools`
- Meta: "Merge PDF files free and instantly with Merge PDF. Combine multiple PDFs into one document, privately in your browser — no uploads, no watermark, no page limits."
- H1: `Merge PDF`
- FAQ seed: "Is there a limit to how many PDFs I can merge?", "Will merging PDFs reduce quality?", "Is my file uploaded to a server?"

**JSON Formatter** (`/tools/developer-tools/json/json-formatter`)
- Title: `JSON Formatter & Beautifier – Free | Alee Tools`
- Meta: "View and inspect JSON instantly with JSON Formatter — free, fast, and completely private. Nothing you paste is ever sent to a server. Beautify, validate, and collapse nested data."
- H1: `JSON Formatter`
- FAQ seed: "Does this validate JSON as well as format it?", "Can I format very large JSON files?", "Is my data sent anywhere?"

**Image to WebP** (`/tools/image-social-media-hub/general/image-to-webp`)
- Title: `Image to WebP Converter – Free | Alee Tools`
- Meta: "Convert images to WebP free and instantly with Image to WebP. Private, browser-based conversion — no uploads, no watermark, no limits on file count."
- H1: `Image to WebP`
- FAQ seed: "Does converting to WebP reduce image quality?", "What's the advantage of WebP over JPG or PNG?", "Can I convert multiple images at once?"

**QR Code Generator** (`/tools/qr-barcode-tools/qr-codes/qr-code-generator`)
- Title: `QR Code Generator – Free, No Sign-Up | Alee Tools`
- Meta: "Generate a QR code free in seconds with QR Code Generator. No sign-up, no watermark, 100% private — your data never leaves your browser. Download as PNG or SVG."
- H1: `QR Code Generator`
- FAQ seed: "Do these QR codes expire?", "Can I customize the QR code color or add a logo?", "What's the best file format to download a QR code in?"

Apply this exact discipline — tool-type-matched verb, named subject, one differentiator, closing trust signal — to every remaining entry in Section 12 when populating `lib/tool-registry.ts`. Do not leave any placeholder/lorem text in the shipped registry.

---

## 13. Non-Negotiable Constraints Summary (for quick agent reference)

1. Next.js App Router, static export (`output: 'export'`) — no server runtime, no database, no user accounts.
2. Every uploaded file/pasted value is processed 100% client-side. No exceptions. Verify with a network-tab check per tool before considering it done.
3. One `tool-registry.ts` is the single source of truth for slugs, metadata, FAQs, and related-tool links — every page, the sitemap, and the search index all read from it.
4. URL structure is exactly `/tools/{category}/{subcategory}/{tool-slug}` (or `/tools/pdf-toolkit/{tool-slug}` for the flat PDF category) and must not change post-launch without a redirect.
5. Every one of the 176 routes (homepage, `/tools`, 5 category hubs, 15 sub-category hubs, 156 tool pages) needs unique title/meta/H1/JSON-LD and non-trivial body copy — no thin pages.
6. Design system = restrained claymorphism (dual soft-shadow "clay" surfaces) applied only to interactive elements, on a warm minimalist base, with 5 category accent colors used as flat fills for wayfinding — not the generic cream/terracotta or SaaS-card-kit defaults.
7. Code-split every tool's processing library so pages only load what they use.
