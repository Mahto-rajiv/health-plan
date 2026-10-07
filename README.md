# Health Plan

A personal, evidence-based training, nutrition, recovery and progress app. It is frontend-only: Next.js 16, React 19, TypeScript, Tailwind CSS 4 and Recharts. There is no backend, database or login. Everything you log is stored in the browser's `localStorage`.

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build (all routes are statically prerendered)
npm run validate     # checks the hard meal-plan rules (4 meals, fixed Meal 1/3, diet, targets)
npm run plans:report # day-by-day calories, macros, micronutrients and cost for each plan
```

## Pages

| Route | What it does |
|---|---|
| `/` | Dashboard: today's workout, meal checklist with calorie and protein progress, weight trend and quick weigh-in, this week's adherence, strength, recovery check-in, tonight's prep |
| `/training` | Workout logger (kg/reps per set, rest timer, previous performance, progression hints, drafts survive reloads), weekly schedule, rescheduling rules, full program with verified tutorials, cardio and mobility, progression and deloads, history |
| `/meal-plans` | Four 7-day plans, plus a grocery list, cost estimate, prep strategy and substitutions for each |
| `/nutrition` | Targets and how they were derived, meal timing, training-day guidance, the weight-gain decision system, digestion, hydration |
| `/progress` | Weight and waist logging; charts for weight, waist, strength, consistency and adherence (labelled sample data until you have your own); the "should I keep gaining?" assessment |
| `/recovery` | Daily check-in, sleep plan, desk-job movement, rest days, recovery signs |
| `/health` | Blood results explained (not diagnosed), hair-loss guidance, supplements |
| `/settings` | Profile and goal, active plan, training time, deload week toggle, backup, restore and reset |

## Code layout

```
lib/data/          content as data, with no UI code
  foods.ts         food database (per 100 g: macros, iron, calcium, zinc, vitamin C, price)
  meal-plans.ts    4 plan definitions; buildWeek() enforces the 4-meal structure
  training.ts      sessions, exercises, phases, rescheduling rules, cardio, mobility
  nutrition-guide.ts, health.ts, recovery.ts
  tutorials.ts     verified external links (exercise + cooking)
  references.ts    verified citations
  sample.ts        deterministic, clearly-labelled sample data
lib/nutrition.ts   nutrient/cost maths (all meal totals are computed, never typed in)
lib/meal-plans.ts  computed plans: daily totals, ranges, grocery list, monthly cost
lib/training.ts    rotation-based "what's today", progression hints, e1RM
lib/progress.ts    weekly averages, gain-rate assessment, adherence series
lib/storage.ts     hydration-safe localStorage store (useSyncExternalStore), export/import
components/        UI primitives, app shell, charts (Recharts lazy-loaded), feature components
```

The stored data shapes (`Settings`, `BodyEntry`, `WorkoutRecord`, `MealLog`, `CheckInLog`) are plain JSON. A backend can replace `lib/storage.ts` without touching the pages.

## Content notes

- Nutrient values are based on IFCT 2017 and USDA data. Treat them as estimates. The UI rounds them on purpose.
- Prices were checked in October 2026 where possible (milk, eggs, chicken, fruit, soya, oats). The rest are local-shop estimates.
- Tutorial links and references were verified when they were added. Re-check them occasionally, because external links can change.
- This is educational guidance, not medical advice.
