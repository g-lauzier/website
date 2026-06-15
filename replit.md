# Guillaume Lauzier — Venture Partner Portfolio

## Overview
A premium dark-mode portfolio site for Guillaume Lauzier, Venture Partner. Built on Jekyll, fully custom-designed with a "Digital Sovereign" / "Contrarian Builder" aesthetic. No Snowlake theme CSS is used — the entire frontend is a custom dark design system.

## Tech Stack
- **Language:** Ruby
- **Framework:** Jekyll 4.3.x (static site generator)
- **Plugins:** jekyll-feed, jekyll-paginate-v2, jekyll-archives
- **Package Manager:** Bundler (Gemfile)
- **Fonts:** Inter (UI), Playfair Display (headings), JetBrains Mono (code/labels) — loaded via Google Fonts CDN
- **Interactive:** p5.js (CDN) for homepage hero background animation

## Design System (`assets/css/gl-dark.css`)
- **Background:** `#0a0a0a` (deep black)
- **Text:** `#ededed` (crisp off-white)
- **Accent:** `#4f8ef7` (electric blue)
- **Border:** `rgba(255,255,255,0.08)`
- **Nav:** Fixed, glassmorphic backdrop-blur, 80px height
- **Cards:** Glassmorphism — `rgba(255,255,255,0.02)` bg with subtle border

## Custom Layout
- `_layouts/gl-default.html` — New dark layout (replaces Snowlake default)
- `_layouts/single.html` — Rewritten to use gl-default; editorial post style

## Pages
- `index.html` — Full homepage: interactive pixelated hero (p5.js), bio, 12-sector accordion grid, investments, filter section
- `about.html` — Editorial bio: origin story, investment thesis (3 families), philosophy, CTAs
- `advisory.html` — 3-tier engagement models (The Roadmap / Architecture / Partner) + alignment toggle, with hCaptcha + honeypot
- `pitch.html` — Terminal-style high-friction pitch filter form, with hCaptcha + honeypot
- `writing.html` — Editorial blog listing
- `404.html` — Branded "Signal Lost" 404 (uses gl-default layout)

## Interactive Hero Background (`assets/js/sketch.js`)
- p5.js renders `assets/images/portrait.jpg` as a dynamic pixel grid behind homepage hero
- Smart pixelation: pixel size varies by distance from focal point (face area = small/detailed, edges = large/abstract)
- Mouse-driven pixel repulsion with spring easing
- Perlin noise floating animation
- Text-safe zone: left 40% has reduced movement, darkened colors, gradient overlay for readability
- Parallax effect on mouse move
- Glow effect on bright image areas
- Hero wrapper (`.gl-hero-wrapper`) contains canvas, overlay, and hero content with proper z-indexing
- Only loads on pages with `#canvas-container` element (safe for non-homepage pages)
- **Lazy-loaded for performance:** p5.js + sketch.js are NOT loaded at page load. An inline loader in `index.html` shows a static portrait poster (`.gl-hero-poster`, `object-position: 63% 40%` to match the focal point) immediately, then injects sketch.js → p5.min.js only on the first user interaction (`pointermove`/`pointerdown`/`touchstart`/`scroll`/`keydown`/`wheel`). The animation is mouse/scroll-driven, so this costs nothing visually at rest. `prefers-reduced-motion` users keep the static poster and never download p5.js (~1 MB saved). This eliminated the TTI/TBT/Speed-Index blowup (perpetual 30fps long tasks kept the main thread from ever going quiet).

## Key Files
- `_config.yml` — Site title: "Guillaume Lauzier", shop/author collections removed
- `assets/css/gl-dark.css` — Complete design system (single file, no Bootstrap dependency)
- `assets/css/hero.css` — Standalone hero page styles
- `assets/js/gl.js` — Vanilla JS: alignment toggle, pitch form success state, sector card toggle, mobile nav
- `assets/js/sketch.js` — p5.js pixel animation for hero background

