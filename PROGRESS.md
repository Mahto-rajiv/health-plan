# Progress checklist

Last updated: 21 Oct 2026. Use this to resume work in a later session.

## Done

- [x] Audit: all 8 routes, data files, scripts, components. Baseline build, lint, types and `npm run validate` passed before changes.
- [x] Weight-gain rate changed to match its cited source. The old rate was +0.3–0.6 kg/month (~0.1–0.2%/week), stricter than Iraki 2019 (0.25–0.5%/week for novices). It is now +0.5–1.0 kg/month, and +0.3–0.7 after 6 months. Updated in `lib/progress.ts`, `lib/data/nutrition-guide.ts` and the dashboard.
- [x] Meal plans:
  - Fixed titles that named foods a meal didn't contain.
  - Fixed wrong tutorials, e.g. the sattu paratha meal linked to moong sprouts.
  - Added curd that a marinade needed but the ingredient list was missing.
  - Fixed prep text that didn't match the ingredients.
- [x] Eggs capped at 21 a week in Plans 3 and 4, in line with the plan's own note on eggs. Plan 3 used 28 a week and said "about 3 a day".
- [x] Budget: Plans 1–3 are now ≤ ₹5,000/month (₹4,994 / ₹4,891 / ₹4,962). Plan 4 is ≈ ₹5,680, which is ₹680 over. The site states the shortfall and shows computed swaps; all of them together bring it to ≈ ₹5,100.
- [x] Budget swaps are now computed from each plan's own quantities instead of fixed estimates. Added a "protein for your money" comparison and pack/shelf hints to the grocery list.
- [x] References:
  - Replaced the dead ICMR 2024 link.
  - Updated the NHS links that redirect.
  - Added a thyroid-test citation for the biotin claim.
  - Corrected the Helms 2023 note (trained lifters) and the Bell 2023 title.
- [x] Added 5 cooking tutorials, each checked for HTTP 200 and a matching page title.
- [x] Accessibility and responsive fixes:
  - Mobile content was hidden behind the bottom nav.
  - The More sheet now works as a modal: focus moves in, Tab stays inside, focus returns on close, and the page behind doesn't scroll.
  - Plan picker uses radio buttons, so it no longer clips at 320 px.
  - Day picker uses `aria-pressed`.
  - Small targets fixed in the check-in and dashboard links.
- [x] `npm run validate` is stricter. It now checks:
  - meals by content, not object identity;
  - that office meals are packable;
  - that meal titles match ingredients;
  - fibre per day;
  - eggs per week;
  - that grocery costs add up to the meal costs;
  - that every tutorial id exists;
  - the budget (reported as a warning).

## Not done / not verified

- [ ] NIH ODS fact sheets and the EFSA water DOI block automated requests, so their content was not re-read this session. The URLs are the canonical ones.
- [ ] Some accessories have no tutorial link because no verified link was found: seated DB shoulder press, leg extension, cable fly, deep squat hold, doorway stretch.
- [ ] Prices are estimates. Re-check milk, paneer, sattu and chicken locally.
- [ ] `/progress` loads ~800 KB of JS (Recharts, already lazy-loaded). The charts are on the first screen, so the gain from loading them later would be small. Not changed.
- [ ] The 72 kg checkpoint message shows for the whole 72–73 kg range and has no "done" state.
- [ ] No unit-test framework. Deterministic checks live in `scripts/validate-plans.ts`.
