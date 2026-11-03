# Progress

## Round 6 (3 Nov 2026): branch `round6-cleanup`, not pushed

Small cleanup only.

### Status
- [x] **Personal details** removed from this file and `docs/brief*.md`. The engineering history is kept. Each brief has a one-line note saying what was removed.
- [x] **Recovery → "Am I recovering?":** the signs no longer depend on logged lifts.
  - Good: "Your usual weights feel the same or lighter".
  - Warning: "Weights feeling heavier than usual for several sessions in a row".
- [x] **Nutrition → "When to change the food"** is simpler and needs only the weekly weigh-in.
  - Removed: the waist rule, the pre-loss checkpoint, and the target-weight callout with its 2 references.
  - Kept: the Phase 0 rule, the Phase 2 "+150 kcal after 4 weeks" rule, the "slow down" rule and the "maintain when life is busy" rule.
- Blocked: none. Nothing pushed.

### Still in git history
- Personal data appears from `4fe085b` onward:
  - in the code: blood results, weights and health notes, until Rounds 4–5 removed them;
  - in `docs/brief*.md` and `PROGRESS.md`, up to `f90a242` (the current `origin/main`).
- 5 branches on GitHub hold it: `main`, `audit-fixes`, `round2-seasonal`, `round4-fixes` and `round5-fixes`.
- Some commit messages also name the features, e.g. `a7907b3` "Blood results: vitamin D …".
- Merging this branch cleans only the current files.

### To rewrite it safely (not done; each step needs your go-ahead)
1. Make the GitHub repo private first, so nothing more is copied while you work.
2. Make a mirror backup: `git clone --mirror git@github-hp:Mahto-rajiv/health-plan.git hp-backup.git`.
3. In a fresh clone, run `git filter-repo`:
   - `--replace-text` with a list of the personal strings, to remove them from every file in every commit;
   - `--path docs/brief.md --invert-paths` and similar if you'd rather drop whole files;
   - `--replace-message` for the commit messages.
4. Check the result before pushing: `git log --all -S'<string>'` should return nothing for each string, and the tests and build should still pass at the new `main`.
5. Force-push all branches and delete the old ones on GitHub. This is a destructive step.
6. Ask GitHub Support to remove cached views of the old commits. Old SHAs can stay reachable by URL until then.
7. Re-clone every local copy. Vercel keeps old deployments, so delete those if they matter.

Anyone who already cloned or forked the repo keeps the old history; a rewrite can't recall it.

## Round 5 (3 Nov 2026): branch `round5-fixes`, merged to main and pushed

The brief: make the app view-only and simple; remove tracking and medical content; fix saturated fat and the beetroot swap.

### Status
- [x] **Saturated fat** is in the audit and is a hard limit in the solver: under 10% of energy every day (`615c513`).
- [x] **Beetroot for carrot:** the swap note says "almost no vitamin A" at any amount (`d928305`).
- [x] **View-only:** tracking, Health, Progress and Settings removed; the phase follows the date (`eaf0319`).
- Blocked: none. Nothing pushed.

### Saturated fat
- **Before (Round 4 plans): every plan was over the limit.** Weekly averages as % of energy:
  - Phase 0: vegetarian 13.5, egg 12.9, non-veg 12.4;
  - Phase 1: 12.7, 12.0, 11.7;
  - Phase 2: 12.8, 12.1, 11.4.
- **Why the menu changed, not only the solver.** With whole-milk values, a 10% daily limit was infeasible in Phase 0 even at ₹9,000. It became feasible only with fibre at 42 g or more, or with the limit at 12%. So milk and curd now use double-toned milk: USDA SR28 01174, "2% fat, no added vitamins A/D", standing in for 1.5% Indian double-toned milk. Then all 9 plans solve.
- **After:** every day of every plan is under 10%. The highest day is 9.7%. Trans fat is 0.26–0.35% on average (limit 1%); that is a lower bound.

| Phase | Average cost (₹/month) | Milk + curd (g/day) | Shortfall score |
|---|---|---|---|
| 0 | 4,943 → 4,721 | 1,020 → 926 | 750 → 925 |
| 1 | 5,262 → 5,275 | 967 → 939 | 211 → 273 |
| 2 | 5,355 → 5,342 | 995 → 930 | 124 → 204 |

- **Nutrient effects:**
  - Riboflavin rose to 2.2–2.5 mg.
  - Vitamin A fell by about 100 µg.
  - Below the EAR: 4 → 5. Added: Phase 0 vegetarian B6.
  - ★ nutrients below the RDA: 34 → 31. Added: Phase 2 non-veg vitamin E. Removed: egg vitamin E (Phases 0 and 2), and Phase 2 vegetarian riboflavin and vitamin E.
- **Where it shows:**
  - The audit (Meal plans → Vitamins & minerals) has a "Fat limits" box: average, highest day and limit.
  - The plan report has a "Sat fat %" column.
  - `tests/plans.test.ts` checks every day.

### View-only: removed
| What | Why |
|---|---|
| Progress page, weight and waist log, charts, sample data, `lib/progress.ts` | Tracking |
| Today: weight card, meal ticks, "This week" adherence, recovery check-in | Tracking |
| Recovery check-in form | Tracking |
| Health page: test-result form, test explanations, symptom section, to-do list, diet coverage table | Medical. The audit is still on Meal plans → Vitamins & minerals. |
| Supplements whose dose depends on a test: vitamin D, B12, iron/zinc/biotin, multivitamin, omega-3; the quality and certification notes | Medical |
| Every referral and "get it checked" line; the `medical` Callout tone; 46 references only that content used | Medical |
| Settings page: personal entries, intake estimate, name, program start, phase override, deload toggle, price table, backup, restore, Reset | Tracking or stored input |
| Price overrides and the over-budget swap list | Reachable only with edited prices; at the default prices every plan is under the ceiling |
| Old storage keys (body, workouts, draft, meals, checkins, prices, blood) | Not read any more |
| `recharts` | Only the charts used it |

