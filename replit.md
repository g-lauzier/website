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
- `advisory.html` — 3-tier engagement models (The Roadmap / Architecture / Partner) + alignment toggle
- `pitch.html` — Terminal-style high-friction pitch filter form
- `writing.html` — Editorial blog listing
- `hero.html` — Standalone hero demo page at `/hero/`

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

## Key Files
- `_config.yml` — Site title: "Guillaume Lauzier", shop/author collections removed
- `assets/css/gl-dark.css` — Complete design system (single file, no Bootstrap dependency)
- `assets/css/hero.css` — Standalone hero page styles
- `assets/js/gl.js` — Vanilla JS: alignment toggle, pitch form success state, sector card toggle, mobile nav
- `assets/js/sketch.js` — p5.js pixel animation for hero background

## Development
- **Workflow:** `node serve.js` — serves `_site/` on port 5000
- **Build:** `jekyll build` (temporarily rename Gemfile to bypass Bundler version issues)
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
