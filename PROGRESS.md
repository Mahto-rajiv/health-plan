# Progress

## Round 2 (2 Nov 2026) — branch `round2-seasonal`, nothing pushed

Spec: `docs/brief-round2.md` (overrides `docs/brief.md` where they differ).

### Inspection: the review notes, checked before any change
| Review note | Checked | Finding |
|---|---|---|
| Fruit is hardcoded; Health text depends on it | Yes | True. Papaya is in Meal 1 every day and banana in Meal 3. Health text says vitamin C is "mostly the daily papaya". Peas are in 4 sabzis all year. |
| Only a few nutrients are computed; folate and omega-3 "not computed" | Yes | True. `foods.ts` has 10 fields (macros, iron, calcium, zinc, vitamin C, B12). The values were typed by hand, citing "IFCT/USDA/labels" without a per-food source. |
| Phase 0 iron and zinc fall short | Yes | Zinc 13.0 mg against an EAR of 14. Iron 14 mg is above the EAR (11) but below the RDA (19). Round 1 blamed the fibre and cost caps. Cost was the binding one: pumpkin seeds and cashews were cut for price. |
| Dairy carries much of the protein | Yes | True. About 900 g a day of milk and curd in Phases 1–2. |
| Solver not in the repo | Yes | Worse than stated: the scratchpad copy is gone too. The plans can't be regenerated. |
| Warm-up not visible as steps; session-length arithmetic | Yes | The warm-up is 3 jargon lines. `estimateMinutes` leaves out changeover time and warm-up sets for the second heavy lift. Upper B in week 3 computes to exactly 45:00, so in real life it runs over the 45-min cap. |
| Monday needs ~28 min of morning cooking | Yes | True. 25–31 min of hands-on cooking before leaving on 4 of 5 weekdays (Meal 1 + a lunch made in the morning). |
| Monday's per-meal costs add to ₹123 but the monthly figure implies more | Yes | Both numbers are right but unexplained. Monday is the cheapest day (₹123, against a ₹136 weekly average), and the monthly figure adds ₹300 of pantry items (≈ ₹10 a day) that no meal shows. |
| Hand-typed Health numbers will go stale | Yes | True. "≈13 mg zinc", "14–19 mg iron", "about 4 kg (68 → 64)", "mostly the daily papaya" are all typed text. |
| Weight-loss to-do / Phase 0 shouldn't hardcode the weight | Yes | True. The to-do says "about 4 kg (68 → 64 kg)" as fixed text. |

### Status
- [x] **Inspection** (above).
- [x] **Training:** numbered warm-up, honest session times, plain-language text.
- [x] **Food data:** every value is generated from IFCT 2017 + USDA SR28 by a script in the repo.
- [x] **Seasons:** four quarters, with fruit and vegetables as seasonal slots.
- [x] **Solver in the repo** (`npm run solve`), covering 36 plan × phase × season variants.
- [x] **Full vitamin and mineral audit:** 22 nutrients plus 2 fats, with gaps shown.
- [x] **Weekday mornings:** at most 15 min hands-on (now 13–14; was 25–31).
- [x] **Budget:** a single ₹6,000 ceiling.
- [x] **Health page:** computed table, and the weight to-do read from your own log.
- [x] **Tests, lint, typecheck, build, browser check, link check** (output below).
- In progress: none. Blocked: none.

### Decisions and why

**1. Seasons.**
- **Definition.** Four 3-month seasons for the North Indian plains: winter Dec–Feb, summer Mar–May, monsoon Jun–Aug, autumn Sep–Nov. This matches your "roughly by quarter" and follows the Rabi / Zaid / Kharif crop seasons.
- **What changes.** Each meal has seasonal *slots*: Meal 1 fruit, Meal 3 fruit, cooked vegetables, salad and leafy greens. Within a season a slot is always the same food, so Meal 1 is still identical every day and Meal 3 identical Mon–Fri. Only the slot food changes, on 1 Dec, Mar, Jun and Sep.
- **What stays fixed.** Every non-seasonal item (oats, milk, dal and so on) has the same amount all year. A test checks this.
- **In the UI.** Meal plans has a Season picker with a "what's in season" card and a fallback for each slot. Settings has Auto (by date) or a pinned season, for markets that are early or late.
- **Papaya and banana stay.** They are in the market all year. Papaya is autumn's breakfast fruit and banana is the Meal 3 fruit in summer and monsoon. I didn't force them out, because "seasonal" shouldn't mean dropping year-round staples.
- **Fibre forced one swap.** Guava was first planned as autumn's breakfast fruit. At 8.6 g of fibre per 100 g, a normal portion breaks the Phase 0 cap of 35 g of fibre a day, and the solver confirmed it was infeasible. Guava is the winter Meal 3 fruit instead, in a smaller portion.
- **Peas** appear only in winter, which is tested.

**2. Nutrient data.**
- **Before:** hand-typed values for 10 nutrients.
- **Now:** `npm run food-data` downloads IFCT 2017 (via the `ifct2017` npm copy, pinned by sha256) and USDA SR28 (pinned by sha256), then generates `lib/data/composition.generated.ts`.
  - That gives 27 values per food: macros, 10 minerals, 11 vitamins, ALA and linoleic acid.
  - Every food records its exact source code (e.g. "IFCT 2017 E028 (Guava, white flesh)").
