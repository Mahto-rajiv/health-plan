# Cost against nutrient gaps

Generated 2026-11-03 by `npm run solve:sweep` (HiGHS, 120 s per phase, default prices). Each row: the solver with that monthly ceiling. Nutrient gaps are priced far above cost (scripts/solve-plans.ts), so the solver closes as much of them as the hard rules and the ceiling allow and only then saves money; the cost shown is what the plan actually costs (it can be well under the ceiling). The solver stops at a time limit, so it is close to, not proven at, the optimum: differences of one variant between rows can be search noise.

Counts are over the 3 plans per phase (weekly averages). "★" = iron, zinc, riboflavin, folate, B12, vitamins A and E, selenium (biotin is not planned: 7 foods have no biotin data).

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
