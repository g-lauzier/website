---
name: Sourcing article content from axal.vc
description: How to extract full article text from axal.vc when cross-posting to the Writing section (the site is a JS SPA; normal fetchers fail).
---

When the user wants to republish an axal.vc article into this site's `_posts/`,
do NOT try to scrape the article page HTML. axal.vc is a React SPA on GitHub
Pages behind Cloudflare Turnstile: the article page returns an identical ~6.8KB
shell for every route, and `webFetch`, the screenshot renderer, and Jina reader
all return blank/empty. There are no Wayback snapshots and search engines don't
have the body text.

**The working source is the site's own JSON API:**
- `https://axal.vc/api/articles` — lists all articles (slug, title, subtitle,
  tags, sector, published_at, author).
- `https://axal.vc/api/articles/<slug>` — full article, including `body_markdown`
  (clean Markdown) and `body_html`.

Use `body_markdown`. Note the source markdown has a leading 2-space indent on
most lines — strip per-line whitespace before writing (there are no code blocks,
so this is safe).

**Why:** the article content is loaded client-side from this API; the static
HTML never contains it, so curl/headless/readers see nothing.

**How to apply:** fetch the per-slug JSON, then write a `_posts/YYYY-MM-DD-slug.md`
following the repo convention — front matter (`layout: posts/post`, title, date
from `published_at`, `categories: ["..."]`, `tags`, `description` = subtitle,
`permalink: "/slug/"`, `canonical_url` = the axal.vc article URL) + an italic
"Originally published on [Axal VC](...)" cross-post note + the cleaned body.
Map the API `sector` to a sensible category. Posts go live by pushing `main` to
GitHub (see vendored-assets.md for the hosting model).