- **Source rules:**
  - IFCT first, because it measures Indian foods.
  - USDA only where IFCT has no match: oats, curd, toned milk, oils, soya chunks, kabuli chana, pumpkin seeds.
  - Vitamin B12 always comes from USDA, because IFCT doesn't report it.
- **Spot checks.** I compared IFCT rows with the official ICMR-NIN PDF: groundnut protein 23.65 g, guava vitamin C 214 mg, spinach folate 142 µg. All match.
- **Edible share** (peel, seeds, pods) now comes from USDA "refuse" values, replacing Round 1's guessed yields. For example, peas in the pod are 62% pod.
- **Niacin** is counted as niacin equivalents: preformed niacin + tryptophan ÷ 60.
- **Vitamin A** is counted as RAE, with β-carotene at 12:1, the conservative US factor.

**3. Reference values.** Defined in `lib/data/nutrients.ts`.
- **ICMR-NIN 2020, adult men** (EAR and RDA, Table 3 of the brief note), read from the official PDF: iron, zinc, calcium, magnesium, vitamins A, B1, B2, B3, B6, folate, B12 and C, plus ICMR's 2.2 g omega-3 and 6.6 g omega-6.
- **US/Canadian DRIs for men 19–30** (Health Canada tables) where ICMR's summary has none: phosphorus, potassium, copper, selenium, manganese, vitamins E and K, biotin, and the upper limits.
- **Planning floor is the EAR.** ICMR's note says the EAR, not the RDA, is the value for planning an individual's diet. So the plans must reach the EAR, and the solver pushes toward the RDA.
- **Hair flag (★).** Shown on nutrients whose deficiency is linked to hair loss in the two reviews already cited (Almohanna 2019, Guo & Katta 2017). The text says plainly that enough prevents a deficiency; more than enough doesn't grow hair.

**4. Gaps in the data, shown rather than guessed.**
- **Missing values count as 0.** The app names the foods involved next to the total, e.g. "No data for oats, soya chunks…: total may be low".
- **Remaining gaps:**
  - Biotin is missing for 6 foods. Milk and curd biotin is filled from IFCT cow milk, and the source note says so.
  - Manganese is missing for oil.
- **Vitamin D is not counted from food.** IFCT reports vitamin D in plant foods, e.g. 13 µg per 100 g of atta, which other tables don't show. It's covered by sun and the existing 1,000 IU D3.
- **Iodine** is in neither table; it comes from iodised salt.
- **Two IFCT inconsistencies found and recorded in the tests.** The app's own kcal are computed from macros and are not affected by either.
  - Chicken leg N001 is printed as 1,605 kJ, but its own protein and fat give 798 kJ. The breast row is consistent, so this looks like a misprint.
  - For fibre-rich foods (guava, amaranth), IFCT's energy value matches the macros without the fibre term, although its method section lists fibre at 8 kJ/g.
  - Because of this, the per-day check against the tables' own kcal now allows 5% (it was 3%). The brief's rule that shown kcal reconcile with the macros still holds exactly.

**5. Solver in the repo** (`scripts/solve-plans.ts`, `npm run solve`).
- **Method:** a mixed-integer programme run with HiGHS (npm `highs`, MIT licence; a dev dependency only, not shipped to the browser).
- **Hard rules, every plan × season × day:**
  - phase kcal, protein and fibre bands, fat 25–30%, and the Phase 0 soya and sattu caps;
  - the 3 plans within 5% of each other;
  - upper limits;
  - cost ≤ ₹5,700 a month at default prices (₹300 under the ceiling, because prices are estimates);
  - eggs ≤ 21 a week;
  - non-seasonal amounts the same all year.
- **Goal, in order:**
  1. close any weekly-average shortfall below the EAR;
  2. then below the RDA;
  3. then stay close to the starting portions written in the meal data.
- **Cost is not in the goal** (your requirement 4).
- **Output:** `lib/data/plan-quantities.generated.ts`.
- **Freshness tests:** fail if a meal is edited without re-solving, or if any amount is outside its allowed range or step.
- **New optional items the solver may use:** pumpkin seeds, sunflower seeds and ground flaxseed in Meal 1, and sunflower seeds in Meal 3. They exist because zinc, vitamin E, thiamine, B6 and omega-3 were short. Round 1 had cut pumpkin seeds for cost.
- **Oil:** rice-bran oil is now the default, with groundnut oil as the alternative; it was the other way round before. Rice-bran oil has twice the vitamin E (USDA: 32 vs 16 mg per 100 g). The app already listed rice-bran oil as an option.

**6. Morning load.**
- **Change:** all weekday lunches are cooked the evening before, cooled, and refrigerated within 2 hours (USDA FSIS). In the morning they go straight from the fridge into the insulated bag with the frozen bottle.
- **Result:** weekday mornings are Meal 1 (7–8 min) plus about 3 min to pack the lunch and 3 min to pack Meal 3: 13–14 min in total. They were 25–31 min. A test caps mornings at 15 min.
- **Trade-off:** the same cooking (about 15–20 min) moves to the evening, next to dinner. That's your mom's time either way, so check with her. Each lunch card says how long it takes the evening before.

