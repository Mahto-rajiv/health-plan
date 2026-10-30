# TASK: Audit-driven fix of my fitness & nutrition website

Site: Next.js app deployed at health-plan-eta.vercel.app (private repo). A review found real defects. Fix them in the existing project: preserve working features, reuse the stack, add dependencies only if justified, no framework migration, no new backend. Save this prompt as docs/brief.md and treat it as the spec.

## 0. Rules of engagement
- Work on a new branch. Small logical commits. NEVER push, pull, merge or force-push without asking me first.
- Keep PROGRESS.md at repo root: done / in progress / blocked / unverified. Update as you go.
- Never claim anything is verified unless you actually ran or checked it. No invented prices, URLs, citations, product specs or medical claims. Prices are labeled estimates with an asOf date.
- FIRST inspect everything before changing anything, especially the parts a reviewer could not see: all Training tabs, Progress, Recovery, Settings, the data for all meal plans, grocery and cost logic. Write findings to PROGRESS.md.

## 1. Facts about me (current; override anything on the site)
- Male, 24, 180 cm, 64 kg now (BMI ~19.8). Was ~68 kg six months ago. The old "stable at 66 kg" assumption is WRONG everywhere; fix defaults, maintenance text and the Progress baseline.
- Complete beginner; full-equipment gym near home, open until 10 PM.
- Intake now: under ~2,000 kcal, under ~60 g protein (my own estimate). Estimated maintenance ~2,000-2,100 kcal (label it an estimate).
- Weekdays: leave home ~8:30-9 AM, home 8-9 PM (9 h work, ends 6-7:30 PM). Bedtime target 12:30 AM; I wake ~7-8:30 AM.
- Office has a fridge only. No kettle, no vacuum jar, no microwave, no reheating. I carry an insulated lunch bag plus a frozen water bottle or ice pack.
- My mom cooks at home. Recipes must be simple household food (max 2 pots), raw-gram quantities plus household measures, no special cooking. Add a printable "cooking card" per dinner.
- Vegetarian by default; eggs and non-veg are fine for the relevant plans. Dairy well tolerated. No known allergies. Digestion is untested at the new diet, so ramp slowly.
- Budget: food Rs 3,000-6,000/month, target Rs 4,000-4,500. Supplements costed separately. Single source of truth in ONE config constant; every "within/above target" label derives from it. Remove the stray "Rs 3,000-4,000" text on the Health page.
- Cost rule: when two ingredients are nutritionally and taste-equivalent, choose the cheaper UNLESS it has a safety or digestive downside (e.g. loose unbranded paneer/ghee: recommend sealed branded). Show cost per serving and cost per 10 g protein for the ~15 main ingredients. All prices live in one editable table in Settings (localStorage) and costs/grocery totals recompute from it.

## 2. Plans (exactly 3; remove the old "Preferred foods" plan)
1. Vegetarian  2. Vegetarian + Eggs  3. Non-Vegetarian (a real mixed plan: veg meals plus chicken/fish/eggs). Show the non-veg plan's cost per 10 g protein against the veg plans honestly, even if it is more expensive. Plans should be comparable in calories, protein and nutritional adequacy. Do not assume non-veg is healthier. My liked foods (sattu, oats, paneer, curd, moong, kala chana, seeds, nuts, dates, ghee, papaya, etc.) may appear where cost-effective; they are not mandatory.

HARD constraints, per plan, 7 days:
- Exactly 4 meals/day, no snacks.
- Meal 1 identical Mon-Sun. Max ~10 min prep. Eaten before leaving on weekdays.
- Meal 3 identical Mon-Fri. Eaten ~6:15-6:45 PM at the office (pre-workout). No cooking. Sat and Sun may differ.
- Meals 2 and 4 may vary on weekdays; on weekends Meals 2-4 may vary.
- Meal 2 (office lunch ~1 PM) must be safe and palatable eaten cold after a ~2 h unrefrigerated commute: no rice, no reheating, no cooked dal or gravy. Cooked paneer and curd-based items are allowed if eaten within ~4 h of leaving home, with the frozen bottle/ice pack. Add a short food-safety note (freeze the bottle overnight, box beside it, refrigerate on arrival).
- Dinner (Meal 4) ~9:30-10:30 PM on training days.
- "Identical" means identical composition within a phase; quantities may scale by phase.
Each meal: ingredient quantities, kcal and macros, preparation, active and total time, substitutions, key micronutrients. Weekly grocery list and monthly cost per plan.

