// ─── Verified external tutorials ──────────────────────────────────────────────
// Every URL below was checked on 7 Oct 2026 (moongCheela, sattuParatha,
// palakPaneer, paneerTikka and soyaKeema added and checked 21 Oct 2026):
//  • YouTube links via the oEmbed endpoint (confirms the video exists and the
//    title/channel shown here).
//  • Web pages fetched (HTTP 200) and the page title / instructions read.
// Sources are reputable organisations (ACE, CDC, Cleveland Clinic, NASM, NHS
// trust) or established coaching/cooking channels. Exercise links are in
// EXERCISE_LINKS below (one each); EXERCISE_TUTORIALS holds the warm-up,
// mobility and cardio links.

export interface Tutorial {
  title: string;
  url: string;
  source: string;
  kind: 'video' | 'article';
}

export const EXERCISE_TUTORIALS = {
  hipFlexorStretch: [
    { title: 'Kneeling Hip-Flexor Stretch', url: 'https://www.acefitness.org/resources/everyone/exercise-library/142/kneeling-hip-flexor-stretch/', source: 'ACE', kind: 'article' },
    { title: 'Half Kneeling Hip Flexor Stretch', url: 'https://www.youtube.com/watch?v=vIDzsqJiAIo', source: 'E3 Rehab', kind: 'video' },
  ],
  worldsGreatestStretch: [
    { title: "The World's Greatest Stretch", url: 'https://www.youtube.com/watch?v=-CiWQ2IvY34', source: 'Squat University', kind: 'video' },
  ],
  openBook: [{ title: 'Open Book (thoracic rotation)', url: 'https://www.youtube.com/watch?v=XmpMtdllbfQ', source: 'E3 Rehab', kind: 'video' }],
  hip9090: [{ title: '90/90 Hip Transitions (hands supported)', url: 'https://www.youtube.com/watch?v=Lx07WIkllbA', source: 'E3 Rehab', kind: 'video' }],
  couchStretch: [{ title: 'Half Kneeling Quad Stretch (Couch Stretch)', url: 'https://www.youtube.com/watch?v=p24DLakBhYM', source: 'E3 Rehab', kind: 'video' }],
  catCow: [
    { title: 'Cat-Cow', url: 'https://www.acefitness.org/resources/everyone/exercise-library/15/cat-cow/', source: 'ACE', kind: 'article' },
    { title: 'Cat & Camel', url: 'https://www.youtube.com/watch?v=JJkjIKlimW8', source: 'Royal Free London NHS Foundation Trust', kind: 'video' },
  ],
  ankleMobility: [
    { title: 'Standing Knee to Wall', url: 'https://www.youtube.com/watch?v=KmiPXKmoUbs', source: 'E3 Rehab', kind: 'video' },
    { title: 'Standing Ankle Mobilization', url: 'https://www.acefitness.org/resources/everyone/exercise-library/224/standing-ankle-mobilization/', source: 'ACE', kind: 'article' },
  ],
  warmUp: [
    { title: 'Science-Based Warm Up & Mobility Routine (Full Body)', url: 'https://www.youtube.com/watch?v=E81GN-3A8XM', source: 'Jeff Nippard', kind: 'video' },
  ],
  talkTest: [
    { title: 'How to Measure Physical Activity Intensity (talk test)', url: 'https://www.cdc.gov/physical-activity-basics/measuring/index.html', source: 'CDC', kind: 'article' },
    { title: 'What Is Zone 2 Cardio?', url: 'https://health.clevelandclinic.org/zone-2-cardio', source: 'Cleveland Clinic', kind: 'article' },
  ],
} satisfies Record<string, Tutorial[]>;