**7. Budget.**
- `BUDGET` is now one ceiling: ₹6,000 a month, labelled "within" or "over" budget. The old ₹4,000–4,500 target and its labels are gone.
- The "ways to spend less" swaps now appear only if a plan goes over the ceiling with your own prices.

**8. Cost display.**
- The day view now explains the gap your review spotted: today's food, this week's average day, and ≈ ₹10 a day of pantry items that no meal shows.

**9. Weight.**
- The Health to-do now uses your log:
  - **Before:** the earliest recalled weight, otherwise Settings.
  - **Now:** the latest weekly-average weigh-in, otherwise Settings.
- Until you log a real weigh-in, it says the numbers come from Settings and links to Progress.
- Phase 0's calorie band is unchanged: it comes from brief §3. If the weekly trend still falls, Progress already suggests +200 kcal.

**10. Training.**
- **Warm-up:** each session has a numbered warm-up of 10–11 min. Each step has a name, how to do it, a dose and its minutes, in this order: 5 min easy cardio, 2–3 drills for the day, 3 lighter sets for the first lift. Later heavy lifts get 1 lighter set each.
- **Session time** is now explicit: warm-up + sets × (work + rest) + 1 min setup per exercise + finisher.
- **Session length, real arithmetic (min):**

  | Session | Week 1 | Week 3+ | Easy (deload) week |
  |---|---|---|---|
  | Lower A | 63.8 | 73.0 | 56.3 |
  | Upper A | 65.7 | 72.2 | 56.5 |
  | Lower B | 41.0 | 44.7 | 32.2 |
  | Upper B | 37.3 | 44.2 | 33.0 |

- **To fit the caps:**
  - Some isolation rests went from 90 s to 60 s, still within the cited 60–90 s.
  - Upper B dropped the cable row; back still gets 9 hard sets a week.
  - Two Saturday accessories went from 3 sets to 2.
- **Plain language:** the text was rewritten and a "Words used here" glossary added.
- **Tabs:** on phones the Training tabs now wrap. At 320 px, Cardio and Progression were hidden off-screen, as your review suspected.

### Where I disagree or push back
- **"Fruit should change through the year."** Agreed for Meal 1. Banana and papaya are sold all year, so I kept them where they work best (banana is a good pre-workout fruit). I didn't swap in a less suitable fruit just to be different.
- **"Dairy carries much of the protein."** True, and **not fixed: it got higher.** Milk and curd now come to 880–1,214 g a day (vegetarian plan 1,131–1,214 g), against about 900 g in Round 1. The solver chose more dairy because it is the low-fibre source of protein, riboflavin, B12 and calcium that fits under the fibre caps. I put no limit on dairy. It is within the rules you gave and you tolerate dairy well, but it is a lot. **Suggested next step:** add a dairy cap (e.g. 800 g/day) to the solver and accept smaller margins on B2, B6 and E. The amount is shown per plan on Groceries & cost and in `docs/plan-report.md`.
- **"Phase 0 iron and zinc fall short."** Iron was never below the EAR. Zinc now meets the EAR in 10 of 12 Phase 0 variants. Phase 0's binding limits are calories and fibre, not cost: vitamin E, thiamine and B6 also stay below the EAR in most Phase 0 variants. Phase 0 lasts 2 weeks; the solver's best is shown in the app, not hidden.
- **ICMR's B6 EAR (2.1 mg) is almost twice the US value (1.1 mg).** The plans meet the US value easily; against ICMR's, B6 is the one nutrient still short in Phase 2 (4 of 12 variants, by ≤ 0.15 mg). I kept ICMR as the standard and say so, rather than switch standards to make the table green.

### Results (default prices; from `npm run plans:report`, also in `docs/plan-report.md`)

The amounts in `lib/data/plan-quantities.generated.ts` came from `TL=150 GAP=0.005 npm run solve` (HiGHS stopped at its 150 s limit in each phase). The script's defaults are now a 2% gap with a 900 s limit. **A rerun can give slightly different grams when the time limit is reached; every rerun still has to pass the same tests.**