### Kept
- **Today:** the session and today's meals (calories and protein, no ticks), plus tonight's prep and tomorrow's session.
- **Training:** warm-ups, alternatives and swaps, the week, the program, cardio and mobility, progression, and easy (deload) weeks as text.
- **Meal plans:** swaps, the audit, grocery list, costs and food safety.
- **Nutrition:** targets, meal timing, gut ramp, hydration. Creatine and protein powder are now here.
- **Recovery:** the guidance only.
- **Safety lines, as plain "stop" wording:**
  - pain: "Sharp pain, joint pain, or tingling … Stop that exercise and use the listed alternative";
  - stomach red flags: "Stop changing the diet if you notice any of these: they are not a diet problem".
- **The footer:** "Educational guidance, not medical advice." It now shows on phones too.
- **Phase:** follows the date from `PROGRAM_START` (Mon 9 Nov 2026) in `lib/config.ts`. Before the start, the app shows "Starts Mon 9 Nov".
- **Weight rule (static):** weigh once a week. If you are still losing after 2 weeks in Phase 0, add 55 g raw rice at dinner (≈ 195 kcal).
  - Rice, because the extra keeps every Phase 0 day under 10% saturated fat (max 9.0%). Fibre goes to 36.2 g, just over the 35 g cap.
  - 37 g peanuts would reach 10.0%, and 400 ml milk 10.8%.
- **Phase 2 rate rules:** kept as text. Of the waist rules, only "half your height → stop gaining" is kept.

### Tests removed
- `tests/progress.test.ts`, which tested deleted features: weight decisions, Settings entries, test-result bands, no personal values in code.
  - Its "Starts Mon 9 Nov" test moved to `tests/training.test.ts`.
- The deload variants in the session-length tests: the deload computation is gone; the text remains.
- Added:
  - phase by date (weeks 1–2, 3–4, 5+);
  - an app-text check: no referral or medical wording except the footer (word list in `tests/budget.test.ts`).

### Not verified
- **Milk data:** 01174 is 2% fat, not 1.5%, so milk and curd fat is a little overstated, and so is saturated fat.
- **Milk price:** ₹58/L was not re-checked for double-toned milk.
- **Paneer saturated fat:** scaled from the IFCT fat correction, not checked against the PDF.
- **Trans fat:** the tables have no value for oil or oats.
- **Phase 0 solve:** stopped at the 120 s limit (not proven optimal).
- **Browser storage:** old keys (with personal entries) stay in a browser that used the old app. The app no longer reads them. Picking a plan rewrites the settings key with only the plan, which drops the old entries stored there. To clear everything, clear this site's data in the browser.
- **Stale docs:** `docs/cost-sweep.md` was not regenerated, so one column header still uses the old name for the ★ nutrients.
- **Vercel:** not checked this round.

## Round 4 (3 Nov 2026): branch `round4-fixes`, merged to main and pushed

The second brief pasted (6 items) is followed. From the first version, "Reset everything" was checked (item 5 there) and "when to add weight" was checked but not changed (see Notes).

### Status
- [x] 1. **Privacy:** personal values are out of the code. They are typed into the app and stored only in this browser (`3c4f9ea`, `a7907b3`).
- [x] 2. **"Starts Mon 9 Nov"** replaces the week number before the program start on Training, Dashboard and Settings (`4f6bf2e`).
- [x] 3. **Food swaps:** better choices, plus a note on what each swap loses (`27409af`).
- [x] 4. **Carrot** is now in the daily salad (`bb06f5b`).
- [x] 5. **Fat 35% and Phase 1 fibre 45 g:** both applied, because both help. `planningMax` stays ₹5,400 (`bb06f5b`).
- [x] 6. **Regenerated:** plan report, cost sweep and link check; browser check at 3 widths; removed tests listed below.
- Blocked: none. Nothing pushed.

### 1. Privacy
- Personal values were moved out of the code. They were typed into the app and kept only in the browser's localStorage. Round 5 removed those fields.
- The test fixtures and sample data use made-up values.
- What remains in git history: see Round 6.

### 2. "Starts Mon 9 Nov"
- New `startsLabel(start, today)` in `lib/dates.ts` returns "Starts Mon 9 Nov" before the start date, otherwise null.
- **Used on:**
  - the Training Today card;
  - the Dashboard badge;
  - Settings: the phase line ("Starts Mon 9 Nov → Phase 0 · Stop the loss") and the deload line.
- **Checked in the built app on 3 Nov:** all three screens show "Starts Mon 9 Nov", and no page shows "Program week".

### 3. Food swaps
| Main | Was | Now | What it still loses or adds (shown in the app) |
|---|---|---|---|
| Papaya 100–120 g | apple 40–50 g | **orange / kinnow** 70–90 g (same calories) | less folate and vitamin A. Keeps ~70% of the vitamin C (apple kept ~3%). |
| Banana 100–160 g | apple 160–260 g | **dates** 30–50 g (same calories) | less vitamin C and folate, +1 g fibre or less (apple was +2–4 g) |
| Cucumber (salad) | carrot | **radish** (same weight) | — |
| Carrot (salad, new) | — | **beetroot** (same weight) | less vitamin A |
| Spinach 190–300 g | amaranth | amaranth (unchanged) | less folate, +4–6 g fibre |
| Okra, lauki, kaddu | cauliflower, brinjal, carrot | unchanged | — |

- **Why dates:** in the food table, dates have the least fibre per calorie after banana itself, and they keep at home when the market runs out.
- **How the note works:** `swapNote()` in `lib/data/produce.ts` lists a vitamin (C, folate or A) when the swap gives under half of it and the main food gave at least 5% of the RDA. It also shows the fibre when the swap adds 1 g or more.
- **Where it shows:** meal cards and cooking cards, e.g. "Not in the market? Orange / kinnow, 70 g (less folate and vitamin A)".
- **No compensating food is added.** A swap is for a few days, so the note only says what changes.

