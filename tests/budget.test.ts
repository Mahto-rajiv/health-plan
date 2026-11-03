import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { BUDGET, BUDGET_LABEL, budgetStatus } from '../lib/config';

describe('budget labels', () => {
  it('derive from the single BUDGET constant', () => {
    // Round 2: one ceiling (₹6,000), no lower target.
    assert.equal(BUDGET.max, 6000);
    assert.ok(BUDGET.planningMax < BUDGET.max);
    assert.equal(budgetStatus(1000), 'within');
    assert.equal(budgetStatus(BUDGET.max), 'within');
    assert.equal(budgetStatus(BUDGET.max + 1), 'over');
    assert.ok(Object.values(BUDGET_LABEL).every((l) => l.length > 0));
  });

  it('no page or data file hard-codes a budget figure', () => {
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const f of readdirSync(dir)) {
        const p = join(dir, f);
        if (statSync(p).isDirectory()) walk(p);
        else if (/\.(ts|tsx)$/.test(f)) files.push(p);
      }
    };
    for (const d of ['app', 'components', 'lib']) walk(d);
    // Budget amounts written as text (₹3,000, 4,000, ₹4,500 …) outside lib/config.ts.
    const re = /₹\s?[3-6],?000|₹\s?4,?500|BUDGET_(MIN|MAX)\b/;
    const offenders = files.filter((f) => !f.endsWith('lib/config.ts') && re.test(readFileSync(f, 'utf8')));
    assert.deepEqual(offenders, []);
  });
});

describe('app text', () => {
  it('has no doctor or consultation wording; only the footer says "not medical advice"', () => {
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const f of readdirSync(dir)) {
        const p = join(dir, f);
        if (statSync(p).isDirectory()) walk(p);
        else if (/\.(ts|tsx)$/.test(f)) files.push(p);
      }
    };
    for (const d of ['app', 'components', 'lib']) walk(d);
    const re = /doctor|dermatolog|physician|clinician|consult|prescri|medical|get it checked/i;
    const footer = 'Educational guidance, not medical advice.';
    const offenders: string[] = [];
    for (const f of files) {
      // Reference titles are citations (e.g. "WHO Expert Consultation", "J Assoc Physicians India"), not advice.
      if (f.endsWith('lib/data/references.ts')) continue;
      readFileSync(f, 'utf8')
        .split('\n')
        .forEach((line, i) => {
          if (re.test(line.replaceAll(footer, ''))) offenders.push(`${f}:${i + 1}`);
        });
    }
    assert.deepEqual(offenders, []);
  });
});
