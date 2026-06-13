---
name: Vendored front-end libraries & SRI fragility
description: Why the p5.js hero animation silently failed in production and how vendored assets + SRI must be handled here
---

# Vendored front-end libraries must actually exist in the repo

The homepage hero animation depends on a self-hosted library at
`assets/vendor/p5.min.js`, referenced from `index.html`. This file was once
*documented as present but missing from the repo*, so it 404'd on every real
deployment — the animation rendered nowhere ("not on any device") even though
nothing in the code looked wrong.

**Rule:** when a page references a self-hosted vendor script, confirm the file
is committed AND lands in `_site/` after `bundle exec jekyll build`. A 404 on a
`<script>` shows as `Refused to execute script ... MIME type ('text/html')` in
the console.

**Why:** the repo docs (`replit.md`) can claim an asset exists when it doesn't;
trust the build output, not the docs.

## SRI on self-hosted assets — avoid it here
The original `<script>` had an `integrity="sha384-..."` hash. SRI on a
same-origin self-hosted file gives little security but breaks the script
entirely if the served bytes differ from the hash — e.g. edge JS minification
(Cloudflare) — producing a **prod-only failure that works fine in dev**. Keep
the p5.js tag plain (no `integrity`).

**How to apply:** if re-adding any vendored script, ship the file, leave SRI
off, and verify in a real browser (app_preview screenshot) that the console is
clean — not just that the build succeeds.

## .gitignore `vendor/` swallowed the app's vendored JS
The library file also could not reach production because `.gitignore` had an
unanchored `vendor/` rule (intended for Bundler) that ALSO matched
`assets/vendor/`. Git silently ignored the new `assets/vendor/p5.min.js`, so it
was never committed/pushed. Fix: anchor Bundler's rule as `/vendor/` (root-only)
so it stops catching `assets/vendor/`.

**Why:** an unanchored dir name in `.gitignore` matches that name at EVERY
level. Confirm with `git check-ignore -v <path>` when a file mysteriously won't
stage.

## Hosting / deploy model (production is NOT Replit)
Production is **GitHub Pages**, repo `origin = github.com/g-lauzier/website`,
served by building Jekyll from source on `main` (root has index.html/_config/
CNAME, no `.nojekyll`, no Actions). A stale prebuilt `_site/` is committed (788
files) but GitHub ignores it as Jekyll's output dir. Replit is the dev env only;
the `.replit` static-deploy block is unused. Changes go live by **pushing
`main` to GitHub** (Replit Git pane), then GitHub Pages rebuilds.

`guillaumelauzier.com` sits behind **Cloudflare** (proxied). A persistent HTTP
**526** = Cloudflare can't validate the GitHub Pages origin cert; fix by setting
the DNS records to DNS-only (grey cloud) or Cloudflare SSL mode to "Full" (not
Strict), and enabling GitHub Pages "Enforce HTTPS".
