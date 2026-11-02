# ROUND 3

Read docs/brief.md, docs/brief-round2.md and PROGRESS.md first. Earlier briefs still apply unless this overrides them. Same working rules: new branch, small commits, never push/pull/merge without asking me, keep PROGRESS.md current, paste real command output (not summaries), and don't claim anything is verified unless you checked it.

## What I need (my requirements)
1. Nutrient numbers I can trust. Every value in the app must be physically plausible, and the audit must reflect the real food.
2. The nutrients linked to hair loss (iron, zinc, riboflavin, folate, B12, vitamins A and E, selenium, biotin) planned to the RDA/AI where achievable, not just the EAR. I have unexplained shedding and untested ferritin and zinc.
3. Spend as little as possible without losing anything. Order of priority:
   (a) hard limits: food safety, upper limits, the 4-meal structure, the cold-lunch rule, fibre caps, calorie and protein bands;
   (b) nutrient adequacy;
   (c) then minimise monthly cost among the plans that pass (a) and (b).
   Rs 6,000/month is a ceiling, not a target. Keep a variety/taste rule so the cheapest plan isn't the same few foods every day. Don't save money by dropping branded/safe items (e.g. sealed branded paneer and ghee), or by adding cooking time for my mom.
4. Dairy should not carry the diet.
5. Seasons that match where I live: Gujarat -> Ahmedabad. The current seasons are written for the North Indian plains.

## Review notes: check these yourself; disagree if I'm wrong
- The non-veg plan shows vitamin B6 19-33 mg and biotin 146-222 ug per day, against ~1.4-2.3 mg and 38-59 ug in the other plans. That looks like a unit or transcription error, and it would also hide real B6/biotin shortfalls from the solver and understate the shortfall counts.
- Milk+curd rose to 880-1,214 g/day (veg plan calcium up to 1,963 mg), and several Phase 2 plans sit exactly at the solver's own Rs 5,700 cap, so cost may still be binding.
- The solver changes grams of the foods already on the menu. If no menu food supplies enough B6, B1 or vitamin E, no amount of solving fixes it. The veg plans are below the average need for B6 in 10 of 12 variants, and B6 is still short in Phase 2.
- "Planning floor is the EAR" may be backwards under the standard DRI framework (RDA/AI for an individual; EAR for assessing groups). Quote ICMR's exact wording before keeping it.
- 466 tests pass, but tests/known-gaps.json whitelists 70 of 792 nutrient checks below the EAR. Passing doesn't mean the targets are met.
- Nutrients with only an AI (vitamin K, ALA, biotin, manganese) are labelled "above the average need, below the RDA", but they have no average need.
- Weekday sessions estimate 44.2-44.7 min against a 45 min cap using guessed constants (40 s per set, 1 min setup).

## Your call (research and decide)
- How to detect and fix bad food data: find the root cause, don't just patch the number. Consider an automatic plausibility test on food rows and day totals.
- Which extra foods the solver may use (they must work for a cold office lunch and simple home cooking), and what dairy cap makes sense.
- How to rank cost last in the solver without letting it override nutrition or safety. Run the solver at roughly Rs 4,500 / 5,000 / 5,500 / 6,000 and show cost against the remaining nutrient gaps, so I can choose where extra spending stops helping. Decide your own safety margin below Rs 6,000 for price uncertainty and explain it.
- Which standard to plan to (EAR vs RDA/AI) and how to explain that choice in the UI.
- How to show the known gaps clearly in the app, and whether to re-time a real weekday session.
- Which of my notes above to act on, change or reject. If you think any requirement is a bad idea, say so and explain.

## Evidence
Use credible sources and cite the claims that matter. Don't fabricate citations, prices or nutrient values. Where data is missing, show that plainly instead of guessing.

## When done
Re-run the solver, tests, lint, typecheck, build and link check, and paste the real output into PROGRESS.md. Report what changed, what you decided and why, what you couldn't verify, and what you disagreed with. Ask me before any push.
