# Guillaume Lauzier — Venture Partner Portfolio

## Overview
A premium dark-mode portfolio site for Guillaume Lauzier, Venture Partner. Built on Jekyll, fully custom-designed with a "Digital Sovereign" / "Contrarian Builder" aesthetic. No Snowlake theme CSS is used — the entire frontend is a custom dark design system.

## Tech Stack
- **Language:** Ruby
- **Framework:** Jekyll 4.3.x (static site generator)
- **Plugins:** jekyll-feed, jekyll-paginate-v2, jekyll-archives
- **Package Manager:** Bundler (Gemfile)
- **Fonts:** Inter (UI), Playfair Display (headings), JetBrains Mono (code/labels) — loaded via Google Fonts CDN

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
- `index.html` — Full homepage: hero, bio, 10-sector accordion grid, investments, filter section
- `advisory.html` — 3-tier engagement models (The Roadmap / Architecture / Partner) + alignment toggle
- `pitch.html` — Terminal-style high-friction pitch filter form
- `writing.html` — Editorial blog listing

## Key Files
- `_config.yml` — Site title: "Guillaume Lauzier", shop/author collections removed
- `assets/css/gl-dark.css` — Complete design system (single file, no Bootstrap dependency)
- `assets/js/gl.js` — Vanilla JS: alignment toggle, pitch form success state (sectors are pure CSS hover-reveal)

## Development
Workflow: `bundle exec jekyll build && ruby -run -e httpd _site -p 80 -b 0.0.0.0`
Server runs on port 80 (required for Replit proxy routing). Restart workflow to rebuild after file changes.

## Deployment
- **Target:** Static site
- **Build:** `bundle exec jekyll build`
- **Public directory:** `_site`
- **Custom domain:** Configure `guillaumelauzier.com` via Replit deployment dashboard after publishing

## Navigation (simplified)
Home · Investments · Writing · Advisory · **Pitch** (bordered CTA)

## Sectors (10 primitives, pure CSS hover-reveal)
The Backbone: Digital Infrastructure, Cybersecurity, Blockchain Software
The Intelligence: AI Software, Fintech, eCommerce
The Expression: Design & Architecture, Digital Art, Entertainment, Marketing & Content
- Sector titles: JetBrains Mono, 0.78rem, 0.12em tracking, uppercase
- Hover reveals: "Technical Conviction" sentence in mono + electric blue glow + accent border-bottom