| Phase | Season | Plan | kcal | Protein g | Fibre g | Fat % | Milk+curd g/day | Morning min (weekdays) | ₹/month | Below EAR (weekly avg) |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Winter | Vegetarian | 2102–2289 | 87–90 | 33–35 | 29–30 | 1131 | 14 | 4,644 | Zinc 14/14 mg; Thiamine (B1) 1.4/1.5 mg; Vitamin B6 1.4/2.1 mg; Vitamin E 8.5/12 mg |
| 0 | Winter | Veg + eggs | 2099–2292 | 90–94 | 33–35 | 29–29 | 1006 | 13 | 4,611 | Thiamine (B1) 1.3/1.5 mg; Riboflavin (B2) 2.1/2.1 mg; Vitamin B6 1.4/2.1 mg; Vitamin E 9.3/12 mg |
| 0 | Winter | Non-veg | 2108–2296 | 86–93 | 30–35 | 28–30 | 939 | 13 | 4,797 | Thiamine (B1) 1.3/1.5 mg; Riboflavin (B2) 2.0/2.1 mg; Vitamin E 10.0/12 mg |
| 0 | Summer | Vegetarian | 2274–2295 | 86–92 | 33–35 | 27–30 | 1131 | 14 | 4,721 | Thiamine (B1) 1.3/1.5 mg; Vitamin B6 2.0/2.1 mg; Vitamin E 8.6/12 mg |
| 0 | Summer | Veg + eggs | 2269–2299 | 89–94 | 32–35 | 27–29 | 1006 | 13 | 4,708 | Thiamine (B1) 1.3/1.5 mg; Vitamin B6 2.1/2.1 mg; Vitamin E 9.6/12 mg |
| 0 | Summer | Non-veg | 2278–2300 | 87–93 | 31–35 | 27–29 | 939 | 13 | 4,873 | Thiamine (B1) 1.2/1.5 mg; Riboflavin (B2) 2.1/2.1 mg; Vitamin E 10.0/12 mg |
| 0 | Monsoon | Vegetarian | 2286–2298 | 86–92 | 33–35 | 27–29 | 1131 | 14 | 4,812 | Thiamine (B1) 1.3/1.5 mg; Vitamin B6 2.0/2.1 mg; Vitamin E 8.7/12 mg |
| 0 | Monsoon | Veg + eggs | 2270–2300 | 89–94 | 32–34 | 27–29 | 1006 | 13 | 4,783 | Thiamine (B1) 1.3/1.5 mg; Vitamin B6 2.1/2.1 mg; Vitamin E 9.7/12 mg |
| 0 | Monsoon | Non-veg | 2292–2300 | 86–94 | 29–34 | 27–29 | 939 | 13 | 4,943 | Thiamine (B1) 1.2/1.5 mg; Riboflavin (B2) 2.1/2.1 mg; Vitamin E 10/12 mg |
| 0 | Autumn | Vegetarian | 2127–2259 | 86–91 | 33–35 | 29–30 | 1131 | 14 | 4,825 | Zinc 14/14 mg; Thiamine (B1) 1.3/1.5 mg; Vitamin B6 1.4/2.1 mg; Vitamin E 8.8/12 mg |
| 0 | Autumn | Veg + eggs | 2127–2266 | 89–93 | 33–35 | 29–29 | 1006 | 13 | 4,814 | Thiamine (B1) 1.3/1.5 mg; Vitamin B6 1.5/2.1 mg; Vitamin E 9.4/12 mg |
| 0 | Autumn | Non-veg | 2139–2297 | 87–92 | 30–35 | 28–30 | 939 | 13 | 5,015 | Thiamine (B1) 1.3/1.5 mg; Vitamin E 10/12 mg |
| 1 | Winter | Vegetarian | 2349–2502 | 100–102 | 36–40 | 29–30 | 1166 | 14 | 5,008 | Vitamin B6 1.6/2.1 mg; Vitamin E 11/12 mg |
| 1 | Winter | Veg + eggs | 2316–2476 | 104–107 | 36–40 | 28–30 | 915 | 13 | 4,917 | Riboflavin (B2) 2.1/2.1 mg; Vitamin B6 1.6/2.1 mg; Vitamin E 12/12 mg |
| 1 | Winter | Non-veg | 2320–2504 | 100–107 | 33–40 | 27–30 | 881 | 13 | 5,173 | Thiamine (B1) 1.5/1.5 mg; Riboflavin (B2) 2.1/2.1 mg; Vitamin E 12/12 mg |
| 1 | Summer | Vegetarian | 2457–2509 | 101–102 | 36–39 | 28–29 | 1166 | 14 | 5,038 | Thiamine (B1) 1.5/1.5 mg; Vitamin B6 2.0/2.1 mg; Vitamin E 11/12 mg |
| 1 | Summer | Veg + eggs | 2418–2485 | 105–107 | 36–40 | 28–29 | 915 | 13 | 4,981 | Thiamine (B1) 1.4/1.5 mg; Vitamin B6 2.1/2.1 mg; Vitamin E 12/12 mg |
| 1 | Summer | Non-veg | 2404–2510 | 101–106 | 33–40 | 27–29 | 881 | 13 | 5,153 | Thiamine (B1) 1.3/1.5 mg; Riboflavin (B2) 2.1/2.1 mg |
| 1 | Monsoon | Vegetarian | 2458–2509 | 100–103 | 36–40 | 28–29 | 1166 | 14 | 5,132 | Thiamine (B1) 1.5/1.5 mg; Vitamin B6 2.1/2.1 mg; Vitamin E 12/12 mg |
| 1 | Monsoon | Veg + eggs | 2416–2480 | 105–107 | 36–40 | 28–29 | 915 | 13 | 5,018 | Thiamine (B1) 1.4/1.5 mg; Vitamin B6 2.1/2.1 mg |
| 1 | Monsoon | Non-veg | 2393–2509 | 100–106 | 33–40 | 27–29 | 881 | 13 | 5,188 | Thiamine (B1) 1.4/1.5 mg |
| 1 | Autumn | Vegetarian | 2399–2484 | 100–101 | 38–40 | 29–30 | 1166 | 14 | 5,294 | Vitamin B6 1.7/2.1 mg; Vitamin E 12/12 mg |
| 1 | Autumn | Veg + eggs | 2358–2458 | 104–106 | 39–40 | 28–29 | 915 | 13 | 5,193 | Thiamine (B1) 1.5/1.5 mg; Vitamin B6 1.7/2.1 mg; Vitamin E 12/12 mg |
| 1 | Autumn | Non-veg | 2355–2507 | 100–105 | 35–40 | 27–29 | 881 | 13 | 5,424 | Thiamine (B1) 1.4/1.5 mg |
| 2 | Winter | Vegetarian | 2560–2674 | 110–121 | 48–50 | 28–30 | 1214 | 14 | 5,581 | Vitamin B6 1.9/2.1 mg |
| 2 | Winter | Veg + eggs | 2562–2626 | 116–124 | 48–50 | 27–29 | 928 | 13 | 5,533 | Vitamin B6 2.0/2.1 mg |
| 2 | Winter | Non-veg | 2565–2686 | 110–124 | 43–50 | 26–30 | 884 | 13 | 5,695 | — |
| 2 | Summer | Vegetarian | 2634–2687 | 111–121 | 44–50 | 29–29 | 1214 | 14 | 5,596 | — |
| 2 | Summer | Veg + eggs | 2582–2635 | 114–124 | 44–49 | 28–29 | 928 | 13 | 5,550 | — |
| 2 | Summer | Non-veg | 2582–2686 | 111–124 | 39–49 | 26–29 | 884 | 13 | 5,700 | — |
| 2 | Monsoon | Vegetarian | 2648–2688 | 110–121 | 44–49 | 28–29 | 1214 | 14 | 5,535 | — |
| 2 | Monsoon | Veg + eggs | 2594–2633 | 114–124 | 44–48 | 28–29 | 928 | 13 | 5,434 | — |
| 2 | Monsoon | Non-veg | 2594–2688 | 110–124 | 39–48 | 26–29 | 884 | 13 | 5,596 | — |
| 2 | Autumn | Vegetarian | 2598–2654 | 111–121 | 46–50 | 29–30 | 1214 | 14 | 5,696 | Vitamin B6 2.0/2.1 mg |
| 2 | Autumn | Veg + eggs | 2563–2594 | 115–124 | 46–49 | 28–29 | 928 | 13 | 5,542 | Vitamin B6 2.1/2.1 mg |
| 2 | Autumn | Non-veg | 2563–2677 | 111–124 | 39–49 | 26–30 | 884 | 13 | 5,700 | — |

