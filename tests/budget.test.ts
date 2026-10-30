import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { BUDGET, BUDGET_LABEL, budgetStatus } from '../lib/config';

describe('budget labels', () => {
  it('derive from the single BUDGET constant', () => {
    assert.equal(budgetStatus(BUDGET.targetMin - 1), 'below-target');
    assert.equal(budgetStatus(BUDGET.targetMin), 'within-target');
    assert.equal(budgetStatus(BUDGET.targetMax), 'within-target');
    assert.equal(budgetStatus(BUDGET.targetMax + 1), 'above-target');
    assert.equal(budgetStatus(BUDGET.max + 1), 'above-max');
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
