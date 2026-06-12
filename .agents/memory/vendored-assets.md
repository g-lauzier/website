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
