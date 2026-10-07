// ─── Verified external tutorials ──────────────────────────────────────────────
// Every URL below was checked on 7 Oct 2026:
//  • YouTube links via the oEmbed endpoint (confirms the video exists and the
//    title/channel shown here).
//  • Web pages fetched (HTTP 200) and the page title / instructions read.
// Sources are reputable organisations (ACE, CDC, Cleveland Clinic, NASM, NHS
// trust) or established coaching/cooking channels. Where a trustworthy link could
// not be verified (e.g. machine-assisted pull-up, chest-supported row) the
// exercise simply has no link.

export interface Tutorial {
  title: string;
  url: string;
  source: string;
  kind: 'video' | 'article';
}

export const EXERCISE_TUTORIALS = {
  backSquat: [
    { title: 'Perfect Your Squat: Step-By-Step Form Guide', url: 'https://www.youtube.com/watch?v=8Kls95w2jFA', source: 'Squat University', kind: 'video' },
    { title: 'Back Squat — exercise guide', url: 'https://www.acefitness.org/resources/everyone/exercise-library/11/back-squat/', source: 'ACE', kind: 'article' },
  ],
  benchPress: [
    { title: 'How to Bench Press', url: 'https://www.youtube.com/watch?v=BYKScL2sgCs', source: 'Alan Thrall', kind: 'video' },
    { title: 'Chest Press (barbell bench)', url: 'https://www.acefitness.org/resources/everyone/exercise-library/5/chest-press/', source: 'ACE', kind: 'article' },
  ],
  rdl: [
    { title: 'How To: Romanian Deadlift', url: 'https://www.youtube.com/watch?v=jEy_czb3RKA', source: 'Alan Thrall', kind: 'video' },
    { title: 'Romanian Deadlift', url: 'https://www.acefitness.org/resources/everyone/exercise-library/317/romanian-deadlift/', source: 'ACE', kind: 'article' },
  ],
  trapBarDeadlift: [
    { title: 'The Trap Bar Deadlift', url: 'https://www.youtube.com/watch?v=TU2xZ7s4jus', source: 'Alan Thrall', kind: 'video' },
  ],
  deadlift: [
    { title: 'How To Deadlift: 5 Step Deadlift', url: 'https://www.youtube.com/watch?v=MBbyAqvTNkU', source: 'Alan Thrall', kind: 'video' },
    { title: 'Deadlift', url: 'https://www.acefitness.org/resources/everyone/exercise-library/6/deadlift/', source: 'ACE', kind: 'article' },
  ],
  overheadPress: [
    { title: 'Learning to Press', url: 'https://www.youtube.com/watch?v=8dacy5hjaE8', source: 'Starting Strength', kind: 'video' },
    { title: 'Standing Shoulder Press', url: 'https://www.acefitness.org/resources/everyone/exercise-library/71/standing-shoulder-press/', source: 'ACE', kind: 'article' },
  ],
  barbellRow: [
    { title: '"How To" Barbell Row', url: 'https://www.youtube.com/watch?v=G8l_8chR5BE', source: 'Alan Thrall', kind: 'video' },
    { title: 'Bent-Over Row', url: 'https://www.acefitness.org/resources/everyone/exercise-library/12/bent-over-row/', source: 'ACE', kind: 'article' },
  ],
  latPulldown: [
    { title: 'Seated Lat Pulldown', url: 'https://www.acefitness.org/resources/everyone/exercise-library/158/seated-lat-pulldown/', source: 'ACE', kind: 'article' },
    { title: '8 Lat Pulldown Mistakes and How to Fix Them', url: 'https://www.youtube.com/watch?v=MyQVLFBwlJ8', source: 'Renaissance Periodization', kind: 'video' },
  ],
  pullUp: [
    { title: "How to train pull-ups if you can't do 1 pull-up", url: 'https://www.youtube.com/watch?v=69VMtv3YN-Q', source: 'Alan Thrall', kind: 'video' },
    { title: 'Band-Assisted Pull-Up — form demo', url: 'https://www.youtube.com/watch?v=B_VkNQS5YLs', source: 'NASM', kind: 'video' },
  ],
  seatedRow: [
    { title: 'Seated Row', url: 'https://www.acefitness.org/resources/everyone/exercise-library/48/seated-row/', source: 'ACE', kind: 'article' },
    { title: 'Seated Cable Row — demo', url: 'https://www.youtube.com/watch?v=UCXxvVItLoM', source: 'Renaissance Periodization', kind: 'video' },
  ],
  inclineDbPress: [
    { title: 'Incline Chest Press', url: 'https://www.acefitness.org/resources/everyone/exercise-library/25/incline-chest-press/', source: 'ACE', kind: 'article' },
    { title: 'Two-Arm Incline Dumbbell Chest Press — demo', url: 'https://www.youtube.com/watch?v=JKnpHchOWPU', source: 'NASM', kind: 'video' },
  ],
  splitSquat: [
    { title: 'The Ultimate Bulgarian Split Squat Tutorial', url: 'https://www.youtube.com/watch?v=-4LVK1crLSw', source: 'Squat University', kind: 'video' },
    { title: 'Bulgarian Split Squat', url: 'https://www.acefitness.org/resources/everyone/exercise-library/366/bulgarian-split-squat/', source: 'ACE', kind: 'article' },
  ],
  hipThrust: [
    { title: 'Proper Hip Thrust Form', url: 'https://www.youtube.com/watch?v=LM8XHLYJoYs', source: 'Bret Contreras', kind: 'video' },
    { title: 'Elevated Glute Bridge (dumbbell hip thrust)', url: 'https://www.acefitness.org/resources/everyone/exercise-library/367/elevated-glute-bridge/', source: 'ACE', kind: 'article' },
  ],
  legPress: [
    { title: 'Seated Leg Press', url: 'https://www.acefitness.org/resources/everyone/exercise-library/154/seated-leg-press/', source: 'ACE', kind: 'article' },
    { title: 'Leg Press — form demo', url: 'https://www.youtube.com/watch?v=cDGOn-yfKJA', source: 'NASM', kind: 'video' },
  ],
  legCurl: [
    { title: 'Lying Hamstrings Curl', url: 'https://www.acefitness.org/resources/everyone/exercise-library/153/lying-hamstrings-curl/', source: 'ACE', kind: 'article' },
    { title: 'Seated Leg Curl — form demo', url: 'https://www.youtube.com/watch?v=_2Kd0d-JEUM', source: 'NASM', kind: 'video' },
  ],
  lateralRaise: [
    { title: 'Lateral Raise', url: 'https://www.acefitness.org/resources/everyone/exercise-library/26/lateral-raise/', source: 'ACE', kind: 'article' },
    { title: 'Dumbbell Lateral Raise — demo', url: 'https://www.youtube.com/watch?v=XPPfnSEATJA', source: 'NASM', kind: 'video' },
  ],
  facePull: [
    { title: 'Face Pull — form demo', url: 'https://www.youtube.com/watch?v=eTCBSFlCJ_s', source: 'NASM', kind: 'video' },
  ],
  pushdown: [
    { title: 'Triceps Pressdown (rope)', url: 'https://www.acefitness.org/resources/everyone/exercise-library/3/triceps-pressdown/', source: 'ACE', kind: 'article' },
    { title: 'Rope Pushdown — demo', url: 'https://www.youtube.com/watch?v=-xa-6cQaZKY', source: 'Renaissance Periodization', kind: 'video' },
  ],
  curl: [
    { title: 'Seated Biceps Curl', url: 'https://www.acefitness.org/resources/everyone/exercise-library/44/seated-biceps-curl/', source: 'ACE', kind: 'article' },
    { title: 'Alternating Dumbbell Curl — demo', url: 'https://www.youtube.com/watch?v=iixND1P2lik', source: 'Renaissance Periodization', kind: 'video' },
  ],
  calfRaise: [
    { title: '8 Calf Raise Mistakes and How to Fix Them', url: 'https://www.youtube.com/watch?v=Xa18jxyeSnM', source: 'Renaissance Periodization', kind: 'video' },
  ],
  plank: [
    { title: 'How to Do a Plank', url: 'https://www.acefitness.org/resources/everyone/exercise-library/32/front-plank/', source: 'ACE', kind: 'article' },
  ],
  deadBug: [
    { title: 'Supine Dead Bug', url: 'https://www.acefitness.org/resources/everyone/exercise-library/147/supine-dead-bug/', source: 'ACE', kind: 'article' },
    { title: 'Dead Bug — form demo', url: 'https://www.youtube.com/watch?v=bxn9FBrt4-A', source: 'NASM', kind: 'video' },
  ],
  pallofPress: [
    { title: 'Standing Anti-Rotation Press (Pallof press)', url: 'https://www.acefitness.org/resources/everyone/exercise-library/332/standing-anti-rotation-press/', source: 'ACE', kind: 'article' },
    { title: 'How to do a Pallof Press', url: 'https://www.youtube.com/watch?v=f3R99GoYvCs', source: 'NASM', kind: 'video' },
  ],
  hangingKneeRaise: [
    { title: 'Hanging Knee Raise — demo', url: 'https://www.youtube.com/watch?v=RD_A-Z15ER4', source: 'Renaissance Periodization', kind: 'video' },
  ],
  farmersCarry: [
    { title: "Farmer's Carry", url: 'https://www.acefitness.org/resources/everyone/exercise-library/359/farmer-s-carry/', source: 'ACE', kind: 'article' },
  ],
  boxJump: [
    { title: 'Box Jumps (with landing technique)', url: 'https://www.acefitness.org/resources/everyone/exercise-library/115/box-jumps/', source: 'ACE', kind: 'article' },
    { title: 'Beginner Box Jump Exercises', url: 'https://www.youtube.com/watch?v=kNIInK_Le8I', source: 'NASM', kind: 'video' },
  ],
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
  squatWarmUp: [
    { title: 'The Greatest Squat Warm Up Routine', url: 'https://www.youtube.com/watch?v=pCEpcIo-O4I', source: 'Squat University', kind: 'video' },
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