Phase bands: 0: 2090–2310 kcal, 86–95 g protein, fibre ≤ 35 g · 1: 2280–2520 kcal, 100–110 g protein, fibre ≤ 40 g · 2: 2550–2700 kcal, 110–125 g protein, fibre ≤ 50 g.

Summary of the weekly averages below the EAR (from `tests/known-gaps.json`, 70 of the 36 × 22 checks):
- **Phase 0 (2 weeks):**
  - thiamine 12/12 variants, vitamin E 12/12, B6 8/12, riboflavin 4/12, zinc 2/12;
  - all within ~30% of the EAR, except vitamin E (8.5–10 of 12 mg) and B6 (1.4–2.1 of 2.1 mg).
- **Phase 1:** B6 8/12, thiamine 9/12, vitamin E 8/12, riboflavin 3/12, mostly within 5%.
- **Phase 2:** only B6, in 4/12 variants, by ≤ 0.15 mg.
- Iron, zinc (Phases 1–2), calcium, magnesium, folate, B12, vitamin C and vitamin A meet the EAR in every Phase 1–2 variant. A test enforces this for Phase 2.

### Checks run (2 Nov 2026)

`npm test`:
```
ℹ tests 466
ℹ pass 466
ℹ fail 0
```

`npx tsc --noEmit`: no output (pass).

`npm run lint`: no errors, no warnings.

`npx next build`:
```
✓ Compiled successfully
✓ Generating static pages using 11 workers (12/12)
○ / /health /meal-plans /meal-plans/cards /nutrition /progress /recovery /settings /training (all static)
```

**Browser** (production build, Chrome via Playwright, 320 px and 1280 px):
- Covered all 9 routes, the 3 extra Meal-plan tabs, and the winter, summer and monsoon seasons.
- 0 px horizontal overflow and 0 console errors everywhere.
- Meal 1 titles change with the season: orange (kinnow) → muskmelon → mango.
- The Health to-do reads "lost about 4 kg (68 → 64 kg) … These weights come from Settings, not a weigh-in yet".
- On phones the section tabs then got `wrap`.

**`npm run links`:**
- 198 links: 186 ok, 2 redirected, 10 blocked automated access, 0 failed.
- The 2 redirects (Health Canada) are now updated to their new URLs.
- Blocked: NIH ODS (5), EFSA DOIs (3), npmjs.com, ranveerbrar.com.

