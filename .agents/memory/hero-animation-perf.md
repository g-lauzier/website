---
name: Hero p5.js animation — interaction-gated lazy load
description: Why the homepage hero animation must NOT load eagerly, and how it's wired.
---

# Homepage hero animation is interaction-gated on purpose

The homepage hero is a p5.js (~1 MB) pixel-grid animation that runs a perpetual
30fps `draw()` loop over ~14k cells (noise + sqrt + trig per cell). Loaded eagerly
it tanked Lighthouse: TTI ~35s, TBT ~12s, Speed Index ~9s (FCP/LCP/CLS were fine).

**Why it's so bad:** a continuous rAF animation where each frame is a >50ms long
task means the main thread is *never quiet*, so Lighthouse TTI can never find its
5s quiet window (caps at ~35s) and TBT accumulates every frame's blocking time.
Deferring with `defer`/`async` does NOT fix this — once the loop starts it blocks
forever regardless of when it started.

**The fix (do not regress this):**
- `index.html` has an inline loader that immediately shows a static poster
  `<img class="gl-hero-poster">` (decorative: `alt=""` + `aria-hidden="true"`).
- p5.min.js + sketch.js are injected ONLY on the first user interaction
  (`pointermove`/`pointerdown`/`touchstart`/`scroll`/`keydown`/`wheel`). The
  animation is mouse/scroll-driven, so at rest the poster is all you need.
- `prefers-reduced-motion` → keep poster, never download p5 at all.

**Load-order gotcha:** load `sketch.js` FIRST (it defines `window.preload/setup/
draw`), THEN `p5.min.js`. p5 global mode auto-inits because `document.readyState`
is already `'complete'` post-load (p5's init.js runs `_globalInit()` immediately
when readyState is complete and finds the window.* globals). Reverse the order and
nothing initializes.

**Offscreen guard:** if the triggering interaction is a scroll past the hero, the
IntersectionObserver records `paused=true` before p5 exists; `setup()` re-applies
it with `if (paused) noLoop();` so it doesn't animate offscreen.

**How to apply:** if asked to "speed up the homepage" again, the animation is
already off the critical path — look elsewhere (images, fonts). Do NOT move p5/
sketch back into eager `<script>` tags or add a timer-based auto-start (a timer
re-introduces the long-task storm into the Lighthouse trace).
