# Health Plan

A personal, evidence-based app for viewing training, meal plans, nutrition and recovery guidance. It is view-only: nothing is logged or tracked. It is frontend-only: Next.js 16, React 19, TypeScript and Tailwind CSS 4. There is no backend, database or login. The only thing stored (in the browser's `localStorage`) is which meal plan you picked.

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build (all routes are statically prerendered)
npm test             # rule tests: meal structure, phase targets, fibre caps, fat limits, cold office lunch,
                     # kcal reconciliation, costs from the price table, budget labels, training limits and schedule
npm run typecheck
npm run links        # checks every external URL; writes docs/link-report.md (needs network)
npm run plans:report # day-by-day calories, macros, micronutrients and cost for each plan and phase
```

## Pages

| Route | What it shows |
|---|---|
| `/` | Today: the session, today's meals with calories and protein, tonight's prep and tomorrow's session |
| `/training` | Today's warm-up and workout with alternatives, the week and rescheduling rules, the full program with tutorials, cardio and mobility, progression and easy (deload) weeks |
| `/meal-plans` | Three 7-day plans × three phases with swaps, vitamins and minerals (nutrient audit, fat limits), grocery list and cost, food safety; `/meal-plans/cards` prints the dinner cooking cards |
| `/nutrition` | Targets and how they were derived, meal timing, training-day guidance, when to change the food, digestion, hydration, supplements |
| `/recovery` | Sleep plan, desk-job movement, rest days, recovery signs |

The phase follows the date only: weeks 1–2, 3–4 and 5+ from Mon 9 Nov 2026 (`PROGRAM_START` in `lib/config.ts`).

## Code layout

```
lib/data/          content as data, with no UI code
  foods.ts         food database
  prices.ts        default prices (estimates, dated)
  meal-plans.ts    3 plan definitions, per-phase quantities; buildWeek() enforces the 4-meal structure
  training.ts      sessions, exercises, phases, rescheduling rules, cardio, mobility
  nutrition-guide.ts, recovery.ts
  tutorials.ts     verified external links (exercise + cooking)
  references.ts    verified citations
lib/config.ts      program start, phases, budget and energy factors (single source of truth)
lib/phase.ts       program week and phase for a date
lib/nutrition.ts   nutrient/cost maths (kcal from macros; all totals computed, never typed in)
lib/meal-plans.ts  computed plans: daily totals, ranges, grocery list, monthly cost
lib/training.ts    weekly schedule (fixed weekend, flexible weekday sessions), session length
lib/storage.ts     hydration-safe localStorage store for the picked plan
components/        UI primitives, app shell, feature components
```

## Content notes

- Nutrient values are based on IFCT 2017 and USDA data. Treat them as estimates. The UI rounds them on purpose.
- All prices are estimates (Oct 2026).
- Produce is costed as bought: each food has an approximate edible yield (`edible` in `foods.ts`), so peel, seeds and trimmings count toward the cost and the grocery weights.
- Tutorial links and references were verified when they were added. Re-check them occasionally, because external links can change.
- This is educational guidance, not medical advice.
- Work status and open items: see `PROGRESS.md`.