### Not verified
- **Season boundaries.** I could not open an official month-by-month market calendar: the Government of India harvest-season appendix (desagri.gov.in) fails TLS verification, and Vikaspedia pages need JavaScript. The seasons follow the standard crop seasons and are labelled approximate, with a Settings override.
- **Prices.** New seasonal produce, sunflower seeds and rice-bran oil are rough estimates (Nov 2026), not checked against any listing. Earlier prices were not re-checked.
- **NASEM values.** Taken from Health Canada's tables (read through a fetch tool; NCBI blocked automated access). The ICMR values were read from the official PDF.
- **IFCT copy.** The machine-readable IFCT is a third-party npm transcription (AGPL-3.0). It was spot-checked on 3 rows against the ICMR-NIN PDF, not checked in full. Only derived numbers are committed; the package is not a dependency.
- **Biotin and manganese.** Gaps remain for some foods (shown in the app).
- **Cooking losses** are not modelled. Raw-food values overstate vitamin C, folate and some B vitamins.
- **Session times** use estimated constants (40 s per set, 1 min setup), not timed sessions.
- **Mom's evening load** rises by the 15–20 min the lunches used to take in the morning. Not checked with her.
- **Vercel deploy** not checked.


## Round 1

Spec: `docs/brief.md` (audit-driven fix, 30 Oct 2026). Branch: `audit-fixes`. Merged to main on 2 Nov.

## Status

### Done (30 Oct 2026)
- [x] **1. Inspection.** Findings are below and were recorded before any change.
- [x] **2. Weight, phase and calorie model.**
  - One config, `lib/config.ts`, holds the profile (64 kg now, 68 kg six months ago, 180 cm, 24), the phases, the budget and the energy factors.
  - Phases:
    - Phase 0 (weeks 1–2): 2,090–2,310 kcal, 85.5–94.5 g protein, fibre ≤ 35 g, soya ≤ 20 g, sattu ≤ 25 g.
    - Phase 1 (weeks 3–4): 2,280–2,520 kcal, 99.75–110.25 g protein, fibre ≤ 40 g.
    - Phase 2 (week 5+): 2,550–2,700 kcal, 110–125 g protein, fibre ≤ 50 g.
    - Fat is 25–30% of energy in every phase.
  - kcal are computed from the macros: 4/4/9, plus 2 kcal per g of fibre (FAO 2003). Carbs are available carbohydrate.
  - Settings now has an Auto/0/1/2 phase override and an optional current-intake estimate.
  - Old saved settings are migrated: the "Preferred" plan → Vegetarian, a stored 66 kg → 64 kg, and the morning/evening toggle is removed.
- [x] **3. Meal structure, 3 plans × 3 phases.** The "Preferred" plan is removed.
  - Weekday Meal 2 is a cold office lunch: sattu paratha, paneer/egg/soya/chicken rolls, besan chilla, aloo-paneer paratha. No rice, dal, gravy or reheating.
  - Meal 3 is the same Mon–Fri at 6:15–6:45 PM, with no cooking.
  - Meal 1 is the same every day and takes ≤ 10 minutes.
  - Every meal has quantities per phase, household measures, steps, active and total time, pots (≤ 2), swaps, flavour and micronutrients.
  - Printable dinner cooking cards are at `/meal-plans/cards`.
  - The cold-lunch rule follows USDA guidance (via Purdue Extension): two cold sources, refrigerate on arrival, 2 h out of the fridge (1 h above ~32 °C).
  - Quantities were solved with a linear programme. It applies every phase band, the fibre caps, fat 25–30%, the Phase 0 soya and sattu caps, the cross-plan spread, a vitamin C floor, and weekly zinc and iron floors, with realistic portion limits.
- [x] **4. Training.**
  - Saturday Lower A and Sunday Upper A are fixed, 60–75 min each.
  - Lower B (Mon–Wed) and Upper B (Tue–Fri) are ≤ 45 min with 5 exercises, and are offered only before 9:00 PM.
  - Never two sessions a day; a missed session is skipped, not made up.
  - Removed: the 7–8:30 PM default, the "slept by 11:30" gate and the catch-up slots.
  - Added: RIR with RPE, injury prevention, a deload at the latest every 8–10 weeks, and a 12:30 AM bedtime.
- [x] **5. Health.**
  - New to-do card: dermatologist, tell the doctor about the ~4 kg loss, and ask for ferritin, zinc, folate and active B12.
  - The hair text is replaced: weight loss is a plausible trigger and needs a dermatologist. The AAD's 20 lb threshold is stated.
  - B12 is shortened to: test, course, retest, doctor decides. The lung-cancer cohort detail is dropped.
  - The stray "₹3,000–4,000" is removed.
  - The diet coverage table now shows Phase 0 → Phase 2.
- [x] **6. Budget and prices.**
  - `BUDGET` is the only source for every "within/above target" label (target ₹4,000–4,500, range ₹3,000–6,000).
  - `lib/data/prices.ts` holds the prices, all labelled as estimates as of 2026-10.
  - Settings → Prices edits them in localStorage, and every cost recomputes (checked in the browser).
  - The meal-plan page shows cost per serving and per 10 g protein for 17 ingredients, and per 10 g protein for each plan.
- [x] **7. Tests** (`npm test`, 104 tests, built-in Node runner via tsx, no new dependency). Covered:
  - 7 days × 4 meals; Meal 1 and weekday Meal 3 identical; weekday Meal 2 with no reheating, rice, dal or gravy.
  - Phase bands, fibre caps, fat %, the Phase 0 soya and sattu caps.
  - kcal reconciliation ≤ 3% (macros, and the food table per day); cross-plan spread ≤ 5%.
  - Grocery and monthly cost from the price table; budget labels from the config, with no hard-coded budget figures.
  - Training limits and schedule rules; weight decisions.
  - `scripts/validate-plans.ts` is replaced by these tests.