### 4–5. Carrot, fat 35% and fibre 45 g: before and after
- **How the trials were run:** `TL=120 GAP=0.01`, planning ceiling ₹5,400, with the overrides applied in memory and nothing written. "base" is the Round 3 menu.
- **What the numbers are:** weekly averages, min–max over the 3 plans. The brackets give the EAR · RDA.

**Phase 0** (min–max over the 3 plans; dairy = phase average)

| | Round 3 | carrot | carrot,fat35 | carrot,fat35,fib45 |
|---|---|---|---|---|
| Iron mg (EAR 11 · RDA 19) | 11.7–12.7 | 11.6–12.6 | 12.2–13.3 | 12.2–13.3 |
| Zinc mg (14 · 17) | 14.2–14.7 | 14.3–14.7 | 15.0–15.5 | 15.0–15.5 |
| B1 mg (1.5 · 1.8) | 1.30–1.35 | 1.29–1.34 | 1.38–1.41 | 1.38–1.41 |
| B2 mg (2.1 · 2.5) | 2.01–2.10 | 2.01–2.10 | 2.10–2.13 | 2.10–2.13 |
| B6 mg (2.1 · 2.4) | 2.09–2.17 | 2.10–2.18 | 2.10–2.19 | 2.10–2.19 |
| E mg (12 · 15) | 10.4–12.0 | 10.5–12.0 | 14.2–15.1 | 14.2–15.1 |
| A µg (460 · 1000) | 593–690 | 625–773 | 636–798 | 636–798 |
| ₹/month | 4,615–4,843 | 4,615–4,842 | 4,841–5,114 | 4,841–5,114 |
| Milk + curd g/day | 969 | 971 | 1020 | 1020 |

**Phase 1** (min–max over the 3 plans; dairy = phase average)

| | Round 3 | carrot | carrot,fat35 | carrot,fib45 | carrot,fat35,fib45 |
|---|---|---|---|---|---|
| Iron mg (EAR 11 · RDA 19) | 14.6–15.6 | 14.5–15.6 | 15.4–16.9 | 16.1–16.4 | 17.5–18.1 |
| Zinc mg (14 · 17) | 16.1–16.3 | 16.2–16.4 | 16.9–17.2 | 16.5–16.8 | 17.1–17.5 |
| B1 mg (1.5 · 1.8) | 1.47–1.60 | 1.47–1.60 | 1.50–1.61 | 1.53–1.74 | 1.56–1.73 |
| B2 mg (2.1 · 2.5) | 2.09–2.24 | 2.09–2.25 | 2.15–2.25 | 2.10–2.23 | 2.16–2.27 |
| B6 mg (2.1 · 2.4) | 2.10–2.23 | 2.10–2.22 | 2.10–2.23 | 2.19–2.40 | 2.12–2.20 |
| E mg (12 · 15) | 12.0–12.9 | 11.9–12.8 | 14.9–15.0 | 13.1–14.7 | 14.8–15.0 |
| A µg (460 · 1000) | 639–806 | 686–895 | 736–975 | 717–966 | 754–996 |
| ₹/month | 4,871–5,193 | 4,873–5,197 | 5,108–5,395 | 4,989–5,396 | 5,143–5,399 |
| Milk + curd g/day | 942 | 947 | 977 | 909 | 967 |

**Phase 2** (min–max over the 3 plans; dairy = phase average)

| | Round 3 | carrot | carrot,fat35 | carrot,fat35,fib45 |
|---|---|---|---|---|
| Iron mg (EAR 11 · RDA 19) | 18.4–18.9 | 18.3–18.6 | 19.0–19.2 | 19.0–19.2 |
| Zinc mg (14 · 17) | 17.5–17.8 | 17.2–17.7 | 17.8–18.1 | 17.8–18.1 |
| B1 mg (1.5 · 1.8) | 1.68–1.89 | 1.66–1.88 | 1.67–1.83 | 1.67–1.83 |
| B2 mg (2.1 · 2.5) | 2.15–2.24 | 2.12–2.22 | 2.29–2.34 | 2.29–2.34 |
| B6 mg (2.1 · 2.4) | 2.29–2.39 | 2.23–2.39 | 2.24–2.26 | 2.24–2.26 |
| E mg (12 · 15) | 14.9–15.0 | 15.0–15.0 | 14.9–15.0 | 14.9–15.0 |
| A µg (460 · 1000) | 646–849 | 715–972 | 764–998 | 764–998 |
| ₹/month | 5,088–5,399 | 5,087–5,399 | 5,270–5,399 | 5,270–5,399 |
| Milk + curd g/day | 901 | 880 | 995 | 995 |

**What was applied, and why**
- **Carrot in the salad (shares: cucumber 0.3, carrot 0.2, onion 0.25, tomato 0.25):**
  - vitamin A +30 to +120 µg a day, at the same cost (±₹30);
  - other nutrients within ±0.1;
  - the solver's shortfall score falls in every phase (P0 1,230 → 1,187; P1 700 → 648; P2 291 → 210).
- **Fat up to 35% of energy (`DAILY.fatEnergy` [0.25, 0.35]):**
  - **What it helps:** vitamin E in Phases 0–1 goes from below the EAR to 14–15 mg. Iron, zinc, B1 and B2 also rise. The shortfall score falls 37–50% (P0 1,187 → 750; P1 648 → 322; P2 210 → 124).
  - **What it costs:** ₹150–280 a month more on average per phase (up to ₹400 for one plan), and milk + curd +50 g/day (P0) to +115 g/day (P2). Phase 2 B6 drops from 2.23–2.39 to 2.24–2.26 mg (still above the EAR).
  - **Where the extra fat comes from:** the solver used it for more oil, curd and paneer, and less rice. It did not go to nuts.
  - **It breaks a guideline:** 35% is above the WHO and ICMR-NIN advice of ≤ 30% of energy, and inside the US/Canadian range of 20–35%. The Nutrition page now says so.
  - **Easy to reverse:** go back to 30% (one number in `lib/config.ts`, then `npm run solve`) if you prefer to follow WHO/ICMR.
