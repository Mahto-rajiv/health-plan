import type { RefId } from './references';

export const SLEEP = {
  target: '7.5–8 h in bed so you actually sleep ≥ 7 h (AASM/SRS).',
  current: 'The gym is in the morning now, so the alarm is earlier. Set the bedtime from it: 7.5–8 h before the alarm.',
  plan: [
    { title: 'Anchor your wake time', body: 'Pick a wake time that fits the morning gym and that you can keep 7 days a week, and stay within ±45 minutes on weekends. Regular timing is linked to better health outcomes, even independently of duration.' },
    { title: 'Move bedtime earlier in steps', body: 'Leave about 2 hours between dinner and bed. To get to the earlier bedtime, move it 15 minutes earlier every 3–4 days rather than in one jump.' },
    { title: 'Morning light, dim evenings', body: 'Get 10+ minutes of outdoor light soon after waking (the commute counts). Dim the screens and room lights for the last hour before bed.' },
    { title: 'Caffeine cut-off around 3 PM', body: 'Caffeine lingers for hours. You don’t need a pre-workout stimulant; the banana before the gym is your fuel.' },
  ],
  why: 'In a controlled study, people who slept 5.5 h instead of 8.5 h while dieting lost much more lean mass. That is indirect evidence for gaining, but the direction is clear: sleep is where training adapts.',
  refs: ['aasmSleep', 'windred', 'nedeltcheva'] as RefId[],
};

export const DESK = {
  intro: 'Training 4–5 hours a week doesn’t cancel 9–10 hours of sitting. Short, frequent breaks matter in their own right.',
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
  good: ['Waking up without struggling most days', 'Your usual weights feel the same or lighter', 'Soreness gone within about 2 days', 'Steady mood and appetite'],
  watch: ['Weights feeling heavier than usual for several sessions in a row', 'Sleeping under 6.5 h for several nights', 'Aching joints (not muscles), or soreness lasting more than 3 days', 'Low motivation for over a week, or frequent colds'],
  actions: [
    'One bad session: ignore it.',
    'A bad week: check sleep and whether you ate all 4 meals and the banana. Keep loads, skip the last set of each exercise.',
    'Two bad weeks or several warning signs: take an easy week: half the sets, about 10% lighter (see Training → Program).',
  ],
};

export const REST_DAYS = [
  { day: 'Days without a session', what: 'A 20–30 minute brisk walk and the 6-minute desk reset. You should feel better afterwards, not tired.' },
  { day: 'Gym on a day off work', what: 'The next session in the order. Add 8–10 minutes of easy cardio and the longer mobility routine if you have time.' },
];