- [x] **8. Responsive, accessibility and performance.**
  - All 9 routes (and their tabs) were checked at 320/375/768/1280 px in Chrome against the production build: 0 horizontal overflow, 0 console errors.
  - Fixed overflows on Settings, the cooking cards and Training.
  - Added `app/error.tsx`, print styles and 40 px selects.
  - JS per route went from 278 KB to 255 KB compressed (/progress 384 → 361 KB, Recharts), measured on the production build.
- [x] **9. Link check** (`npm run links` → `docs/link-report.md`): 193 links, 185 OK, 8 blocked automated access, 0 failed.
  - Two links followed redirects and were updated: WHO salt → sodium-reduction, and Food Standards Scotland rice → food storage.
  - The Food Standards Scotland page says hard-boiled eggs keep 2 days, so eggs are now boiled the night before (was a Sun/Wed batch).

### Results (default prices; per day, every day of the week)

| Phase | Plan | kcal | Protein | Fibre | ₹/month | ₹/10 g protein |
|---|---|---|---|---|---|---|
| 0 | Vegetarian | 2,171–2,230 | 87–91 | 33–34 | ≈ 4,390 (within target) | 15.3 |
| 0 | Veg + eggs | 2,157–2,202 | 88–93 | 34 | ≈ 4,380 (within) | 14.9 |
| 0 | Non-veg | 2,163–2,246 | 88–93 | 31–34 | ≈ 4,700 (above) | 16.0 |
| 1 | Vegetarian | 2,401–2,439 | 101–103 | 37–40 | ≈ 4,720 (above) | 14.5 |
| 1 | Veg + eggs | 2,357–2,400 | 103–107 | 37–39 | ≈ 4,800 (above) | 14.2 |
| 1 | Non-veg | 2,362–2,453 | 101–106 | 34–38 | ≈ 5,140 (above) | 15.5 |
| 2 | Vegetarian | 2,623–2,654 | 111–114 | 42–48 | ≈ 5,150 (above) | 14.4 |
| 2 | Veg + eggs | 2,584–2,615 | 115–119 | 40–47 | ≈ 5,200 (above) | 14.0 |
| 2 | Non-veg | 2,585–2,629 | 112–118 | 35–45 | ≈ 5,630 (above) | 15.4 |

Micronutrients (weekly average, all plans):
- Iron: 14 mg in Phase 0, 18–19.5 mg in Phase 2.
- Zinc: 13.0–13.1 mg in Phase 0, 15.4–15.8 mg in Phase 2.
- Vitamin C ≥ 128 mg on every day.
- Calcium 1,290–1,640 mg.
- B12: 3.5–4.8 µg.

### In progress
- (none)

### Blocked
- (none)

### Unverified or known gaps
- **Prices** are estimates and not re-checked this session. Phase 1–2 costs are above the ₹4,500 target but under ₹6,000. The main driver is dairy (~900 g/day), the low-fibre protein that lets the plans meet protein under the fibre caps.
- **Zinc in Phase 0** is ~13.0 mg against the 14.1 mg average requirement (ICMR 2020) for those 2 weeks. It is infeasible under the 35 g fibre cap with these foods; Phases 1–2 meet it.
- **Iron** is near the 19 mg RDA only in Phase 2; it is above the 11 mg average need in every phase.
- **Omega-3 (ALA)** is not computed. The plans contain little; the Health page suggests 1 tbsp of flaxseed as an option.
- **Blocked to automated checks, so content not re-read:** NIH ODS fact sheets (5), EFSA DOIs (3), USDA FSIS and FoodSafety.gov (cold-lunch guidance is cited via Purdue Extension, which restates FSIS).
- **Household cup weights:** USDA values for rice, lentils, oats, besan, atta and yogurt; the rest are kitchen approximations.
- **New foods:** potato values are USDA SR Legacy 170026; its ₹35/kg price is an estimate.
- **Session lengths** are estimates (warm-up 11 min + sets × (work + rest) + a 10-min weekend finisher), not timed. Deload weeks are shorter than 60 min by design.
- **Weekend training time** (late morning) is an assumption; the brief doesn't say.
- **Photo tracking** stores only the date; photos stay on the phone (no backend).
- **Food-table kcal:** individual foods differ from 4/4/9 + 2·fibre by up to ~15% (e.g. peanuts +10%). Day totals agree within ~2%.
- **The linear programme** (`solve.py`, SciPy) lives in the session scratchpad, not in the repo. Quantities in `lib/data/meal-plans.ts` are its rounded output, then hand-adjusted where the tests showed a rounding miss.
- **Production deploy** (Vercel) was not checked; only local production builds were.

## Inspection findings (30 Oct 2026, before any change)

Measured with scripts in the session scratchpad; nothing below is guessed.

