// Builds lib/data/composition.generated.ts from IFCT 2017 and USDA SR28.
// Run: npm run food-data   (needs network the first time; caches in .cache/food-data)
// Sources and matching rules: scripts/food-data/sources.ts.
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { SOURCES, type FoodSource } from './sources';
import { NUTRIENT_KEYS, type NutrientKey } from '../../lib/data/nutrient-keys';
import { NUTRIENT_BY_KEY } from '../../lib/data/nutrients';

const CACHE = '.cache/food-data';
const DOWNLOADS = {
  ifct: {
    url: 'https://registry.npmjs.org/ifct2017/-/ifct2017-2.1.2.tgz',
    sha256: '79fa4a811a60a3b6fc9724690980ab61a16627b260a9065b20900958292c2aef',
    file: 'ifct2017-2.1.2.tgz',
  },
  sr28: {
    url: 'https://www.ars.usda.gov/ARSUserFiles/80400535/DATA/SR/sr28/dnload/sr28asc.zip',
    sha256: '8308fd1d224ef1e5331093748007180da01a7ac713cbac6a1f5bc2a03e1ee70a',
    file: 'sr28asc.zip',
  },
};

function download(d: { url: string; sha256: string; file: string }): string {
  const path = join(CACHE, d.file);
  if (!existsSync(path)) {
    console.log(`Downloading ${d.url}`);
    execFileSync('curl', ['-sSfL', '--max-time', '300', '-o', path, d.url]);
  }
  const hash = createHash('sha256').update(readFileSync(path)).digest('hex');
  if (hash !== d.sha256) throw new Error(`${d.file}: sha256 ${hash} does not match the pinned ${d.sha256}. Delete it and re-run, or review the new release.`);
  return path;
}

/** Minimal RFC 4180 CSV parser (IFCT names contain quoted commas and newlines). */
function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else field += c;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  const [head, ...body] = rows;
  return body.filter((r) => r.length === head.length).map((r) => Object.fromEntries(head.map((h, i) => [h, r[i]])));
}

/** USDA SR28 ASCII: fields separated by ^, text in ~tildes~. */
const srFields = (line: string) => line.split('^').map((f) => f.replace(/^~|~$/g, ''));

// IFCT columns are in grams per 100 g edible portion. Factor converts to the app unit.
const IFCT: Record<Exclude<NutrientKey, 'vitA' | 'b12'>, [string, number]> = {
  protein: ['protcnt', 1],
  carbs: ['choavldf', 1],
  fat: ['fatce', 1],
  fiber: ['fibtg', 1],
  calcium: ['ca', 1e3],
  iron: ['fe', 1e3],
  zinc: ['zn', 1e3],
  magnesium: ['mg', 1e3],
  phosphorus: ['p', 1e3],
  potassium: ['k', 1e3],
  sodium: ['na', 1e3],
  copper: ['cu', 1e3],
  selenium: ['se', 1e6],
  manganese: ['mn', 1e3],
  thiamin: ['thia', 1e3],
  riboflavin: ['ribf', 1e3],
  niacin: ['nia', 1e3],
  b6: ['vitb6c', 1e3],
  folate: ['folsum', 1e6],
  vitC: ['vitc', 1e3],
  vitE: ['tocpha', 1e3],
  vitK: ['vitk1', 1e6],
  biotin: ['biot', 1e6],
  ala: ['f18d3n3', 1],
  la: ['f18d2cn6', 1],
};

// USDA SR28 nutrient numbers, already in the app units. A list means "first one present".
const SR: Record<Exclude<NutrientKey, 'carbs' | 'biotin'>, string[]> = {
  protein: ['203'],
  fat: ['204'],
  fiber: ['291'],
  calcium: ['301'],
  iron: ['303'],
  magnesium: ['304'],
  phosphorus: ['305'],
  potassium: ['306'],
  sodium: ['307'],
  zinc: ['309'],
  copper: ['312'],
  manganese: ['315'],
  selenium: ['317'],
  vitA: ['320'],
  vitE: ['323'],
  vitC: ['401'],
  thiamin: ['404'],
  riboflavin: ['405'],
  niacin: ['406'],
  b6: ['415'],
  folate: ['435', '417'],
  b12: ['418'],
  vitK: ['430'],
  ala: ['851', '619'],
  la: ['675', '618'],
};

const round = (v: number) => Number(v.toPrecision(4));
/** IFCT-vs-USDA ratio above which a vitamin or mineral takes the lower value. */
const DISAGREE = 4;
const MACROS: NutrientKey[] = ['protein', 'fat', 'carbs', 'fiber'];

