import type { RefId } from './references';

export const SLEEP = {
  target: '7.5–8 h in bed so you actually sleep ≥ 7 h (AASM/SRS).',
  current: 'Now: asleep after midnight, up at ~7–8:30. That can be enough hours, but the timing drifts, and late nights cut sleep short on early or busy days.',
  plan: [
    { title: 'Anchor your wake time', body: 'Pick a wake time you can keep 7 days a week (e.g. 7:30 AM) and stay within ±45 minutes on weekends. Regular timing is linked to better health outcomes, even independently of duration.' },
    { title: 'Move bedtime earlier gradually', body: 'Bring lights-out 15 minutes earlier every 3–4 days until it’s ~11:30 PM–midnight. Big jumps rarely stick.' },
    { title: 'Morning light, dim evenings', body: 'Get 10+ minutes of outdoor light soon after waking (the commute counts). Dim the screens and room lights for the last hour before bed.' },
    { title: 'Caffeine cut-off around 3 PM', body: 'Caffeine lingers for hours. Evening training doesn’t need a pre-workout stimulant; Meal 3 is your fuel.' },
    { title: 'Late workout, still sleep', body: 'If an evening session ends after 9 PM, keep the cool-down calm, eat dinner, and shower. Exercise itself doesn’t generally ruin sleep, but late heavy meals and phone time can.' },
  ],
  why: 'In a controlled study, people who slept 5.5 h instead of 8.5 h while dieting lost much more lean mass. That is indirect evidence for gaining, but the direction is clear: sleep is where training adapts.',
  refs: ['aasmSleep', 'windred', 'nedeltcheva'] as RefId[],
};

export const DESK = {
  intro: 'Training 4 hours a week doesn’t cancel 9–10 hours of sitting. Short, frequent breaks matter in their own right.',
  routine: [
    { time: 'Every 30–45 min', action: 'Stand up, walk to refill water, or take calls standing — 2–3 minutes.' },
    { time: 'After lunch (1:30 PM)', action: '10–15 min walk. It helps post-meal blood sugar and covers ~1,500 steps.' },
    { time: 'Mid-afternoon', action: 'The 6-minute desk reset (hip flexors, thoracic rotation, cat-cow, ankles).' },
    { time: 'Commute', action: 'Get off a stop early or take stairs when you can — it adds up to the 8,000-step target.' },
  ],
  setup: [
    'Top of the screen at eye level, keyboard at elbow height, feet flat.',
    'No posture is “perfect” for 9 hours — changing position often matters more than any single position.',
  ],
  refs: ['dunstan', 'paluch', 'who2020'] as RefId[],
};

export const RECOVERY_SIGNS = {
  good: ['Waking up without struggling most days', 'Lifts holding or improving week to week', 'Soreness gone within ~48 h', 'Steady mood and appetite'],
  watch: ['Two or more main lifts going backwards in the same week', 'Sleeping under 6.5 h for several nights', 'Aching joints (not muscles) or lingering soreness beyond 72 h', 'Low motivation for over a week, or frequent colds'],
  actions: [
    'One bad session: ignore it.',
    'A bad week: check sleep and whether you ate all 4 meals. Keep loads, skip the last set of each exercise.',
    'Two bad weeks or several warning signs: take a deload week (switch it on in Settings).',
  ],
};

export const REST_DAYS = [
  { day: 'Wednesday', what: 'Zone 2 cardio 30–40 min + desk reset. Easy — you should feel better afterwards, not tired.' },
  { day: 'Saturday', what: 'Cardio (intervals from week 5) + 15 min weekend mobility. Also your catch-up slot for a missed lift.' },
  { day: 'Sunday', what: 'Full rest from training. A relaxed walk and food prep for the week.' },
];
