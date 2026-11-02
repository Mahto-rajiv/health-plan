# ROUND 2

Read docs/brief.md and PROGRESS.md first; they still apply unless this overrides them. Same working rules: new branch, small commits, never push/pull/merge without asking me, keep PROGRESS.md current, and don't claim anything is verified unless you actually checked it.

## What I need (these are my requirements)
1. Fruit and vegetables in the meal plans should be seasonal. The same ones aren't available all year, so they should change through the year (roughly by quarter).
2. The diet should cover all the essential vitamins and minerals for hair growth and for general health, not just the handful currently computed.
3. Every training session needs a proper warm-up, and the training text should be in simple, plain language.
4. Budget: anything up to Rs 6,000/month is fine. Don't optimise for lower cost; there's no target below that ceiling.
5. All earlier hard constraints still hold: 4 meals a day, Meal 1 identical every day, Meal 3 identical Mon-Fri, cold office lunch with no reheating, simple food my mom can cook without overcooking.

## Things a review found. Check them yourself first; you may find I'm wrong.
- Fruit looks hardcoded (papaya in Meal 1, banana in Meal 3), and some health-page text and numbers depend on it (e.g. vitamin C credited to the daily papaya). Peas in the sabzi are seasonal too.
- The nutrient audit seems to compute only a few nutrients; folate and omega-3 are "not computed", and Phase 0 iron and zinc fall short. Round 1 gave cost and fibre caps as the reasons, and cost is no longer a constraint. Dairy looks like it carries much of the protein.
- The solver that produced the quantities isn't in the repo, so the plans can't be regenerated. Seasonal changes would multiply the combinations to solve.
- I couldn't see the Training tabs. I'm not sure the warm-up is visible as steps. Check the session-length arithmetic.
- Monday needs ~28 min of hands-on cooking before I leave. Monday's per-meal costs add to Rs 123, while the monthly estimate implies more per day. Some health-page numbers are typed by hand and will go stale after changes.
- The "lost ~2 kg" to-do and Phase 0 depend on a weight I'll confirm; don't hardcode it.

## Your call (research and decide)
How to define seasons and which foods belong in each. How to keep Meal 1 and Meal 3 "identical" while fruit changes, and how to explain it in the UI. Which nutrients to audit, which reference values and food data to use, and how to handle gaps in the data. What the warm-up contains and how to present it. How to make the plan reproducible. How to cut the morning cooking load. Which of my review notes to act on or disagree with. If you think a requirement above is a bad idea, say so and explain.

## Evidence
Use credible sources and cite the claims that matter. Don't fabricate citations, prices or nutrient values. Where data is missing, show that plainly instead of guessing.

## When done
Run whatever tests, linting, type checks, build and link checks make sense, and paste the real output into PROGRESS.md. Report what changed, what you decided and why, what you couldn't verify, and what you disagreed with. Ask me before any push.