## Performance Optimizations
- **Server (serve.js):** LRU-bounded gzip cache (100 entries / 32 MB), HTTP Range support, streaming for files >1 MB, async file reads, `Cache-Control` headers (immutable for assets, must-revalidate for HTML)
- **Google Fonts:** Trimmed from 7 families to 4 (Inter, JetBrains Mono, Playfair Display, Mr Dafoe), reduced weights, async loading via `preload` + `onload` pattern to prevent render-blocking
- **Images:** `loading="lazy"` on all gallery, sidebar, and trending-post images; `fetchpriority="high"` on hero images
- **p5.js sketch:** Frame rate capped at 30fps, debounced resize handler (150ms), inlined Math functions replacing p5 wrappers, reduced per-frame allocations; respects `prefers-reduced-motion`; pauses via `IntersectionObserver` when off-screen
- **p5.js library:** Self-hosted at `/assets/vendor/p5.min.js` (no third-party CDN dependency). SRI integrity hash intentionally omitted — a self-hosted asset gains little from SRI, and hash mismatches (e.g. via edge JS minification) silently break the script in production while working in dev.
- **Script loading:** `gl.js` uses `defer`. p5.js + sketch.js are interaction-gated lazy-loads (see Interactive Hero Background) — they never touch the critical path, so the main thread stays idle during load.
- **Resource hints:** `preconnect` to fonts.googleapis.com, fonts.gstatic.com

## Security
- **CSP:** Strict Content-Security-Policy (default-src 'self') with explicit allowlist for Google Fonts, hCaptcha, GTM, and Formspree; `frame-ancestors 'self'`, `object-src 'none'`, `base-uri 'self'`
- **Headers:** `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`
- **Forms:** Honeypot field (`_gotcha`) + hCaptcha on `pitch.html` and `advisory.html`; sitekey driven from `_config.yml site.hcaptcha_sitekey` (script + widget only render when set)
- **Analytics:** GTM only injected when `site.google_tag_manager_id` is set in `_config.yml` (no placeholder leakage)
- **CSP also configured** in `cloudflare.toml` for parity with edge deployment

## Repo Hygiene
- All Snowlake demo content removed: `home-pages/`, `elements/`, `features/`, `portfolios/`, `blogs/`, `contact/`, `shop/`, `services/`, `screenshots/`, `_shop_items/`, `_authors/`, `_portfolio/`, plus all unused layouts/includes/CSS/JS/Bootstrap/jQuery/RevSlider
- Build output is 87 MB / 185 HTML pages (down from ~172 MB / 472 pages)
- `_config.yml excludes` lists all removed dirs as a defense-in-depth against re-introduction
- `jekyll-sitemap` plugin enabled — `sitemap.xml` is generated automatically (184 entries)
- `robots.txt`, `.gitignore`, `.ruby-version` present

## Development
- **Workflow:** `bundle exec jekyll build && node serve.js` — builds the site then serves `_site/` on port 5000
- **Build:** `bundle exec jekyll build` (requires bundler gems installed via `bundle install`)
- **Restart workflow** to rebuild after file changes

## Deployment
- **Target:** Static site
- **Build:** `bundle exec jekyll build`
- **Public directory:** `_site`
- **Custom domain:** Configure `guillaumelauzier.com` via Replit deployment dashboard after publishing

## Navigation (6 links)
Home · About · Investments · Writing · Advisory · **Pitch** (bordered CTA)

## Sectors (12 primitives, pure CSS hover-reveal)
The Backbone: Digital Infrastructure, Cybersecurity, Blockchain
The Intelligence: AI, Data & Analytics, Fintech, eCommerce
The Expression: Design & Architecture, Digital Art, Entertainment, Marketing & Content, EdTech
- Sector titles: JetBrains Mono, 0.78rem, 0.12em tracking, uppercase
- Hover reveals: "Technical Conviction" sentence in mono + electric blue glow + accent border-bottom