- **Phase 1 fibre cap 45 g (was 40):**
  - **Alone:** iron +1.5, zinc +0.5, B1 +0.1, B6 +0.1–0.2, vitamin E +1–2, and milk + curd −38 g/day, for ₹30–270 a month more.
  - **Combined with 35% fat:** Phase 1 has no gap below the EAR.
  - **Gut:** Phase 1 starts after two weeks at 35 g.
- **Result after the final solve:**
  - Weekly averages below the EAR: **16 → 4**. All 4 are in Phase 0: thiamine (1.38–1.41 of 1.5 mg) in all three plans, and the egg plan's B6, right at the EAR.
  - ★ nutrients below the RDA/AI: 33 → 34. Eight riboflavin and vitamin E entries moved up from "below the EAR" to "below the RDA", which adds them to this list. Seven entries left it: Phase 1 zinc in all three plans, Phase 2 iron (egg and non-veg), and the non-veg vitamin E (Phases 1 and 2) now meet the RDA.
  - **Dairy:** the vegetarian plan now uses 1,086–1,099 g/day of milk + curd, just under the 1,100 g backstop. This goes against "dairy should not carry the diet".

### 6. Reports, links, browser
- `docs/plan-report.md` was regenerated (output below).
- `docs/cost-sweep.md` was regenerated (`TL=120 GAP=0.01 npm run solve:sweep`, output below).
- **Links:** `npm run links`: 199 links, 190 ok, 0 redirected, 9 blocked automated access (EFSA ×3, NIH ODS ×5, npmjs.com), 0 failed.
- **Browser check:** headless Chrome over CDP against the production build (`next start`), with a script in the scratchpad (not committed).
  - Every route (/, /training, /meal-plans, /meal-plans/cards, /nutrition, /health, /progress, /recovery, /settings) at 375, 768 and 1280 px.
  - Run twice: with empty storage, and with made-up sample entries in localStorage.
  - **54 page loads: 0 px horizontal overflow, 0 console errors or exceptions.**
  - Text checked:
    - "Starts Mon 9 Nov" on /, /training and /settings;
    - no "Program week";
    - with empty storage, the entry prompts appear;
    - with the sample entries, the values computed from them appear;
    - swap notes appear on both meal pages.
  - I looked at one screenshot (/health at 375 px, sample data) by eye. The rest were checked by these numbers and text only.

