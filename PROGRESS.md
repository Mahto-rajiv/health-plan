# Progress checklist

Last updated: 30 Oct 2026. Use this to resume work in a later session.

## Done

- [x] Audit: all 8 routes, data files, scripts, components. Baseline build, lint, types and `npm run validate` passed before changes.
- [x] Weight-gain rate changed to match its cited source. The old rate was +0.3–0.6 kg/month (~0.1–0.2%/week), stricter than Iraki 2019 (0.25–0.5%/week for novices). It is now +0.5–1.0 kg/month, and +0.3–0.7 after 6 months. Updated in `lib/progress.ts`, `lib/data/nutrition-guide.ts` and the dashboard.
- [x] Meal plans:
  - Fixed titles that named foods a meal didn't contain.
  - Fixed wrong tutorials, e.g. the sattu paratha meal linked to moong sprouts.
  - Added curd that a marinade needed but the ingredient list was missing.
  - Fixed prep text that didn't match the ingredients.
- [x] Eggs capped at 21 a week in Plans 3 and 4, in line with the plan's own note on eggs. Plan 3 used 28 a week and said "about 3 a day".
- [x] Budget (23 Oct, with edible yield): Plans 1–3 are ≈ ₹4,977 / ₹4,964 / ₹4,939 a month — inside ₹5,000, but only by ₹20–60. Plan 4 is ≈ ₹5,775 (₹775 over); all computed swaps together bring it to ≈ ₹5,310.
- [x] Refinements (23 Oct):
  - Produce is costed as bought, using approximate edible yields. This added ₹180–240 a month per plan, which was offset by: less paneer (partly replaced by soya, protein-matched), papaya instead of mixed seasonal fruit, pumpkin seeds 8 → 5 g, no raisins, and fewer walnuts/almonds.
  - Every meal shows its hands-on minutes, cost per serving, a flavour tip and, where needed, storage advice. The day view shows total cooking time and food cost.
  - Food-safety section on the Prep tab: rice (Food Standards Scotland), leftovers (USDA FSIS), aflatoxin in nuts (WHO), paneer labelling, curd milk, beans, washing produce. The nut grocery lines now suggest small packs stored in the fridge.
  - Supplement notes: costs are kept outside the food budget; how to choose a product and dose.
  - The weekend Meal 3 rule is now stated explicitly in the UI, the code comments and the validator. The data model already gave Saturday and Sunday their own Meal 3.
- [x] Budget and supplement review (30 Oct):
  - Budget band is now ₹3,000–4,000. Prices re-checked: soya chunks ₹135/kg and sattu ₹170/kg in 1 kg packs; daliya added at ₹65/kg.
  - Plans cut without dropping any target: pumpkin seeds and walnuts → peanuts; paneer ~100 g/week or less; dairy trimmed to ~500–650 g/day; Plan 2 uses daliya instead of oats; Plan 4 Sunday curry is chicken + chana; cheap calories (rice, roti) added where days fell short.
  - Result: Preferred ≈ ₹4,620, Vegetarian ≈ ₹4,300, Veg + eggs ≈ ₹4,720, Non-veg ≈ ₹5,550 a month (were ₹4,977 / ₹4,964 / ₹4,939 / ₹5,775). With all swaps: ≈ ₹4,330 / ₹4,180 / ₹4,400 / ₹5,060. No plan is under ₹4,000 by default; each plan states why on the Grocery tab.
  - A one-off least-cost check (linear programme over the food table, outside the repo) found ≈ ₹3,000/month is the floor for meeting the targets at all (10 rotis, soya and spinach daily), and ≈ ₹3,600 with basic variety. Stated in the budget notes.
  - The budget is a soft target (owner, 30 Oct): stay within it where possible, otherwise exceed it rather than cut nutrition, safety or taste. The UI says "above target", not "over budget".
  - New swaps: oats → daliya, half the fruit → banana. The old "fruit → papaya" swap was replaced.
  - Health page: new "What your diet covers" table (ICMR-NIN 2020 needs vs each plan, computed; B12 estimated from USDA values added to dairy, egg, chicken and fish).
  - Supplements rewritten from a sourced review: vitamin D3 1,000 IU/day and B12 500 µg (both Recommended); creatine Optional; multivitamin, protein powder, omega-3, iron/zinc/biotin Not recommended. Buying advice and Indian quality evidence (CDSCO NSQ alerts, 2013 vitamin D content study, 2024 protein study, what each certification covers). 24 new references, each checked against PubMed/Europe PMC or the publisher.
- [x] Long-term safety pass (30 Oct): B12 maintenance lowered to 500 µg once a week after a 3-month course (observational lung-cancer and hip-fracture signals at long-term high doses); groundnut/rice-bran oil as the daily oil, mustard oil ~1 tsp a week (erucic acid vs EFSA TDI); no charred meat (NCI); salt ≤ 5 g/day (WHO); drain plain rice (arsenic, Gray 2016); sun without reddening; validator now also caps fibre at 70 g/day.
- [x] Final audit against the brief (30 Oct): every route checked in a browser at 320/768/1280 px (no overflow, no console errors). Fixed: dashboard exercise list overflowed 43 px at 320 px; settings plan picker clipped "Non-veg" (now 2×2 on phones); date field cut off at 320 px; paneer/soya tips said "char" (now "brown spots, not black"); B12 caution now states that the weekly dose (~70 µg/day average) is not below the observational lung-cancer level, so it is tied to retests and stopping when the level is comfortably normal. Per-day check: on the lowest single day, iron is 18.6 mg (vs 19) and vitamin C 56 mg (vs 80) (Saturday, Plans 1 and 3); weekly averages are well above both.
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
- [ ] Edible yields (papaya 0.7, banana 0.65, spinach 0.7, veg ~0.85…) are typical values and were not measured or sourced individually.
- [ ] The kidney-bean safety note is standard advice but has no citation in the app.
- [ ] No vitamin D or B12 product sold in India with independent third-party testing was found. Product names on the Health page are examples from pharmacy listings; prices are Oct 2026 snapshots. Creatine price (≈ ₹400–600/month) was not confirmed.
- [ ] Not verified directly (sites block automated checks): NICE NG239 text (thresholds taken from a lab-medicine summary), NIH ODS fact sheets, the FSSAI 2022 nutraceutical regulation text (the 1×RDA cap is from a secondary source), USP Verified scope.
- [ ] B12 food values are USDA figures for similar foods; Indian milk and curd were not measured. Boiling losses are not modelled.
- [ ] The least-cost check needs Python + SciPy and lives outside the repo; re-run it if prices change a lot.
- [ ] No unit-test framework. Deterministic checks live in `scripts/validate-plans.ts`.