## 3. Targets and phases (replace the fixed 2,700 kcal target)
- Phase 0, weeks 1-2: goal is to STOP weight loss (+/-0.5 kg). ~2,200 kcal, ~90 g protein, fibre <=35 g, soya chunks <=20 g/day, sattu <=25 g/day.
- Phase 1, weeks 3-4: ~2,400 kcal, ~105 g protein, fibre <=40 g.
- Phase 2, week 5+: 2,550-2,700 kcal, 110-125 g protein, fibre <=50 g.
- Fat ~25-30% of energy, fluids 2.5-3.5 L, salt ~5 g/day, iodised salt.
- Weight-gain target 0.5-1.0 kg/month once gaining. First checkpoint 68 kg (my pre-loss weight); reassess the 75 kg goal there.
- Progress page: allow entering historical weights (68 six months ago, 64 now). Weekly averages decide phase and adjustments. If the trend is still falling after 2 weeks in Phase 0/1, suggest +200 kcal and show "discuss unexplained weight loss with a doctor". Optional "current intake" self-estimate in Settings.
- Keep waist, strength and photo tracking. Waist cut-offs derived from my height.
- Make macros reconcile with kcal (4/4/9 plus a stated fibre treatment) within ~3%; state whether carbs are total or available. Fix any claim that doesn't match the data (e.g. "25-40 g protein per meal").

## 4. Training (rebuild schedule logic and the Today view)
- 4 sessions/week: Sat and Sun fixed, plus two flexible weekday sessions. Sat and Sun train different regions. Weekday sessions are <=45 min, <=5 exercises, and happen only if I am at the gym by 9:00 PM; otherwise skip, never double. Weekends 60-75 min.
- Remove the old evening 7-8:30 PM default and the "slept by 11:30" morning gate; both contradict my schedule.
- Include exercises, sets, reps, intensity (RIR/RPE), rest, progression, deload, cardio, core, mobility, flexibility, recovery and sleep guidance, injury prevention, and a simple missed-session rule with no catch-up volume.

## 5. Health page fixes
- Replace the line claiming the plan "removes protein/energy as possible causes" of hair loss. New text: weight loss and low intake over the past 6 months are a recognised trigger for diffuse shedding (telogen effluvium) and fit this timeline; a dermatologist must confirm; nutrition cannot be shown to cure it.
- Top-of-page to-do: book a dermatologist; tell the doctor about the ~4 kg weight loss; ask about ferritin, zinc, folate, active B12 (holotranscobalamin).
- Shorten B12: course, active-B12 test first, retest, doctor decides. Drop the lung-cancer cohort detail. Keep vitamin D3 1,000 IU/day as already written. No new supplements; biotin and "hair blends" stay "avoid"; creatine stays optional.
- Keep the digestive-health section; fix the ramp so it covers Meals 1 and 3 by quantity per phase.

## 6. Evidence and links
Cite material health/nutrition/training claims with working links to primary or authoritative sources, and mark uncertainty. Verify every external URL (cooking and exercise tutorials included) resolves and matches; report failures instead of silently dropping them. Disclose anything you could not access.

## 7. UX, accessibility, performance
Mobile-first; no horizontal overflow, clipped or overlapping content; readable nutrition tables; touch targets and visible focus; loading/empty/error states; reduced-motion respected. Fix real performance bottlenecks (images, fonts, client JS, server/client component boundaries) and report measured before/after where you can.

## 8. Automated tests (fail loudly; never relax a rule to pass)
For each of the 3 plans: 7 days x exactly 4 meals; Meal 1 deep-equal across 7 days (per phase); Meal 3 deep-equal Mon-Fri (per phase); weekday Meal 2 has requiresReheat=false and no rice; kcal/macro reconciliation within 3%; day totals across plans within 5%; fibre within phase caps; grocery totals and monthly cost computed from the price table; "within budget" labels derived from the config constant. Also run lint, typecheck, production build and a link check.

## 9. Order of work
(1) inspect + PROGRESS.md, (2) weight/phase/calorie model and profile fixes, (3) Meal 2 and meal-structure redesign for all 3 plans, (4) training rebuild, (5) Health page, (6) budget/price table, (7) tests, (8) responsive/a11y/performance, (9) link verification and final audit against this whole brief.

## 10. Final report
Major changes; evidence-based decisions with sources; files changed; tests actually run with results; unverified or incomplete items; assumptions and limits; next steps. Ask me before any push.