export const COOKING_TUTORIALS = {
  sattuDrink: [
    { title: 'Sattu Ka Namkeen Sharbat', url: 'https://www.archanaskitchen.com/recipe/sattu-ka-namkeen-sharbat-recipe', source: "Archana's Kitchen", kind: 'article' },
  ],
  overnightOats: [
    { title: 'Overnight Oats Recipe', url: 'https://www.indianhealthyrecipes.com/overnight-oats-recipe/', source: "Swasthi's Recipes", kind: 'article' },
  ],
  moongSprouts: [
    { title: 'How to Sprout Mung Beans', url: 'https://www.indianhealthyrecipes.com/mung-bean-sprouts-sprout-mung-beans/', source: "Swasthi's Recipes", kind: 'article' },
  ],
  kalaChana: [
    { title: 'Kala Chana (soak + pressure cook)', url: 'https://www.indianhealthyrecipes.com/kala-chana/', source: "Swasthi's Recipes", kind: 'article' },
  ],
  khichdi: [
    { title: 'Moong Dal Khichdi', url: 'https://www.cookwithmanali.com/moong-dal-khichdi/', source: 'Cook With Manali', kind: 'article' },
  ],
  cheela: [
    { title: 'Besan Chilla (Cheela)', url: 'https://www.indianhealthyrecipes.com/cheela-recipe/', source: "Swasthi's Recipes", kind: 'article' },
  ],
  moongCheela: [
    { title: 'Moong Dal Chilla', url: 'https://www.cookwithmanali.com/moong-dal-chilla/', source: 'Cook With Manali', kind: 'article' },
  ],
  sattuParatha: [
    { title: 'Sattu Paratha', url: 'https://www.cookwithmanali.com/sattu-paratha/', source: 'Cook With Manali', kind: 'article' },
  ],
  palakPaneer: [
    { title: 'Palak Paneer', url: 'https://www.indianhealthyrecipes.com/palak-paneer-recipe-easy-paneer-recipes-step-by-step-pics/', source: "Swasthi's Recipes", kind: 'article' },
  ],
  paneerTikka: [
    { title: 'Paneer Tikka (oven, air fryer or stovetop)', url: 'https://www.indianhealthyrecipes.com/paneer-tikka-on-stove-top/', source: "Swasthi's Recipes", kind: 'article' },
  ],
  soyaKeema: [
    { title: 'Soya Keema', url: 'https://www.indianhealthyrecipes.com/soya-keema/', source: "Swasthi's Recipes", kind: 'article' },
  ],
  paneerBhurji: [
    { title: 'Paneer Bhurji', url: 'https://www.indianhealthyrecipes.com/paneer-bhurji-recipe/', source: "Swasthi's Recipes", kind: 'article' },
  ],
  homemadePaneer: [
    { title: 'How to Make Paneer at Home', url: 'https://www.indianhealthyrecipes.com/how-to-make-paneer-cubes-at-home/', source: "Swasthi's Recipes", kind: 'article' },
  ],
  curd: [
    { title: 'How to Make Curd (Dahi) at Home', url: 'https://www.indianhealthyrecipes.com/how-to-make-thick-curd-at-home/', source: "Swasthi's Recipes", kind: 'article' },
  ],
  chaas: [
    { title: 'Masala Chaas (Spiced Buttermilk)', url: 'https://www.cookwithmanali.com/masala-chaas/', source: 'Cook With Manali', kind: 'article' },
  ],
  rajma: [
    { title: 'Homestyle Punjabi Rajma', url: 'https://www.cookwithmanali.com/homestyle-punjabi-rajma/', source: 'Cook With Manali', kind: 'article' },
  ],
  chole: [
    { title: 'Punjabi Chole Masala', url: 'https://www.indianhealthyrecipes.com/chole/', source: "Swasthi's Recipes", kind: 'article' },
  ],
  boiledEggs: [
    { title: 'How to Perfectly Boil Eggs', url: 'https://www.sanjeevkapoor.com/Recipe/How-to-Perfectly-Boil-Eggs-.html', source: 'Sanjeev Kapoor', kind: 'article' },
  ],
  eggBhurji: [
    { title: 'Egg Bhurji', url: 'https://www.cookwithmanali.com/egg-bhurji/', source: 'Cook With Manali', kind: 'article' },
  ],
  chickenCurry: [
    { title: 'Chicken Curry', url: 'https://www.indianhealthyrecipes.com/chicken-curry/', source: "Swasthi's Recipes", kind: 'article' },
  ],
  grilledChicken: [
    { title: 'Tandoori Chicken (oven / pan)', url: 'https://www.indianhealthyrecipes.com/tandoori-chicken-recipe/', source: "Swasthi's Recipes", kind: 'article' },
  ],
  fishCurry: [
    { title: 'Bengali Fish Curry (rohu)', url: 'https://www.sanjeevkapoor.com/Recipe/Bengali-Fish-Curry.html', source: 'Sanjeev Kapoor', kind: 'article' },
    { title: 'Bihari-Style Fish Curry', url: 'https://ranveerbrar.com/recipes/bihari-style-fish-curry/', source: 'Ranveer Brar', kind: 'article' },
  ],
  soyaChunks: [
    { title: 'Soya Chunks Curry', url: 'https://www.indianhealthyrecipes.com/soya-chunks-curry-meal-maker-curry/', source: "Swasthi's Recipes", kind: 'article' },
    { title: 'Soya Chunks Pulao', url: 'https://hebbarskitchen.com/soya-chunks-pulao-recipe-protein-rich/', source: "Hebbar's Kitchen", kind: 'article' },
  ],
  sweetPotato: [
    { title: 'Sweet Potato Chaat (roasted or boiled)', url: 'https://www.cookwithmanali.com/sweet-potato-chaat/', source: 'Cook With Manali', kind: 'article' },
  ],
  roti: [
    { title: 'Chapati (soft roti)', url: 'https://www.indianhealthyrecipes.com/chapati/', source: "Swasthi's Recipes", kind: 'article' },
  ],
  poha: [
    { title: 'Kanda Batata Poha', url: 'https://www.indianhealthyrecipes.com/poha-recipe-kanda-batata-poha/', source: "Swasthi's Recipes", kind: 'article' },
  ],
  dal: [
    { title: 'Dal Tadka', url: 'https://www.indianhealthyrecipes.com/dal-tadka/', source: "Swasthi's Recipes", kind: 'article' },
  ],
} satisfies Record<string, Tutorial[]>;

