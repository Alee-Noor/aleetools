import React from 'react';
import {
  ShieldCheck,
  Zap,
  Lock,
  Sparkles,
  CheckCircle2,
  FileCode,
  Globe,
  Wifi,
  Contact,
  Mail,
  MessageSquare,
  Printer,
  Smartphone,
  Check,
  X,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
  Cpu,
} from 'lucide-react';

export function QrCodeSeoContent() {
  return (
    <article className="mt-12 sm:mt-16 space-y-12 sm:space-y-16 border-t pt-10 text-stone-800 dark:text-stone-200" style={{ borderColor: 'var(--border)' }}>
      {/* ─── 1. INTRO & VALUE PROPOSITION ─── */}
      <section className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-lg px-3 py-1 text-xs font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
          <Sparkles size={14} />
          <span>100% Free Forever • No Signup • No Watermark</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-stone-900 dark:text-white leading-tight">
          The Ultimate Free QR Code Generator: Create Custom, Permanent QR Codes Online
        </h2>
        <p className="text-sm sm:text-base leading-relaxed text-stone-600 dark:text-stone-300 font-medium">
          Welcome to the most versatile, completely free <strong>QR Code Generator</strong> on the web. Whether you need a crisp QR code for a website URL, an instant Wi-Fi network connection, a digital vCard business card, or a customized marketing campaign, Alee Tools lets you create, customize, and download high-resolution QR codes in seconds.
        </p>
        <p className="text-sm sm:text-base leading-relaxed text-stone-600 dark:text-stone-300 font-medium">
          Unlike predatory QR code services that trap your links behind a 14-day &ldquo;free trial&rdquo; only to deactivate your printed codes unless you pay an expensive monthly subscription, <strong>every QR code generated here is 100% static, permanent, and free forever</strong>. Your codes never expire, there are zero scan limits, no promotional watermarks, and no user registration required.
        </p>
      </section>

      {/* ─── 2. SUPPORTED QR CODE TYPES ─── */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white tracking-tight">
            Supported QR Code Types &amp; Data Payloads
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-medium">
            Generate customized QR codes tailored to any digital, print, or business application.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border space-y-2.5 bg-stone-50/50 dark:bg-stone-900/30" style={{ borderColor: 'var(--border)' }}>
            <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
              <Globe size={18} />
            </div>
            <h3 className="text-sm font-bold text-stone-900 dark:text-white">Website URLs &amp; Links</h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-medium">
              Direct users instantly to your homepage, e-commerce store, social profiles, online portfolio, or marketing landing pages with a quick camera scan.
            </p>
          </div>

          <div className="p-4 rounded-xl border space-y-2.5 bg-stone-50/50 dark:bg-stone-900/30" style={{ borderColor: 'var(--border)' }}>
            <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-700 dark:text-amber-300">
              <Wifi size={18} />
            </div>
            <h3 className="text-sm font-bold text-stone-900 dark:text-white">Wi-Fi Network Access</h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-medium">
              Allow guests and customers to join your home, office, or restaurant Wi-Fi automatically (WPA/WPA2/WEP) without typing tedious passwords.
            </p>
          </div>

          <div className="p-4 rounded-xl border space-y-2.5 bg-stone-50/50 dark:bg-stone-900/30" style={{ borderColor: 'var(--border)' }}>
            <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-700 dark:text-blue-300">
              <Contact size={18} />
            </div>
            <h3 className="text-sm font-bold text-stone-900 dark:text-white">vCard Digital Business Cards</h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-medium">
              Share your full name, phone number, email address, job title, and organization directly into any smartphone address book with a single tap.
            </p>
          </div>

          <div className="p-4 rounded-xl border space-y-2.5 bg-stone-50/50 dark:bg-stone-900/30" style={{ borderColor: 'var(--border)' }}>
            <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-700 dark:text-purple-300">
              <MessageSquare size={18} />
            </div>
            <h3 className="text-sm font-bold text-stone-900 dark:text-white">WhatsApp &amp; SMS Messages</h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-medium">
              Launch WhatsApp chats or mobile SMS messaging with a pre-filled recipient and introductory prompt, perfect for customer inquiries and bookings.
            </p>
          </div>

          <div className="p-4 rounded-xl border space-y-2.5 bg-stone-50/50 dark:bg-stone-900/30" style={{ borderColor: 'var(--border)' }}>
            <div className="w-9 h-9 rounded-lg bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-teal-700 dark:text-teal-300">
              <Mail size={18} />
            </div>
            <h3 className="text-sm font-bold text-stone-900 dark:text-white">Email with Preset Subject</h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-medium">
              Pre-populate recipient email address, subject line, and message template so customers can reach your support team without typos.
            </p>
          </div>

          <div className="p-4 rounded-xl border space-y-2.5 bg-stone-50/50 dark:bg-stone-900/30" style={{ borderColor: 'var(--border)' }}>
            <div className="w-9 h-9 rounded-lg bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-700 dark:text-rose-300">
              <FileCode size={18} />
            </div>
            <h3 className="text-sm font-bold text-stone-900 dark:text-white">Plain Text &amp; Notes</h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-medium">
              Encode raw text, promo codes, serial numbers, security keys, or secret messages (up to 7,089 numeric or 4,296 alphanumeric characters).
            </p>
          </div>

          <div className="p-4 rounded-xl border space-y-2.5 bg-stone-50/50 dark:bg-stone-900/30" style={{ borderColor: 'var(--border)' }}>
            <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-700 dark:text-amber-300">
              <Sparkles size={18} />
            </div>
            <h3 className="text-sm font-bold text-stone-900 dark:text-white">Bitcoin &amp; Crypto Payments</h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-medium">
              Create instant crypto payment request QR codes with your wallet address and preset BTC amount for seamless cryptocurrency transactions.
            </p>
          </div>

          <div className="p-4 rounded-xl border space-y-2.5 bg-stone-50/50 dark:bg-stone-900/30" style={{ borderColor: 'var(--border)' }}>
            <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
              <Smartphone size={18} />
            </div>
            <h3 className="text-sm font-bold text-stone-900 dark:text-white">Direct Phone Call</h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-medium">
              Prompt smartphone dialers to call your business phone line, customer hotline, or emergency contact number with a single scan.
            </p>
          </div>
        </div>
      </section>

      {/* ─── 3. STATIC VS DYNAMIC COMPARISON TABLE ─── */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white tracking-tight">
            Static vs. Dynamic QR Codes: Why Static Codes Are Truly Free &amp; Permanent
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-medium">
            Understand how commercial QR code generators scam users with &ldquo;dynamic&rdquo; redirects versus direct static encoding.
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border shadow-sm" style={{ borderColor: 'var(--border)' }}>
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b bg-stone-100 dark:bg-stone-900/80 text-stone-900 dark:text-white font-bold" style={{ borderColor: 'var(--border)' }}>
              <tr>
                <th className="p-3.5 sm:p-4">Feature Comparison</th>
                <th className="p-3.5 sm:p-4 text-emerald-700 dark:text-emerald-400 font-extrabold">Alee Tools Static QR Code (Free)</th>
                <th className="p-3.5 sm:p-4 text-stone-500">Commercial Dynamic QR Codes</th>
              </tr>
            </thead>
            <tbody className="divide-y text-stone-700 dark:text-stone-300" style={{ borderColor: 'var(--border)' }}>
              <tr>
                <td className="p-3.5 sm:p-4 font-semibold text-stone-900 dark:text-white">Expiration Date</td>
                <td className="p-3.5 sm:p-4 font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <Check size={16} className="text-emerald-600" /> Never Expires (Permanent)
                </td>
                <td className="p-3.5 sm:p-4 text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1.5">
                  <X size={16} className="text-rose-600" /> Stops working when trial/sub ends
                </td>
              </tr>
              <tr>
                <td className="p-3.5 sm:p-4 font-semibold text-stone-900 dark:text-white">Pricing &amp; Subscription</td>
                <td className="p-3.5 sm:p-4 font-bold text-emerald-700 dark:text-emerald-400">100% Free Forever ($0/mo)</td>
                <td className="p-3.5 sm:p-4 text-stone-500">$9 – $49/month recurring fees</td>
              </tr>
              <tr>
                <td className="p-3.5 sm:p-4 font-semibold text-stone-900 dark:text-white">Scan Limit</td>
                <td className="p-3.5 sm:p-4 font-bold text-emerald-700 dark:text-emerald-400">Unlimited Scans (Zero Quotas)</td>
                <td className="p-3.5 sm:p-4 text-stone-500">Often capped at 100–500 scans/mo</td>
              </tr>
              <tr>
                <td className="p-3.5 sm:p-4 font-semibold text-stone-900 dark:text-white">Redirect Middleman</td>
                <td className="p-3.5 sm:p-4 font-bold text-emerald-700 dark:text-emerald-400">Direct decoding (0ms latency)</td>
                <td className="p-3.5 sm:p-4 text-stone-500">Routes through vendor tracking servers</td>
              </tr>
              <tr>
                <td className="p-3.5 sm:p-4 font-semibold text-stone-900 dark:text-white">User Privacy &amp; Data Security</td>
                <td className="p-3.5 sm:p-4 font-bold text-emerald-700 dark:text-emerald-400">100% Client-Side In-Browser</td>
                <td className="p-3.5 sm:p-4 text-stone-500">Tracks user IP, location &amp; device metadata</td>
              </tr>
              <tr>
                <td className="p-3.5 sm:p-4 font-semibold text-stone-900 dark:text-white">Watermarks &amp; Ads</td>
                <td className="p-3.5 sm:p-4 font-bold text-emerald-700 dark:text-emerald-400">Zero Watermarks (Clean Design)</td>
                <td className="p-3.5 sm:p-4 text-stone-500">Forces vendor logos on free tiers</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ─── 4. HOW TO CREATE A QR CODE STEP BY STEP ─── */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white tracking-tight">
            How to Generate a Free Custom QR Code (Step-by-Step)
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-medium">
            Follow this quick guide to generate crisp, scannable QR codes for your personal or commercial needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl border space-y-2 bg-stone-50/50 dark:bg-stone-900/30" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">1</span>
              <h3 className="text-sm font-bold text-stone-900 dark:text-white">Select Your Content Type</h3>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-medium pl-8">
              Pick the payload category that matches your objective: a standard Website URL, Wi-Fi credentials, vCard contact information, email, SMS, or plain text.
            </p>
          </div>

          <div className="p-5 rounded-xl border space-y-2 bg-stone-50/50 dark:bg-stone-900/30" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">2</span>
              <h3 className="text-sm font-bold text-stone-900 dark:text-white">Enter Your Data &amp; Information</h3>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-medium pl-8">
              Type or paste your destination link (always include <code className="text-[11px] px-1 py-0.5 rounded bg-stone-200 dark:bg-stone-800">https://</code>), Wi-Fi password, or contact profile. The QR code generator automatically calculates the matrix in real time.
            </p>
          </div>

          <div className="p-5 rounded-xl border space-y-2 bg-stone-50/50 dark:bg-stone-900/30" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">3</span>
              <h3 className="text-sm font-bold text-stone-900 dark:text-white">Customize Colors &amp; Contrast</h3>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-medium pl-8">
              Personalize your foreground and background color palette to align with your brand identity. Keep contrast high (dark pixels on light background) for instant camera recognition.
            </p>
          </div>

          <div className="p-5 rounded-xl border space-y-2 bg-stone-50/50 dark:bg-stone-900/30" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">4</span>
              <h3 className="text-sm font-bold text-stone-900 dark:text-white">Download High-Res PNG or Vector SVG</h3>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-medium pl-8">
              Preview your code with your phone camera, then download high-resolution PNG for digital screens or vector SVG for sharp commercial physical printing.
            </p>
          </div>
        </div>
      </section>

      {/* ─── 5. DESIGN & PRINTING BEST PRACTICES ─── */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white tracking-tight">
            Best Practices for Printing and Scanning QR Codes
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-medium">
            Prevent scanning errors, lost leads, and print failures with these golden engineering rules.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-xl border space-y-2.5 bg-stone-50/50 dark:bg-stone-900/30" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <Printer size={16} />
              <span>10:1 Scanning Distance Ratio</span>
            </div>
            <h3 className="text-sm font-bold text-stone-900 dark:text-white">Physical Size Formula</h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-medium">
              Calculate your print size using the standard 10:1 rule: <strong>Scanning Distance &divide; 10 = Minimum Width</strong>. For example, a poster scanned from 2 meters away requires a QR code at least 20 cm &times; 20 cm wide. For business cards, 2 cm &times; 2 cm (0.8&quot;) is the absolute minimum.
            </p>
          </div>

          <div className="p-5 rounded-xl border space-y-2.5 bg-stone-50/50 dark:bg-stone-900/30" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle size={16} />
              <span>The Quiet Zone Margin</span>
            </div>
            <h3 className="text-sm font-bold text-stone-900 dark:text-white">Preserve White Space</h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-medium">
              Every QR code standard requires a &ldquo;Quiet Zone&rdquo; &mdash; a clear margin around all four borders equal to at least <strong>4 modules (blocks) of empty background space</strong>. Never crop flush to the pattern, as camera sensors will fail to detect the alignment corners.
            </p>
          </div>

          <div className="p-5 rounded-xl border space-y-2.5 bg-stone-50/50 dark:bg-stone-900/30" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider">
              <TrendingUp size={16} />
              <span>Color Contrast Rules</span>
            </div>
            <h3 className="text-sm font-bold text-stone-900 dark:text-white">Avoid Inverted Pastels</h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-medium">
              Ensure high visual contrast between foreground pixels and background canvas. Keep the foreground significantly darker than the background. Avoid light yellow or pastel gray on white, and test thoroughly before mass printing.
            </p>
          </div>
        </div>
      </section>

      {/* ─── 6. ERROR CORRECTION DEMYSTIFIED ─── */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white tracking-tight">
            Understanding QR Code Error Correction Levels (Reed-Solomon)
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-medium">
            QR codes utilize mathematical Reed-Solomon error correction to reconstruct obscured or damaged data.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl border bg-stone-50/50 dark:bg-stone-900/30 space-y-1.5" style={{ borderColor: 'var(--border)' }}>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">Level L (~7%)</span>
            <h3 className="font-bold text-stone-900 dark:text-white text-xs">Low Error Correction</h3>
            <p className="text-stone-600 dark:text-stone-400 leading-relaxed font-medium">
              Recovers up to 7% of lost data. Creates the simplest, least dense pattern. Best for clean digital screens and high character density.
            </p>
          </div>

          <div className="p-4 rounded-xl border bg-stone-50/50 dark:bg-stone-900/30 space-y-1.5" style={{ borderColor: 'var(--border)' }}>
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">Level M (~15%)</span>
            <h3 className="font-bold text-stone-900 dark:text-white text-xs">Medium (Standard)</h3>
            <p className="text-stone-600 dark:text-stone-400 leading-relaxed font-medium">
              Recovers up to 15% of corrupted data. The industry standard default offering optimal balance between error resilience and compact dot matrix size.
            </p>
          </div>

          <div className="p-4 rounded-xl border bg-stone-50/50 dark:bg-stone-900/30 space-y-1.5" style={{ borderColor: 'var(--border)' }}>
            <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-sm">Level Q (~25%)</span>
            <h3 className="font-bold text-stone-900 dark:text-white text-xs">Quartile Correction</h3>
            <p className="text-stone-600 dark:text-stone-400 leading-relaxed font-medium">
              Recovers up to 25% of obscured data. Recommended for outdoor print signage, delivery labels, and flyers exposed to potential smudging or dirt.
            </p>
          </div>

          <div className="p-4 rounded-xl border bg-stone-50/50 dark:bg-stone-900/30 space-y-1.5" style={{ borderColor: 'var(--border)' }}>
            <span className="font-mono font-bold text-purple-600 dark:text-purple-400 text-sm">Level H (~30%)</span>
            <h3 className="font-bold text-stone-900 dark:text-white text-xs">High Resilience</h3>
            <p className="text-stone-600 dark:text-stone-400 leading-relaxed font-medium">
              Recovers up to 30% of lost data. Mandatory when overlaying custom company logos, icons, or branding images in the center of the QR code.
            </p>
          </div>
        </div>
      </section>

      {/* ─── 7. INDUSTRY USE CASES ─── */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white tracking-tight">
            Top Commercial &amp; Personal Use Cases
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-medium">
            How modern organizations and creators leverage free QR codes to streamline workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl border space-y-2 bg-stone-50/50 dark:bg-stone-900/30" style={{ borderColor: 'var(--border)' }}>
            <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>Restaurants &amp; Hospitality Menus</span>
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-medium">
              Place permanent static QR codes on tabletops to let guests browse digital menus, access guest Wi-Fi networks, leave Google reviews, or pay their bill contact-free.
            </p>
          </div>

          <div className="p-5 rounded-xl border space-y-2 bg-stone-50/50 dark:bg-stone-900/30" style={{ borderColor: 'var(--border)' }}>
            <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>Business Cards &amp; Professional Networking</span>
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-medium">
              Print a crisp vCard QR code on the back of your business card. When scanned at conferences or client meetings, your contact details save into their phone instantly.
            </p>
          </div>

          <div className="p-5 rounded-xl border space-y-2 bg-stone-50/50 dark:bg-stone-900/30" style={{ borderColor: 'var(--border)' }}>
            <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>Retail Packaging &amp; User Manuals</span>
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-medium">
              Replace bulky multi-language paper manuals with a compact QR code that directs buyers to PDF guides, video setup tutorials, and warranty registration forms.
            </p>
          </div>

          <div className="p-5 rounded-xl border space-y-2 bg-stone-50/50 dark:bg-stone-900/30" style={{ borderColor: 'var(--border)' }}>
            <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>Event Signage, Badges &amp; Tickets</span>
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-medium">
              Simplify attendee registration, venue check-in, agenda access, and sponsor promotions across physical conferences, concerts, and community meetups.
            </p>
          </div>
        </div>
      </section>

      {/* ─── 8. CLIENT-SIDE PRIVACY ARCHITECTURE ─── */}
      <section className="p-6 sm:p-8 rounded-2xl border space-y-4 bg-emerald-500/5 dark:bg-emerald-950/20" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-xs uppercase tracking-wider">
          <ShieldCheck size={18} />
          <span>Client-Side Privacy Guarantee</span>
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white tracking-tight">
          Why Client-Side QR Generation is Safer Than Remote Cloud Services
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-medium">
          When you enter sensitive data &mdash; such as private Wi-Fi passwords, personal telephone numbers, crypto wallet addresses, or confidential internal links &mdash; into cloud-based QR code tools, your credentials are submitted across the public internet to third-party databases.
        </p>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-medium">
          <strong>Alee Tools operates with a zero-knowledge architecture:</strong> every QR code calculation is performed 100% locally in your web browser memory using HTML5 Canvas and client-side JavaScript. <strong>Zero bytes are transmitted over the network, zero logs are recorded, and your private information never leaves your device.</strong>
        </p>
      </section>
    </article>
  );
}
