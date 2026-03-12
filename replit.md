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
- `assets/js/gl.js` — Vanilla JS: sector accordion, alignment toggle, pitch form success state

## Development
```
bundle exec jekyll serve --host 0.0.0.0 --port 5000
```
Livereload is disabled (breaks Replit preview). Server on port 5000.

## Deployment
- **Build:** `bundle exec jekyll build`
- **Public directory:** `_site`

## Navigation (simplified)
Home · Investments · Writing · Advisory · **Pitch** (bordered CTA)

## Sectors (10 primitives, accordion reveal)
The Backbone: Digital Infrastructure, Cybersecurity, Blockchain Software
The Intelligence: AI Software, Fintech, eCommerce
The Expression: Design & Architecture, Digital Art, Entertainment, Marketing & Content
