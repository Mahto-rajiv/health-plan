# Cost against nutrient gaps

Generated 2026-11-02 by `npm run solve:sweep` (HiGHS, 300 s per phase, default prices). Each row: the solver with that monthly ceiling. Nutrient gaps are priced far above cost (scripts/solve-plans.ts), so the solver closes as much of them as the hard rules and the ceiling allow and only then saves money; the cost shown is what the plan actually costs (it can be well under the ceiling). The solver stops at a time limit, so it is close to, not proven at, the optimum: differences of one variant between rows can be search noise.

Counts are over 12 plan × season variants per phase (weekly averages). "Hair" = iron, zinc, riboflavin, folate, B12, vitamins A and E, selenium (biotin is not planned: 7 foods have no biotin data).

| Ceiling ₹ | Phase | Cost ₹/month (min–max) | Below EAR (variants: nutrients) | Hair nutrients below RDA/AI | Other nutrients below RDA/AI |
|---|---|---|---|---|---|
| 4,500 | — | **no plan possible** at this ceiling (Phase 0, cap ₹4500: Infeasible) | | | |
| 5,000 | 0 | 4,585–4,944 | Thiamine (B1) 12, Riboflavin (B2) 7, Vitamin B6 12, Vitamin E 12, Zinc 3 | Iron 12, Zinc 12, Vitamin A 12, Riboflavin (B2) 12, Vitamin E 12 | Thiamine (B1) 12, Vitamin B6 12, Vitamin K 12, Omega-3 (ALA) 12, Vitamin C 1 |
| 5,000 | 1 | 4,703–5,000 | Vitamin B6 12, Vitamin E 12, Thiamine (B1) 11, Riboflavin (B2) 5 | Iron 12, Zinc 12, Vitamin A 12, Riboflavin (B2) 12, Vitamin E 12 | Thiamine (B1) 12, Vitamin B6 12, Vitamin K 12, Omega-3 (ALA) 12, Vitamin C 2 |
| 5,000 | 2 | 4,727–5,000 | Vitamin B6 11, Vitamin E 7, Riboflavin (B2) 8 | Iron 12, Zinc 9, Vitamin A 12, Riboflavin (B2) 12, Vitamin E 12 | Vitamin B6 12, Vitamin K 12, Omega-3 (ALA) 12, Thiamine (B1) 11, Vitamin C 3 |
| 5,500 | 0 | 4,588–5,030 | Thiamine (B1) 12, Riboflavin (B2) 9, Vitamin B6 12, Vitamin E 12, Zinc 1 | Iron 12, Zinc 12, Vitamin A 12, Riboflavin (B2) 12, Vitamin E 12 | Thiamine (B1) 12, Vitamin B6 12, Vitamin K 12, Omega-3 (ALA) 12 |
| 5,500 | 1 | 4,850–5,495 | Vitamin B6 12, Vitamin E 12, Thiamine (B1) 11, Riboflavin (B2) 3 | Iron 12, Zinc 12, Vitamin A 12, Riboflavin (B2) 12, Vitamin E 12 | Thiamine (B1) 12, Vitamin B6 12, Vitamin K 12, Omega-3 (ALA) 12 |
| 5,500 | 2 | 5,140–5,498 | Vitamin B6 2, Riboflavin (B2) 3 | Iron 12, Vitamin A 12, Riboflavin (B2) 12, Vitamin E 12 | Vitamin B6 8, Omega-3 (ALA) 12, Thiamine (B1) 11, Vitamin K 5 |
| 6,000 | 0 | 4,574–4,967 | Thiamine (B1) 12, Riboflavin (B2) 9, Vitamin B6 12, Vitamin E 12, Zinc 2 | Iron 12, Zinc 12, Vitamin A 12, Riboflavin (B2) 12, Vitamin E 12 | Thiamine (B1) 12, Vitamin B6 12, Vitamin K 12, Omega-3 (ALA) 12 |
| 6,000 | 1 | 4,843–5,450 | Vitamin B6 8, Vitamin E 12, Thiamine (B1) 10, Riboflavin (B2) 1 | Iron 12, Zinc 12, Vitamin A 12, Riboflavin (B2) 12, Vitamin E 12 | Thiamine (B1) 12, Vitamin B6 12, Vitamin K 12, Omega-3 (ALA) 12 |
| 6,000 | 2 | 5,417–5,999 | Vitamin B6 1 | Iron 12, Zinc 3, Vitamin A 11, Riboflavin (B2) 12, Vitamin E 12 | Vitamin B6 7, Omega-3 (ALA) 12, Thiamine (B1) 11, Vitamin K 4 |