function main() {
  mkdirSync(CACHE, { recursive: true });
  const ifctTgz = download(DOWNLOADS.ifct);
  const srZip = download(DOWNLOADS.sr28);
  const ifctCsv = execFileSync('tar', ['-xzOf', ifctTgz, 'package/compositions/index.csv'], { maxBuffer: 50e6 }).toString();
  const unzip = (name: string) => execFileSync('unzip', ['-p', srZip, name], { maxBuffer: 200e6 }).toString('latin1');

  const ifct = new Map(parseCsv(ifctCsv).map((r) => [r.code, r]));
  const srFoods = new Map<string, { name: string; refuse: number | null; refuseDesc: string }>();
  for (const line of unzip('FOOD_DES.txt').split(/\r?\n/)) {
    if (!line) continue;
    const f = srFields(line);
    srFoods.set(f[0], { name: f[2], refuseDesc: f[7], refuse: f[8] === '' ? null : Number(f[8]) });
  }
  const checkNdb = (s: FoodSource) => s.check ?? s.refuse;
  const wanted = new Set(Object.values(SOURCES).flatMap((s) => [s.usda, typeof s.b12 === 'string' ? s.b12 : undefined, checkNdb(s)]).filter(Boolean) as string[]);
  const srValues = new Map<string, Map<string, number>>();
  // Highest value of each nutrient in any SR28 food: a physical ceiling for the plausibility test.
  const srNumToKey = new Map(Object.entries(SR).flatMap(([k, nums]) => nums.map((n) => [n, k as NutrientKey] as const)));
  const srMax = {} as Partial<Record<NutrientKey, { value: number; ndb: string }>>;
  for (const line of unzip('NUT_DATA.txt').split(/\r?\n/)) {
    if (!line) continue;
    const f = srFields(line);
    const key = srNumToKey.get(f[1]);
    if (key && Number(f[2]) > (srMax[key]?.value ?? -1)) srMax[key] = { value: Number(f[2]), ndb: f[0] };
    if (!wanted.has(f[0])) continue;
    if (!srValues.has(f[0])) srValues.set(f[0], new Map());
    srValues.get(f[0])!.set(f[1], Number(f[2]));
  }

  // ROOT-CAUSE FIX for a transcription error in the ifct2017 npm package (found in Round 3).
  // In the printed IFCT 2017, Table 2 (water-soluble vitamins) for fish and shellfish (groups
  // P–S) has only six columns: B1, B2, B3, B5, B6 (mg) and total folate (µg); there is no
  // biotin column. The package puts the B6 figure in mg into a column it treats as grams
  // (1,000× too high), puts folate (µg × 10⁻⁴) into the biotin column, and writes folate as 0.
  // Checked row by row against the PDF, e.g. Rohu S006, p. 60: B6 0.24 mg, folate 12.63 µg;
  // package: vitb6c 0.24, biot 0.001263, folsum 0. Every P–S row follows the same pattern.
  const FISH_TABLE = /^[PQRS]\d/;
  // Single cells the package mistyped, corrected from the printed PDF (see sources.ts `pdf`).
  const pdfFix = new Map<string, Record<string, number>>();
  for (const s of Object.values(SOURCES)) if (s.pdf && typeof s.ifct === 'string') pdfFix.set(s.ifct, s.pdf);
  const ifctCell = (code: string, col: string): number | null => {
    const r = ifct.get(code);
    if (!r) return null;
    const fixed = pdfFix.get(code)?.[col];
    if (fixed !== undefined) return fixed;
    if (FISH_TABLE.test(code)) {
      if (col === 'vitb6c') return Number(r.vitb6c) / 1e3;
      if (col === 'folsum') return Number(r.biot) / 1e2;
      if (col === 'biot') return null; // not analysed for fish
    }
    const v = r[col];
    return v === undefined || v === '' ? null : Number(v);
  };
  const ifctValue = (codes: string[], col: string): number | null => {
    const vals = codes.map((c) => ifctCell(c, col));
    if (vals.some((v) => v === null)) return null;
    return (vals as number[]).reduce((s, v) => s + v, 0) / vals.length;
  };
  const srValue = (ndb: string, nums: string[]): number | null => {
    const m = srValues.get(ndb);
    for (const n of nums) if (m?.has(n)) return m.get(n)!;
    return null;
  };

  type Check = { ndb: string; name: string; values: Partial<Record<NutrientKey, number | null>> };
  const srAll = (ndb: string) => {
    const values: Partial<Record<NutrientKey, number | null>> = {};
    for (const [key, nums] of Object.entries(SR)) values[key as NutrientKey] = srValue(ndb, nums);
    const carb = srValue(ndb, ['205']);
    values.carbs = carb === null ? null : Math.max(0, carb - (values.fiber ?? 0));
    const trp = srValue(ndb, ['501']);
    if (values.niacin != null && trp !== null) values.niacin += (trp * 1000) / 60; // niacin equivalents, as for the main values
    for (const k of Object.keys(values) as NutrientKey[]) if (values[k] != null) values[k] = round(values[k]!);
    return values;
  };
  const out: Record<string, { source: string; tabulatedKcal: number | null; edible: number; edibleSource: string; waterAsh: number | null; check: Check | null; values: Record<NutrientKey, number | null> }> = {};
  const gaps: string[] = [];
  for (const [id, s] of Object.entries(SOURCES) as [string, FoodSource][]) {
    const values = {} as Record<NutrientKey, number | null>;
    let source: string;
    if (s.ifct) {
      const codes = Array.isArray(s.ifct) ? s.ifct : [s.ifct];
      for (const c of codes) if (!ifct.has(c)) throw new Error(`${id}: IFCT code ${c} not found`);
      source = `IFCT 2017 ${codes.join(', ')} (${codes.map((c) => ifct.get(c)!.name.replace(/\s+/g, ' ')).join('; ')})`;
      for (const [key, [col, factor]] of Object.entries(IFCT)) {
        const v = ifctValue(codes, col);
        values[key as NutrientKey] = v === null ? null : v * factor;
      }
      // Niacin equivalents: preformed niacin + tryptophan / 60 (the body makes niacin from tryptophan).
      const trp = ifctValue(codes, 'trp');
      if (values.niacin !== null && trp !== null) values.niacin += (trp * 1000) / 60;
      // Vitamin A as retinol activity equivalents: retinol + β-carotene / 12 (US IOM 2001 factor).
      const retinol = ifctValue(codes, 'retol');
      const carotene = ifctValue(codes, 'cartb');
      values.vitA = retinol === null || carotene === null ? null : retinol * 1e6 + (carotene * 1e6) / 12;
      if (s.b12 === 0) values.b12 = 0;
      else if (s.b12) {
        values.b12 = srValue(s.b12, ['418']);
        source += `; B12 from USDA SR28 ${s.b12} (${srFoods.get(s.b12)?.name})`;
      } else values.b12 = null;
      // Zero rule. The package has no blank cells, so a 0 may mean "not analysed". A 0 is
      // replaced by the USDA equivalent when that food has a meaningful amount (≥ 5% of the
      // RDA/AI per 100 g; ≥ 0.5 g for macros and fatty acids), unless the zero was checked
      // against the PDF (`zeroConfirmed`). Foods listed in `notAnalysed` are filled the same way.
      const c = checkNdb(s);
      const eq = c ? srAll(c) : null;
      const filled: string[] = [];
      for (const k of NUTRIENT_KEYS) {
        if (k === 'b12' || k === 'biotin' || s.zeroConfirmed?.includes(k)) continue;
        const u = eq?.[k];
        if (u == null) continue;
        const ref = NUTRIENT_BY_KEY[k]?.rda ?? NUTRIENT_BY_KEY[k]?.ear;
        const meaningful = ref ? u >= 0.05 * ref : u >= 0.5;
        if (s.notAnalysed?.includes(k) || (values[k] === 0 && meaningful)) {
          values[k] = u;
          filled.push(k);
        }
      }
      for (const k of s.notAnalysed ?? []) if (!filled.includes(k)) throw new Error(`${id}: notAnalysed ${k} has no USDA value to fill from`);
      if (filled.length) source += `; not analysed in IFCT (0 in the package), so from USDA SR28 ${c} (${srFoods.get(c!)?.name}): ${filled.join(', ')}`;
      // Conservative rule: vitamins and minerals more than 4× apart between IFCT and the
      // USDA equivalent take the lower value. Macros stay IFCT.
      const lowered: string[] = [];
      for (const k of NUTRIENT_KEYS) {
        if (MACROS.includes(k) || filled.includes(k)) continue;
        const v = values[k];
        const u = eq?.[k];
        if (v == null || u == null || v <= 0 || u <= 0 || (v / u <= DISAGREE && u / v <= DISAGREE)) continue;
        lowered.push(`${k} (IFCT ${round(v)}, USDA ${u})`);
        values[k] = Math.min(v, u);
      }
      if (lowered.length) source += `; IFCT and USDA ${c} differ more than ${DISAGREE}×, lower value used: ${lowered.join(', ')}`;
    } else if (s.usda) {
      if (!srFoods.has(s.usda)) throw new Error(`${id}: USDA NDB ${s.usda} not found`);
      source = `USDA SR28 ${s.usda} (${srFoods.get(s.usda)!.name})`;
      for (const [key, nums] of Object.entries(SR)) values[key as NutrientKey] = srValue(s.usda, nums);
      // SR28 carbohydrate is "by difference" and includes fibre; the app uses available carbohydrate.
      const carb = srValue(s.usda, ['205']);
      values.carbs = carb === null ? null : Math.max(0, carb - (values.fiber ?? 0));
      const trp = srValue(s.usda, ['501']);
      if (values.niacin !== null && trp !== null) values.niacin += (trp * 1000) / 60; // niacin equivalents, as above
      values.biotin = null; // SR28 has no biotin
      for (const [key, code] of Object.entries(s.fillFromIfct ?? {})) {
        const v = ifctValue([code], IFCT[key as 'biotin'][0]);
        values[key as NutrientKey] = v === null ? null : v * IFCT[key as 'biotin'][1];
        source += `; ${key} from IFCT 2017 ${code}`;
      }
    } else throw new Error(`${id}: no source`);

    // The table's own energy value, kept only to cross-check the app's 4/4/9 + fibre calculation.
    let tabulatedKcal: number | null = null;
    if (s.ifct) {
      const kj = ifctValue(Array.isArray(s.ifct) ? s.ifct : [s.ifct], 'enerc');
      tabulatedKcal = kj === null ? null : kj / 4.184;
    } else tabulatedKcal = srValue(s.usda!, ['208']);
    let edible = 1;
    let edibleSource = 'Sold as eaten (no peel or seeds).';
    if (s.refuse) {
      const r = srFoods.get(s.refuse);
      if (r?.refuse == null) throw new Error(`${id}: no refuse for ${s.refuse}`);
      edible = 1 - r.refuse / 100;
      edibleSource = `USDA SR28 ${s.refuse}: ${r.refuse}% refuse (${r.refuseDesc}).`;
    } else if (s.edibleApprox) {
      edible = s.edibleApprox;
      edibleSource = 'Approximation (no measured value found).';
    }
    for (const k of NUTRIENT_KEYS) {
      const v = values[k];
      values[k] = v === null || v === undefined ? null : round(v);
      if (values[k] === null) gaps.push(`${id}.${k}`);
    }
    // Water + ash (g/100 g) from the main table, so the test can check that a row's parts add up to ~100 g.
    let waterAsh: number | null = null;
    if (s.ifct) {
      const codes = Array.isArray(s.ifct) ? s.ifct : [s.ifct];
      const w = ifctValue(codes, 'water');
      const a = ifctValue(codes, 'ash');
      waterAsh = w === null || a === null ? null : round(w + a);
    } else {
      const w = srValue(s.usda!, ['255']);
      const a = srValue(s.usda!, ['207']);
      waterAsh = w === null || a === null ? null : round(w + a);
    }
    const c = s.ifct ? checkNdb(s) : undefined;
    if (c && !srFoods.has(c)) throw new Error(`${id}: check NDB ${c} not found`);
    const check = c ? { ndb: c, name: srFoods.get(c)!.name, values: srAll(c) } : null;
    out[id] = { source, tabulatedKcal: tabulatedKcal === null ? null : round(tabulatedKcal), edible: round(edible), edibleSource, waterAsh, check, values };
  }

  const header = `// GENERATED by scripts/food-data/build.ts — do not edit by hand. Run \`npm run food-data\`.
// Per 100 g edible portion. null = the source has no value (shown as a data gap in the app).
// Sources: IFCT 2017 (ICMR-NIN, via ifct2017@2.1.2) and USDA SR28. See scripts/food-data/sources.ts.
import type { NutrientKey } from './nutrient-keys';

export interface Composition {
  source: string;
  /** The table's own kcal per 100 g (cross-check only; the app computes kcal from macros). */
  tabulatedKcal: number | null;
  /** Share of the bought weight that is eaten. */
  edible: number;
  edibleSource: string;
  /** Water + ash, g per 100 g, from the same table (for the mass-balance check). */
  waterAsh: number | null;
  /** The closest USDA SR28 food, for the plausibility test only (IFCT foods). */
  check: { ndb: string; name: string; values: Partial<Record<NutrientKey, number | null>> } | null;
  values: Record<NutrientKey, number | null>;
}

`;
  const maxes = Object.fromEntries(Object.entries(srMax).map(([k, v]) => [k, { ...v!, name: srFoods.get(v!.ndb)?.name ?? '' }]));
  const body =
    `export const COMPOSITION = ${JSON.stringify(out, null, 2)} satisfies Record<string, Composition>;\n\n` +
    `/** Highest value per 100 g of each nutrient in any of the ${srFoods.size} USDA SR28 foods (plausibility ceiling). */\n` +
    `export const SR28_MAX: Partial<Record<NutrientKey, { value: number; ndb: string; name: string }>> = ${JSON.stringify(maxes, null, 2)};\n`;
  writeFileSync('lib/data/composition.generated.ts', header + body);
  console.log(`Wrote ${Object.keys(out).length} foods. ${gaps.length} missing values:`);
  const byNutrient = new Map<string, string[]>();
  for (const g of gaps) {
    const [food, k] = g.split('.');
    byNutrient.set(k, [...(byNutrient.get(k) ?? []), food]);
  }
  for (const [k, foods] of byNutrient) console.log(`  ${k}: ${foods.join(', ')}`);
}

main();
