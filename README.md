# TinyTools Lab

Free online calculators and browser tools — a tabbed single-page static site.
Every tool runs 100% client-side in vanilla JavaScript: no uploads, no server,
no accounts. Each tool routes to the Odd-jack Ko-fi shop
(https://ko-fi.com/oddjack/shop) for printable worksheet/template packs.
Phase 2 (needs Bruno's approval): AdSense.

Part of the Top-5 Websites portfolio — see `~/workspace/websites/MASTER-PLAN.md`
section 2, and `TEAM.md` in this folder for the worker group.

## The tools (7)

1. **Percentage Calculator** — X% of Y · X is what % of Y · % change
2. **Compound Interest Calculator** — principal, rate, years, compounding
   frequency (yearly→daily), monthly contribution → final balance,
   interest earned, total contributions
3. **Mortgage Calculator** — home price, down payment, rate, term
   (10/15/20/30y) → monthly payment, total interest, total cost
4. **Tip Calculator & Bill Splitter** — bill, tip % (quick buttons), split
5. **Image Resizer / Compressor** — canvas-based, fully client-side: resize
   by width, quality slider, JPEG/WebP/PNG output, side-by-side preview
   with file sizes, download
6. **Word Counter** — words, characters, characters (no spaces), sentences,
   paragraphs, reading time (~200 wpm), live
7. **Case Converter** — UPPERCASE, lowercase, Title Case, Sentence case,
   aLtErNaTiNg, with a copy button (clipboard + fallback)

## Files

```
site/
  index.html   (14.7 KB) — semantic, ARIA tabs (arrow-key navigation, #hash deep-links)
  styles.css   ( 4.0 KB) — system font stack, mobile-responsive, no external assets
  script.js    (12.0 KB) — all logic; pure calc functions exported for Node tests
  sitemap.xml           — currently points at the planned GitHub Pages URL
  robots.txt
```

Build standard: pure static, no build step, no CDNs, no external fonts,
meta + OG tags, sitemap.xml + robots.txt.

## Run locally

```sh
cd site && python3 -m http.server 8000   # then open http://localhost:8000
```

## Deploy (after Bruno's go — NOT done yet)

GitHub Pages repo `tinytools-lab` under `oddjack0`, same pattern as
oddjack-art; contents of `site/` at repo root. If the final URL differs,
update the `<loc>` in sitemap.xml and the Sitemap line in robots.txt.

## Correctness tests (run 2026-10-20, all PASS)

`script.js` exports its pure functions under Node (`module.exports` guard),
and they were asserted against independent Python reference calculations:

| Case | Expected | Got |
|---|---|---|
| Compound interest $1,000 @ 10%, 10y, yearly | **2593.74** | 2593.7425 |
| Compound interest $1,000 @ 10%, 10y, monthly compounding | 2707.04 | 2707.0415 |
| Compound int. $5,000 @ 8%, 10y, monthly comp. + $100/mo | 29392.80 | 29392.8047 |
| Compound interest, 0% rate ($1,000 + $50/mo × 5y) | 4000.00 | 4000.00 |
| Mortgage $300k loan, 6%, 30y — monthly payment | **1798.65** | 1798.6516 |
| Mortgage $300k, 6%, 30y — total interest | 347514.57 | 347514.5672 |
| Percentage: 20% of 150 / 45 of 60 / 80→100 change | 30 / 75% / +25% | exact |
| Tip: $60 bill, 20%, split 2 | $12 / $72 / $36 each | exact |
| Word counter & case converter samples | — | exact |

Conventions: monthly contributions are added at end of month after growth
(conservative); the monthly loop uses the monthly-equivalent rate so it
matches the closed form A = P(1 + r/n)^(nt) exactly at zero contributions.
Mortgage figures are principal + interest only (no tax/insurance/HOA).

## Kill condition (from the master plan)

<500 sessions in 90 days with promotion → keep the 3 best tools, stop
building new ones.
