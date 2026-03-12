# Snowlake Jekyll Theme

## Overview
A Jekyll-based static website theme (Snowlake v2) with blog, portfolio, shop, and various page layouts.

## Tech Stack
- **Language:** Ruby
- **Framework:** Jekyll 4.3.x (static site generator)
- **Plugins:** jekyll-feed, jekyll-paginate-v2, jekyll-archives
- **Package Manager:** Bundler (Gemfile)

## Project Structure
- `_config.yml` - Jekyll configuration
- `_layouts/` - Page layout templates
- `_includes/` - Reusable HTML partials
- `_posts/` - Blog posts (Markdown)
- `_portfolio/` - Portfolio items
- `_shop_items/` - Shop product items
- `_authors/` - Author profiles
- `_data/` - YAML/JSON data files
- `assets/` - CSS, JS, images
- `_site/` - Generated static output (not committed)

## Development
The site runs via Jekyll's built-in server:
```
bundle exec jekyll serve --host 0.0.0.0 --port 5000 --livereload
```

## Deployment
Configured as a static site deployment:
- **Build:** `bundle exec jekyll build`
- **Public directory:** `_site`