export type ExerciseTutorialId = keyof typeof EXERCISE_TUTORIALS;

// ─── One link per exercise and per alternative ───────────────────────────────
// A single tutorial each, a YouTube video wherever one could be found. The first
// group was checked on 7 Oct 2026 (docs/link-report.md); the rest were found by
// YouTube search and checked with the oEmbed endpoint on 12 Nov 2026 (title and
// channel shown here are from oEmbed). Run `npm run links` to re-check them all.
export const EXERCISE_LINKS = {
  backSquat: { title: 'Perfect Your Squat: Step-By-Step Form Guide', url: 'https://www.youtube.com/watch?v=8Kls95w2jFA', source: 'Squat University', kind: 'video' },
  benchPress: { title: 'How to Bench Press', url: 'https://www.youtube.com/watch?v=BYKScL2sgCs', source: 'Alan Thrall', kind: 'video' },
  rdl: { title: 'How To: Romanian Deadlift', url: 'https://www.youtube.com/watch?v=jEy_czb3RKA', source: 'Alan Thrall', kind: 'video' },
  trapBarDeadlift: { title: 'The Trap Bar Deadlift', url: 'https://www.youtube.com/watch?v=TU2xZ7s4jus', source: 'Alan Thrall', kind: 'video' },
  deadlift: { title: 'How To Deadlift: 5 Step Deadlift', url: 'https://www.youtube.com/watch?v=MBbyAqvTNkU', source: 'Alan Thrall', kind: 'video' },
  overheadPress: { title: 'Learning to Press', url: 'https://www.youtube.com/watch?v=8dacy5hjaE8', source: 'Starting Strength', kind: 'video' },
  latPulldown: { title: '8 Lat Pulldown Mistakes and How to Fix Them', url: 'https://www.youtube.com/watch?v=MyQVLFBwlJ8', source: 'Renaissance Periodization', kind: 'video' },
  pullUp: { title: 'Band-Assisted Pull-Up — form demo', url: 'https://www.youtube.com/watch?v=B_VkNQS5YLs', source: 'NASM', kind: 'video' },
  seatedRow: { title: 'Seated Cable Row — demo', url: 'https://www.youtube.com/watch?v=UCXxvVItLoM', source: 'Renaissance Periodization', kind: 'video' },
  inclineDbPress: { title: 'Two-Arm Incline Dumbbell Chest Press — demo', url: 'https://www.youtube.com/watch?v=JKnpHchOWPU', source: 'NASM', kind: 'video' },
  splitSquat: { title: 'The Ultimate Bulgarian Split Squat Tutorial', url: 'https://www.youtube.com/watch?v=-4LVK1crLSw', source: 'Squat University', kind: 'video' },
  hipThrust: { title: 'Proper Hip Thrust Form', url: 'https://www.youtube.com/watch?v=LM8XHLYJoYs', source: 'Bret Contreras', kind: 'video' },
  legPress: { title: 'Leg Press — form demo', url: 'https://www.youtube.com/watch?v=cDGOn-yfKJA', source: 'NASM', kind: 'video' },
  legCurl: { title: 'Seated Leg Curl — form demo', url: 'https://www.youtube.com/watch?v=_2Kd0d-JEUM', source: 'NASM', kind: 'video' },
  lateralRaise: { title: 'Dumbbell Lateral Raise — demo', url: 'https://www.youtube.com/watch?v=XPPfnSEATJA', source: 'NASM', kind: 'video' },
  facePull: { title: 'Face Pull — form demo', url: 'https://www.youtube.com/watch?v=eTCBSFlCJ_s', source: 'NASM', kind: 'video' },
  pushdown: { title: 'Rope Pushdown — demo', url: 'https://www.youtube.com/watch?v=-xa-6cQaZKY', source: 'Renaissance Periodization', kind: 'video' },
  curl: { title: 'Alternating Dumbbell Curl — demo', url: 'https://www.youtube.com/watch?v=iixND1P2lik', source: 'Renaissance Periodization', kind: 'video' },
  calfRaise: { title: '8 Calf Raise Mistakes and How to Fix Them', url: 'https://www.youtube.com/watch?v=Xa18jxyeSnM', source: 'Renaissance Periodization', kind: 'video' },
  hangingKneeRaise: { title: 'Hanging Knee Raise — demo', url: 'https://www.youtube.com/watch?v=RD_A-Z15ER4', source: 'Renaissance Periodization', kind: 'video' },
  smithSquat: { title: 'Exercise Tutorial: Smith Machine Squat', url: 'https://www.youtube.com/watch?v=iAcRGCsG_PY', source: 'Travis Tarrant', kind: 'video' },
  hackSquat: { title: 'How To Do A Machine Hack Squat', url: 'https://www.youtube.com/watch?v=VY8ko6ecfso', source: 'Live Lean TV', kind: 'video' },
  dbRdl: { title: 'Dumbbell Romanian Deadlift | Exercise Technique Library', url: 'https://www.youtube.com/watch?v=IJdUtnxAmNo', source: 'Dr. Jacob Goodin', kind: 'video' },
  ballLegCurl: { title: 'Stability-Ball Leg Curl', url: 'https://www.youtube.com/watch?v=WXOHRzZIPBA', source: 'Testosterone Nation', kind: 'video' },
  dbCalfRaise: { title: 'How To Do a Single Leg Dumbbell Calf Raise', url: 'https://www.youtube.com/watch?v=1D7s-VyLq0Y', source: 'Precision Nutrition', kind: 'video' },
  bandPallof: { title: 'How To: Resistance Band Pallof Press', url: 'https://www.youtube.com/watch?v=lqPrSGXfL1Q', source: 'Fitness Lab', kind: 'video' },
  cablePallof: { title: 'How To Perform The Standing Cable Pallof Press', url: 'https://www.youtube.com/watch?v=u4XcUc_3F5s', source: 'Exercise Healthcare Australia', kind: 'video' },
  dbBench: { title: 'How To: Dumbbell Bench Press | 3 Golden Rules', url: 'https://www.youtube.com/watch?v=Y_7aHqXeCfQ', source: 'ScottHermanFitness', kind: 'video' },
  oneArmRow: { title: 'One Arm Dumbbell Row', url: 'https://www.youtube.com/watch?v=PgpQ4-jHiq4', source: 'Bodybuilding.com', kind: 'video' },
  inclineMachinePress: { title: 'How To Do A Machine Incline Chest Press', url: 'https://www.youtube.com/watch?v=7_scLkTCwTU', source: 'Live Lean TV', kind: 'video' },
  assistedPullupMachine: { title: 'How to use the Assisted Pull Up Machine', url: 'https://www.youtube.com/watch?v=THSFzwAqYgk', source: 'McMaster Marauders', kind: 'video' },
  cableLateralRaise: { title: 'How To Do A Standing Single Arm Cable Lateral Raise', url: 'https://www.youtube.com/watch?v=Az_0nsym9AY', source: 'Live Lean TV', kind: 'video' },
  overheadExtension: { title: 'Dumbbell Seated Overhead Tricep Extension', url: 'https://www.youtube.com/watch?v=dxdr8iSRLA8', source: 'OPEX Fitness', kind: 'video' },
  ezCurl: { title: 'Exercise Tutorial: EZ Bar Bicep Curl', url: 'https://www.youtube.com/watch?v=SDFZBaJcTsU', source: 'Travis Tarrant', kind: 'video' },
  seatedDbPress: { title: 'Seated Dumbbell Shoulder Press: Demonstration', url: 'https://www.youtube.com/watch?v=SSXS4Z8OkCg', source: 'StrengthLog', kind: 'video' },
  smithSplitSquat: { title: 'How To Do Smith Machine Split Squat', url: 'https://www.youtube.com/watch?v=y8XdzYUGDaI', source: 'OriGym', kind: 'video' },
  captainsChair: { title: "How To Do A Captain's Chair Knee Raise", url: 'https://www.youtube.com/watch?v=7KDDZtaUaxw', source: 'Live Lean TV', kind: 'video' },
  gobletSquat: { title: 'How To Do A Goblet Squat Correctly', url: 'https://www.youtube.com/watch?v=JO7D6GJ98wY', source: 'Jack Hanrahan Fitness', kind: 'video' },
  chestSupportedRow: { title: 'Chest Supported Incline Dumbbell Row', url: 'https://www.youtube.com/watch?v=0-DXJiceG-0', source: 'OPEX Fitness', kind: 'video' },
  machineChestPress: { title: 'How To Use Gym Equipment: Seated Chest Press Machine', url: 'https://www.youtube.com/watch?v=Nv7TPc6btPk', source: 'GO Health Clubs', kind: 'video' },
  hipThrustMachine: { title: 'How to Use the Hip Thrust Machine', url: 'https://www.youtube.com/watch?v=UlljOYPM57U', source: 'Gainesville Health & Fitness', kind: 'video' },
  reverseFly: { title: 'How To Do Reverse Pec Deck / Reverse Fly Machine', url: 'https://www.youtube.com/watch?v=e4dJ1QoxUtI', source: 'Train For Life', kind: 'video' },
} satisfies Record<string, Tutorial>;

export type ExerciseLinkId = keyof typeof EXERCISE_LINKS;

export type TutorialId = keyof typeof COOKING_TUTORIALS;

export function cookingTutorials(ids: TutorialId[] = []): Tutorial[] {
  const seen = new Set<string>();
  const out: Tutorial[] = [];
  for (const id of ids) {
    for (const t of COOKING_TUTORIALS[id] as Tutorial[]) {
      if (!seen.has(t.url)) {
        seen.add(t.url);
        out.push(t);
      }
    }
  }
  return out;
}