### Tests removed since `efc6611~1`
Compared the `it(...)`/`describe(...)` names at `efc6611~1` with now (`git show efc6611~1:tests/*.ts` against the working tree). 15 names are gone and 31 are new (including this round's). The count went from 466 (at `efc6611~1`) to 165 at the end of Round 3 and is 173 now. The drop happened mostly because the per-plan tests ran once per season (36 variants), and now run once per plan × phase (9).

| Removed test | Commit | Why |
|---|---|---|
| `describe(… · phase … · ${season})` and `it(phase …, ${s}: the same day …)` | `9f089ff` | Seasons removed. Same tests now run per plan × phase: `describe(… · phase …)`, `it(phase …: the same day …)`. |
| `describe('seasons')`: "cover every month exactly once…", "only seasonal slots change between seasons…", "peas appear only in winter", "pick the season from the date…", "the Meal 1 fruit changes through the year…" | `9f089ff` | Seasons removed. Replaced by `describe('fruit and vegetables')` (shares add to 1, every food has a swap, swap amounts). |
| `costs at most ₹${BUDGET.max} a month` | `9f089ff` | Tightened, not dropped: now `costs at most ₹${BUDGET.planningMax}` (₹5,400, the 10% price margin). |
| "Phase 2 meets the EAR for iron, zinc, … in every plan **and season**" | `9f089ff` | Same test without the season dimension. |
| "weekly averages below the EAR match the documented list — no new gaps" | `9f089ff` | Stricter replacement: "nutrient gaps match tests/known-gaps.json: no new gaps, **none silently closed**", now also covering ★ nutrients below the RDA/AI. |
| `${id}: ≤ 5 exercises and ≤ 45 min` | `f054440` | Tightened to ≤ 42 min (3-min buffer under the 45-min cap). |
| "a weekday session is offered only before 9:00 PM" | `d7459bf` | Tested `todayTraining()`, which read the time and the workout log. Removed with logging (your request). The 9 PM rule is now text only ("tomorrow line names … the 9 PM cut-off" checks the wording). |
| "never two sessions in one day" | `d7459bf` | Needed the workout log to know a session was done. No log now, so the app can't enforce it; the Week tab states the rule. |
| "Lower B only Mon–Wed, Upper B only Tue–Fri; a missed one is skipped, not made up" | `d7459bf` | The "missed one" half needed the log. The day rule is kept: "…Tue and Wed offer both". |

Not covered by any test any more: the 9 PM cut-off and "one session a day" (both are now advice, not app logic).

### Checks run (3 Nov 2026)
Final solve (`TL=120 GAP=0.01 npm run solve`):
```
> health-plan@0.1.0 solve
> tsx scripts/solve-plans.ts

Cost ceiling ₹5400/month at default prices.
Phase 0: Optimal in 104 s; shortfall score 750.2, milk + curd 1020 g/day, average ₹4943/month
Phase 1: Time limit reached in 120 s; shortfall score 211.3, milk + curd 967 g/day, average ₹5262/month
Phase 2: Optimal in 1 s; shortfall score 124.3, milk + curd 995 g/day, average ₹5355/month
  P0 vegetarian ₹4841  below EAR: Thiamine (B1) · below RDA/AI: Iron, Zinc, Vitamin A, Riboflavin (B2), Vitamin B6, Vitamin E, Vitamin K, Omega-3 (ALA)
  P0 egg        ₹4873  below EAR: Thiamine (B1), Vitamin B6 · below RDA/AI: Iron, Zinc, Vitamin A, Riboflavin (B2), Vitamin E, Vitamin K, Omega-3 (ALA)
  P0 nonveg     ₹5114  below EAR: Thiamine (B1) · below RDA/AI: Iron, Zinc, Vitamin A, Riboflavin (B2), Vitamin B6, Omega-3 (ALA)
  P1 vegetarian ₹5243  below EAR: — · below RDA/AI: Iron, Vitamin A, Thiamine (B1), Riboflavin (B2), Vitamin B6, Vitamin E, Omega-3 (ALA)
  P1 egg        ₹5143  below EAR: — · below RDA/AI: Iron, Vitamin A, Thiamine (B1), Riboflavin (B2), Vitamin B6, Vitamin E, Vitamin K, Omega-3 (ALA)
  P1 nonveg     ₹5399  below EAR: — · below RDA/AI: Iron, Vitamin A, Thiamine (B1), Riboflavin (B2), Vitamin B6
  P2 vegetarian ₹5396  below EAR: — · below RDA/AI: Iron, Vitamin A, Riboflavin (B2), Vitamin B6, Vitamin E, Omega-3 (ALA)
  P2 egg        ₹5270  below EAR: — · below RDA/AI: Vitamin A, Thiamine (B1), Riboflavin (B2), Vitamin B6, Vitamin E, Vitamin K, Omega-3 (ALA)
  P2 nonveg     ₹5399  below EAR: — · below RDA/AI: Vitamin A, Thiamine (B1), Riboflavin (B2), Vitamin B6
Wrote lib/data/plan-quantities.generated.ts (24 meals).
```

Cost sweep (`TL=120 GAP=0.01 npm run solve:sweep`; table from `docs/cost-sweep.md`):

| Ceiling ₹ | Phase | Cost ₹/month (min–max) | Below EAR (variants: nutrients) | ★ nutrients below RDA/AI | Other nutrients below RDA/AI |
|---|---|---|---|---|---|
| 4,500 | — | **no plan possible** at this ceiling (Phase 2, cap ₹4500: Infeasible) | | | |
| 5,000 | 0 | 4,810–5,000 | Thiamine (B1) 3, Vitamin B6 1 | Iron 3, Zinc 3, Vitamin A 3, Riboflavin (B2) 3, Vitamin E 3 | Thiamine (B1) 3, Vitamin B6 3, Vitamin K 3, Omega-3 (ALA) 3 |
| 5,000 | 1 | 4,843–5,000 | Vitamin B6 1, Riboflavin (B2) 1 | Iron 3, Vitamin A 3, Riboflavin (B2) 3, Vitamin E 2, Zinc 2 | Thiamine (B1) 3, Vitamin B6 3, Omega-3 (ALA) 3, Vitamin K 1 |
| 5,000 | 2 | 4,951–5,000 | — | Iron 2, Vitamin A 3, Riboflavin (B2) 3, Vitamin E 3 | Vitamin B6 3, Omega-3 (ALA) 3, Thiamine (B1) 2, Vitamin K 1 |
| 5,500 | 0 | 4,861–5,099 | Thiamine (B1) 3, Vitamin B6 1 | Iron 3, Zinc 3, Vitamin A 3, Riboflavin (B2) 3, Vitamin E 2 | Thiamine (B1) 3, Vitamin B6 3, Vitamin K 3, Omega-3 (ALA) 3 |
| 5,500 | 1 | 5,238–5,488 | — | Iron 3, Vitamin A 3, Riboflavin (B2) 3, Vitamin E 2 | Thiamine (B1) 3, Vitamin B6 3, Omega-3 (ALA) 3, Vitamin K 1 |
| 5,500 | 2 | 5,390–5,493 | — | Iron 2, Vitamin A 2, Riboflavin (B2) 3 | Vitamin B6 3, Omega-3 (ALA) 2, Thiamine (B1) 2, Vitamin K 1 |
| 6,000 | 0 | 4,849–5,096 | Thiamine (B1) 3, Vitamin B6 1 | Iron 3, Zinc 3, Vitamin A 3, Riboflavin (B2) 3, Vitamin E 2 | Thiamine (B1) 3, Vitamin B6 3, Vitamin K 3, Omega-3 (ALA) 3 |
| 6,000 | 1 | 5,282–5,562 | — | Iron 3, Vitamin A 2, Riboflavin (B2) 3, Vitamin E 3 | Thiamine (B1) 3, Vitamin B6 2, Omega-3 (ALA) 2, Vitamin K 1 |
| 6,000 | 2 | 5,805–6,000 | — | Iron 2, Vitamin A 2, Riboflavin (B2) 3, Vitamin E 2 | Vitamin B6 3, Omega-3 (ALA) 3, Thiamine (B1) 2, Vitamin K 1 |

Reading the sweep: going from ₹5,400 to ₹6,000 changes almost nothing. Phase 0 thiamine stays below the EAR at every ceiling, because it is limited by the 35 g fibre cap, not by money. Phase 2 gains a little vitamin A and E. The ₹5,400 planning ceiling stays.

`npm test`, `npx tsc --noEmit`, `npm run lint`, `npm run build`:
```
ℹ tests 173
ℹ suites 25
ℹ pass 173
ℹ fail 0
TSC exit:
0
LINT:
> health-plan@0.1.0 lint
> eslint

BUILD:
✓ Compiled successfully in 348ms
✓ Generating static pages using 11 workers (12/12) in 387ms
┌ ○ /
├ ○ /_not-found
├ ○ /health
├ ○ /meal-plans
├ ○ /meal-plans/cards
├ ○ /nutrition
├ ○ /progress
├ ○ /recovery
├ ○ /settings
└ ○ /training
```

### Notes
- **"When to add weight" (first brief, item 2):** already shown for every exercise under "How to do it": "Adding weight: when every set reaches {top of the rep range} reps, next time {increment}". Not changed.
- **Stale text found, not changed (outside this round):** the Settings deload note still says "lowers effort in the workout logger … see Training → Progression". Both were removed in Round 3.
- **At ₹4,500 the cost sweep reports no plan possible.** That is because Phase 2 is infeasible at that ceiling; Phases 0–1 alone do fit under ₹4,500. The script reports the whole ceiling as infeasible.

### Not verified
- **Vercel deploy:** not checked. This branch is not pushed.
- **Vercel protection options and plans:** not checked against Vercel's current documentation.
- **Swap amounts** (orange 70–90 g, dates 30–50 g) come from the food table. They were not checked against real portions, and the swap foods are not in the nutrient audit.
- **Fat at 35%:** saturated fat is not tracked, so the extra curd, paneer and oil were not checked against a saturated-fat limit.
- **Solver optimality:** Phase 1 stopped at the 120 s time limit (close to the optimum, not proven). Phases 0 and 2 solved to optimal.
- **Git history** still contains the personal data (see Round 6).

## Round 3 (2–3 Nov 2026): branch `round3-trust`, merged to main and pushed

Spec: `docs/brief-round3.md`. Commits: `efc6611`, `f054440`, `d7459bf`, `9f089ff` (main and origin/main are at `9f089ff`; `round3-trust` was deleted after the merge).

### Status
- [x] **Food data you can trust:** found the root cause of the bad values and added plausibility tests (`efc6611`).
- [x] **★ nutrients** (iron, zinc, riboflavin, folate, B12, vitamins A and E, selenium, biotin) planned to the RDA/AI where the hard rules allow it.
- [x] **Cost ranked last:** the solver is weighted, with a ₹5,400 planning ceiling and a cost sweep.
- [x] **Dairy:** the solver minimises it right after nutrient adequacy.
- [x] **Menu foods added** so the solver can reach B1, B6 and E.
- [x] **AI-only nutrients** get their own "below the adequate intake" label.
- [x] **Weekday sessions** estimated at 41.2–41.7 min (was 44.2–44.7).
- [x] **Seasons:** first rewritten for Ahmedabad, then **removed** at your request. There is now one menu all year, and every fruit and vegetable has a named alternative.
- [x] **Training simplified** (your request): today's warm-up and workout only, with an alternative for each exercise. No logging.
- [x] **Program starts Mon 9 Nov 2026.** Meal plans opens on Phase 0.
- [x] Tests, typecheck, lint, build (output below).
- [ ] `docs/plan-report.md` and `docs/cost-sweep.md` were not regenerated. They still describe the seasonal plans (see "Out of date").
- Blocked: none.

### Review notes: what I found
| Note | Verdict | What I did |
|---|---|---|
| Non-veg B6 19–33 mg, biotin 146–222 µg | **Right: a data error** | The fish rows (IFCT groups P–S) in the `ifct2017` npm package stored B6 in mg but it was read as g, 1,000× too high (rohu 240 mg/100 g instead of 0.24). Folate had been moved into the biotin column. Paneer fat/carbs and lemon carbs were also wrong. All were fixed against the IFCT PDF in `scripts/food-data/build.ts` and `sources.ts`. The package also stores "not analysed" as 0; an IFCT 0 is now filled from the closest USDA food and labelled. Where IFCT and USDA differ by more than 4×, the lower value is used. |
| Dairy 880–1,214 g/day; Phase 2 at the ₹5,700 cap | Right | Dairy is now minimised after nutrients and before cost: 901–969 g/day on average per phase. A fixed cap below ~1,100 g is **infeasible** for the vegetarian plan in Phases 0–1. With less dairy, the calories must come from atta, rice and pulses, which break the 35/40 g fibre caps. `PLAN_RULES.milkCurdMaxG` = 1,100 is only a backstop. |
| Solver only changes grams of menu foods | Right | Added sesame, almonds and banana to Meal 1, and sesame to the sattu paratha (B1, B6, E, minerals). |
| "Plan to the EAR" may be backwards | **Partly.** ICMR really says to use the EAR for planning | ICMR-NIN 2020 brief note: *"the present committee recommended EAR for population requirement/ adequacy estimations and menu or diet planning for individuals"*. IOM 2003 says to plan an individual to the RDA/AI. Decision: the ★ nutrients are planned to the RDA/AI, the rest to at least the EAR, and every UL is a hard limit. The reasoning is in `lib/data/nutrients.ts`. |
| 466 tests pass but 70 gaps are whitelisted | Right | `tests/known-gaps.json` now lists 16 below the EAR and 33 ★ nutrients below target. The audit shows them in the app. |
| AI-only nutrients labelled "above the average need" | Right | New status `below-ai`: "below the adequate intake (no average need is set)". |
| Weekday sessions 44.2–44.7 of 45 min | Right | Face pull is now paired with incline press, and hanging knee raise with calf raise. No sets were removed. The estimate is 41.2–41.7 min, leaving a 3-min buffer. A real session was **not** timed: the workout logger was later removed. |
| Seasons for Ahmedabad | Done, then removed | You asked for no seasons. `lib/data/produce.ts` now has one menu (papaya, banana, bhindi/lauki/kaddu sabzi, cucumber salad, palak). Each food has one alternative (apple; cauliflower, brinjal, carrot; amaranth). Fruit swaps keep the same calories and vegetable swaps keep the same weight. Onion and tomato have no swap. Nutrients and cost are for the main food only. |

### Decisions and why
- **Solver order** (`scripts/solve-plans.ts`, HiGHS, one weighted run per phase):
  1. Hard limits (fibre caps, kcal/protein bands, ULs, variety rules).
  2. Nutrient shortfall.
  3. Less milk + curd.
  4. Cost.

  Shortfalls are priced far above rupees, so the solver never trades nutrients for money.
- **Budget:** ₹6,000 is the ceiling. `BUDGET.planningMax` = ₹5,400 at default prices. This 10% margin covers a rise across all prices (a year of food inflation, or a dearer shop). Errors in single item prices (±15%) partly cancel out.
- **Variety rules** (`PLAN_RULES`):
  - no food above 25% of a week's energy;
  - every item keeps its minimum portion;
  - soya ≤ 50 g/day after Phase 0;
  - eggs ≤ 21/week.
- **Biotin is not planned:** 7 foods have no biotin data.
- **Cost sweep** (`npm run solve:sweep`, run while seasons still existed): no plan is possible at ₹4,500. Phase 2 gaps close between ₹5,000 and ₹5,500; above that, extra money mostly buys nothing in Phases 0–1. That is why the planning ceiling is ₹5,400.
- **Training** (`d7459bf`, your request):
  - The Today tab shows the session (on Tue/Wed you choose Lower B or Upper B), the numbered warm-up, then each exercise with its sets, reps, effort, rest, a "Machine or bench taken?" alternative and "How to do it".
  - Removed: the workout logger, rest timer, Progression tab, strength and consistency charts, and the dashboard StrengthCard.
- **Program start:** `PROGRAM_START = '2026-11-09'` in `lib/storage.ts`. A saved start earlier than that (the old default was 2026-10-06, which showed "week 5") is moved to 9 Nov, and a pinned phase goes back to Auto. A start date before 9 Nov can no longer be set.

### Plans after the re-solve (`TL=120 GAP=0.01 npm run solve`, 2 Nov)
```
Cost ceiling ₹5400/month at default prices.
Phase 0: Time limit reached in 120 s; shortfall score 1229.7, milk + curd 969 g/day, average ₹4697/month
Phase 1: Time limit reached in 120 s; shortfall score 699.9, milk + curd 942 g/day, average ₹5000/month
Phase 2: Time limit reached in 120 s; shortfall score 291.1, milk + curd 901 g/day, average ₹5206/month
  P0 vegetarian ₹4615  below EAR: Thiamine (B1), Riboflavin (B2), Vitamin B6, Vitamin E · below RDA/AI: Iron, Zinc, Vitamin A, Omega-3 (ALA)
  P0 egg        ₹4632  below EAR: Thiamine (B1), Riboflavin (B2), Vitamin B6, Vitamin E · below RDA/AI: Iron, Zinc, Vitamin A, Vitamin K, Omega-3 (ALA)
  P0 nonveg     ₹4843  below EAR: Thiamine (B1), Riboflavin (B2), Vitamin E · below RDA/AI: Iron, Zinc, Vitamin A, Vitamin B6, Vitamin K, Omega-3 (ALA)
  P1 vegetarian ₹4935  below EAR: Vitamin E · below RDA/AI: Iron, Zinc, Vitamin A, Thiamine (B1), Riboflavin (B2), Vitamin B6, Omega-3 (ALA)
  P1 egg        ₹4871  below EAR: Thiamine (B1), Riboflavin (B2) · below RDA/AI: Iron, Zinc, Vitamin A, Vitamin B6, Vitamin E, Vitamin K, Omega-3 (ALA)
  P1 nonveg     ₹5193  below EAR: Thiamine (B1), Riboflavin (B2) · below RDA/AI: Iron, Zinc, Vitamin A, Vitamin B6, Vitamin E, Omega-3 (ALA)
  P2 vegetarian ₹5132  below EAR: — · below RDA/AI: Iron, Vitamin A, Riboflavin (B2), Vitamin B6, Vitamin E, Omega-3 (ALA)
  P2 egg        ₹5088  below EAR: — · below RDA/AI: Iron, Vitamin A, Thiamine (B1), Riboflavin (B2), Vitamin B6, Vitamin E, Vitamin K, Omega-3 (ALA)
  P2 nonveg     ₹5399  below EAR: — · below RDA/AI: Iron, Vitamin A, Thiamine (B1), Riboflavin (B2), Vitamin B6, Vitamin E, Omega-3 (ALA)
Wrote lib/data/plan-quantities.generated.ts (24 meals).
```
"Time limit reached" means the solution is close to optimal but not proven optimal. A 600 s-per-phase run was too slow, so 120 s with a 1% gap was used.

### Checks run (3 Nov 2026)

`npm test`:
```
ℹ tests 165
ℹ suites 22
ℹ pass 165
ℹ fail 0
```

`npx tsc --noEmit`: no output, exit 0.

`npm run lint`: no errors, no warnings.

`npm run build`:
```
✓ Generating static pages using 11 workers (12/12) in 358ms
○ / /health /meal-plans /meal-plans/cards /nutrition /progress /recovery /settings /training (all static)
```

**Browser:** headless Chrome against the production build. `/training` and `/meal-plans` were checked by screenshot. The other routes were not re-checked this round.

**Links:** `docs/link-report.md` was updated during Round 3, before seasons were removed. It was not re-run after that.

### Open decisions (yours)
- Raise `planningMax` toward ₹5,800–6,000? The sweep suggests this helps Phase 2 a little and Phases 0–1 hardly at all.
- Relax the Phase 0–1 fibre cap or fat band? That is what keeps B1, B2, B6 and E below the EAR in Phases 0–1 and keeps dairy near 950 g/day.

### Out of date
- `docs/plan-report.md` still shows the seasonal plans. Regenerate it with `npm run plans:report`.
- `docs/cost-sweep.md` was run on the seasonal menu (12 plan × season variants). Re-run it with `npm run solve:sweep`, which takes long.
- The Round 2 notes below describe seasons and workout logging. Both are gone now and are kept only as history.

### Not verified
- **Vercel deploy** after the push to main.
- **Swap amounts** (apple for papaya, and so on) are computed, not checked against real portions. The swap foods' nutrients are not in the audit.
- **Prices** for the added foods (sesame, almonds) are estimates and were not checked against listings.
- **Session times** are still estimated constants; no session was timed.
- **Before 9 Nov** the app shows "Program week 1" (the week number is clamped). Left as is.
- **Old browser data:** test entries or meal ticks may still be in storage. Settings → "Reset everything" clears them.

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
| Hand-typed Health numbers will go stale | Yes | True. "≈13 mg zinc", "14–19 mg iron", a weight change, "mostly the daily papaya" are all typed text. |
| The weight to-do / Phase 0 shouldn't hardcode the weight | Yes | True. The to-do had the weights as fixed text. |

### Status
- [x] **Inspection** (above).
- [x] **Training:** numbered warm-up, honest session times, plain-language text.
- [x] **Food data:** every value is generated from IFCT 2017 + USDA SR28 by a script in the repo.
- [x] **Seasons:** four quarters, with fruit and vegetables as seasonal slots.
- [x] **Solver in the repo** (`npm run solve`), covering 36 plan × phase × season variants.
- [x] **Full vitamin and mineral audit:** 22 nutrients plus 2 fats, with gaps shown.
- [x] **Weekday mornings:** at most 15 min hands-on (now 13–14; was 25–31).
- [x] **Budget:** a single ₹6,000 ceiling.
- [x] **Health page:** computed table; the to-do reads the log instead of typed numbers.
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
- **★ flag.** Marks a set of nutrients that get extra weight in the plan (in Round 3 they were planned to the RDA/AI).

**4. Gaps in the data, shown rather than guessed.**
- **Missing values count as 0.** The app names the foods involved next to the total, e.g. "No data for oats, soya chunks…: total may be low".
- **Remaining gaps:**
  - Biotin is missing for 6 foods. Milk and curd biotin is filled from IFCT cow milk, and the source note says so.
  - Manganese is missing for oil.
- **Vitamin D is not counted from food.** IFCT reports vitamin D in plant foods, e.g. 13 µg per 100 g of atta, which other tables don't show. It is left out of the audit.
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
- The Health to-do reads the latest weekly-average weigh-in (before: the earliest recalled weight), otherwise Settings.
- Phase 0's calorie band is unchanged: it comes from brief §3.

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
- The Health to-do says its numbers come from Settings, not a weigh-in yet.
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
  - One config, `lib/config.ts`, holds the profile, the phases, the budget and the energy factors.
  - Phases:
    - Phase 0 (weeks 1–2): 2,090–2,310 kcal, 85.5–94.5 g protein, fibre ≤ 35 g, soya ≤ 20 g, sattu ≤ 25 g.
    - Phase 1 (weeks 3–4): 2,280–2,520 kcal, 99.75–110.25 g protein, fibre ≤ 40 g.
    - Phase 2 (week 5+): 2,550–2,700 kcal, 110–125 g protein, fibre ≤ 50 g.
    - Fat is 25–30% of energy in every phase.
  - kcal are computed from the macros: 4/4/9, plus 2 kcal per g of fibre (FAO 2003). Carbs are available carbohydrate.
  - Settings now has an Auto/0/1/2 phase override and an optional current-intake estimate.
  - Old saved settings are migrated: the "Preferred" plan → Vegetarian, the old default weight is replaced, and the morning/evening toggle is removed.
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
  - New to-do card at the top of the page.
  - A symptom note that overclaimed what the plan can do is replaced.
  - The B12 entry is shortened. The lung-cancer cohort detail is dropped.
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
- `lib/storage.ts` defaults: an out-of-date start weight, plan `preferred`, a morning/evening `trainingTime` toggle. The sample data (`lib/data/sample.ts`) and the Progress weight placeholder use the same old weight.
- `lib/data/nutrition-guide.ts` and `/nutrition`: Mifflin-St Jeor with the old weight, a fixed target of 2,700 kcal (2,600–2,800), and "Your weight is currently stable". All out of date against brief §1.
- The dashboard's calorie and protein bars use the fixed 2,700 kcal / 125 g targets.
- The weight checkpoint (`lib/progress.ts`, `GAIN_RULES`) doesn't match the brief.
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
- `assessGain` needs 4 weekly averages and has no rule for a falling trend: "too slow" only adds +150 kcal.
- The waist chart's 85/90 cm lines and its 70–92 axis are hard-coded, not derived from height.
- Past dates can be entered already, but there is no way to mark a recalled weight (e.g. one from six months ago). Such a weight would be averaged into the trend.
- Waist, strength (e1RM), consistency and adherence charts work; there is no photo tracking at all. The current "photos" support is advice text only.

**Recovery and dashboard**
- Bedtime advice is "~11:30 PM–midnight" (`lib/data/recovery.ts`, `DashboardView.tsx:469`). The brief's target is 12:30 AM with waking at 7–8:30.

**Settings**
- No price table, phase, current-intake estimate or historical weight.

**Health**
- A symptom note claims the plan's protein and calories "remove these as possible causes" (`lib/data/health.ts:174`). This must be replaced.
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
- [ ] The weight checkpoint message shows for a whole 1 kg range and has no "done" state.
- [ ] Edible yields (papaya 0.7, banana 0.65, spinach 0.7, veg ~0.85…) are typical values and were not measured or sourced individually.
- [ ] The kidney-bean safety note is standard advice but has no citation in the app.
- [ ] No vitamin D or B12 product sold in India with independent third-party testing was found. Product names on the Health page are examples from pharmacy listings; prices are Oct 2026 snapshots. Creatine price (≈ ₹400–600/month) was not confirmed.
- [ ] Not verified directly (sites block automated checks): NICE NG239 text (thresholds taken from a lab-medicine summary), NIH ODS fact sheets, the FSSAI 2022 nutraceutical regulation text (the 1×RDA cap is from a secondary source), USP Verified scope.
- [ ] B12 food values are USDA figures for similar foods; Indian milk and curd were not measured. Boiling losses are not modelled.
- [ ] The least-cost check needs Python + SciPy and lives outside the repo; re-run it if prices change a lot.
- [ ] No unit-test framework. Deterministic checks live in `scripts/validate-plans.ts`.