**Profile and targets**
- `lib/storage.ts` defaults: start weight 66 kg, plan `preferred`, a morning/evening `trainingTime` toggle. The sample data (`lib/data/sample.ts`) trends up from 66 kg; the Progress weight field's placeholder is 66.0.
- `lib/data/nutrition-guide.ts` and `/nutrition`: Mifflin-St Jeor with 66 kg, maintenance "≈ 2,450–2,700 kcal", fixed target 2,700 kcal (2,600–2,800), and "Your weight is currently stable". All wrong for 64 kg after losing ~4 kg on < 2,000 kcal.
- The dashboard's calorie and protein bars use the fixed 2,700 kcal / 125 g targets.
- The checkpoint is 72 kg (`lib/progress.ts`, `GAIN_RULES`); the brief sets 68 kg.
- There are no phases: every plan is built for 2,500–2,900 kcal from day 1.

**Macros**
- Carbs in `foods.ts` are available carbohydrate (fibre excluded); this is not shown in the UI.
- Day totals reconcile with 4/4/9 + 2 kcal/g fibre to within −1.8% to +0.2%.
- Per food, some tabulated kcal disagree with their macros: peanuts +10%, watermelon seeds +8%, soya chunks −8%, lemon +45%.
- "Spread across 4 meals of ~25–40 g" (protein target text) is wrong. Actual per-meal protein ranges 15–49 g (Meal 3: 15–24 g; dinners up to 49 g).

**Meal plans** (`lib/data/meal-plans.ts`, 4 plans)
- The "Preferred" plan still exists.
- Weekday Meal 2 is last night's dinner, packed. It includes rice on 4 of 5 weekdays (2 in non-veg), plus dal, rajma and gravies. The office food-safety text assumes reheating or a hot insulated box. Each of these breaks the new Meal 2 rule.
- The meal times also break the brief:
  - Meal 3 is set for 4:45–5:15 PM; the brief puts it at 6:15–6:45 PM, before the gym.
  - Meal 4 is set for 8:45–9:30 PM; the brief puts it at 9:30–10:30 PM.
- Fibre is 44–69 g/day in every plan, above all three new phase caps (35 / 40 / 50 g).
- Soya reaches 55–70 g/day and sattu 105 g/day (Preferred). The Phase 0 caps are 20 g and 25 g.
- Meals have hands-on minutes but no total time, no per-meal substitutions, no per-meal micronutrients and no cooking cards.

**Training** (`lib/data/training.ts`, `lib/training.ts`, `/training` with tabs Today, Week & rescheduling, Program, Cardio & mobility, Progression)
- Default week: lifting Mon, Tue, Thu, Fri; cardio Wed and Sat; rest Sun.
- Each session is 60–70 min with 6–7 exercises. The brief wants weekday sessions of ≤ 45 min and ≤ 5 exercises.
- The Today view offers Wed/Sat "catch-up slots", which are catch-up volume the brief forbids.
- Rules still say "Missed the morning session → do it that evening" and "only choose mornings when you slept by ~11:30 PM". `TRAINING_DAY.evening` says "default, ~7–8:30 PM".
- `NEVER_DO`, progression, deload signals, RIR, cardio and mobility content are sound and can be kept.

**Progress**
- `assessGain` needs 4 weekly averages and has no rule for a falling trend: "too slow" only adds +150 kcal, and there is no doctor prompt.
- The waist chart's 85/90 cm lines and its 70–92 axis are hard-coded, not derived from height.
- Past dates can be entered already, but there is no way to mark a recalled weight (e.g. "68 kg six months ago"). Such a weight would be averaged into the trend.
- Waist, strength (e1RM), consistency and adherence charts work; there is no photo tracking at all. The current "photos" support is advice text only.

**Recovery and dashboard**
- Bedtime advice is "~11:30 PM–midnight" (`lib/data/recovery.ts`, `DashboardView.tsx:469`). The brief's target is 12:30 AM with waking at 7–8:30.

**Settings**
- No price table, phase, current-intake estimate or historical weight.

**Health**
- Hair: "The plan provides ~125 g of protein and a small calorie surplus, which removes these as possible causes" (`lib/data/health.ts:174`). This must be replaced.
- Supplement note says "₹3,000–4,000 food budget".
- The B12 entry is long and includes the lung-cancer cohort detail.
- There is no top-of-page to-do list.

**Budget and prices**
- `BUDGET_MIN/MAX = 3000/4000` live in `lib/meal-plans.ts`, and budget wording is repeated in several data files.
- Prices are constants in `foods.ts` with one shared "Oct 2026" comment and no per-item date. They can't be edited in the app, and totals are computed once at module load.

**Tests and tooling**
- No test runner; `scripts/validate-plans.ts` is the only check.
- No link checker.

**Performance baseline** (production build, `next start`, local Chrome at 375 px; compressed transfer):

| Route | JS | Total | FCP |
|---|---|---|---|
| `/` | 278 KB | 326 KB | 56 ms |
| `/training` | 278 KB | 327 KB | 56 ms |
| `/meal-plans` | 278 KB | 333 KB | 124 ms |
| `/nutrition` | 278 KB | 344 KB | 160 ms |
| `/health` | 278 KB | 356 KB | 112 ms |
| `/progress` | 384 KB | 435 KB | 64 ms |
| `/recovery` | 302 KB | 356 KB | 80 ms |
| `/settings` | 302 KB | 351 KB | 48 ms |

All routes are static. Local FCP is not representative of a phone on mobile data; the JS size is the useful number.

## History (before this brief)

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
