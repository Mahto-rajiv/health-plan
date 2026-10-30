// Checks every external URL in references and tutorials: does it resolve, and
// does the page title match what the app says it is? Writes docs/link-report.md.
// Run: npm run links   (needs network; takes ~1 minute)
import { writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { REFS } from '../lib/data/references';
import { COOKING_TUTORIALS, EXERCISE_TUTORIALS, type Tutorial } from '../lib/data/tutorials';

interface Link {
  where: string;
  expected: string;
  url: string;
}

type Status = 'ok' | 'redirected' | 'blocked' | 'failed';

interface Result extends Link {
  status: Status;
  code: number | string;
  title: string;
  finalUrl: string;
  match: 'yes' | 'check' | 'n/a';
}

const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36';

const links: Link[] = [
  ...Object.entries(REFS).map(([id, r]) => ({ where: `ref:${id}`, expected: r.label, url: r.url })),
  ...Object.entries({ ...EXERCISE_TUTORIALS, ...COOKING_TUTORIALS }).flatMap(([id, list]) =>
    (list as Tutorial[]).map((t) => ({ where: `tutorial:${id}`, expected: t.title, url: t.url })),
  ),
];

const words = (s: string) => new Set(s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter((w) => w.length > 3));

/** Share of the expected label's words that appear in the found title. */
function overlap(expected: string, title: string): number {
  const e = words(expected);
  const t = words(title);
  if (!e.size || !t.size) return 0;
  let hit = 0;
  for (const w of e) if (t.has(w)) hit++;
  return hit / Math.min(e.size, t.size);
}

async function fetchText(url: string): Promise<{ code: number; text: string; finalUrl: string }> {
  try {
    const res = await fetch(url, { redirect: 'follow', headers: { 'user-agent': UA, accept: 'text/html,application/json,*/*' }, signal: AbortSignal.timeout(25_000) });
    const text = res.headers.get('content-type')?.includes('pdf') ? '' : (await res.text()).slice(0, 400_000);
    return { code: res.status, text, finalUrl: res.url };
  } catch {
    // Some servers reject Node's TLS/HTTP client; curl is a second opinion.
    const out = execFileSync('curl', ['-sL', '--max-time', '30', '-A', UA, '-w', '\n%{http_code} %{url_effective}', url], { maxBuffer: 20_000_000 }).toString();
    const nl = out.lastIndexOf('\n');
    const [code, finalUrl] = out.slice(nl + 1).split(' ');
    return { code: Number(code), text: out.slice(0, nl).slice(0, 400_000), finalUrl };
  }
}

const decode = (s: string) =>
  s.replace(/&amp;/g, '&').replace(/&#39;|&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&#8211;|&ndash;/g, '–').replace(/&#8217;/g, '’').replace(/\s+/g, ' ').trim();

async function check(l: Link): Promise<Result> {
  try {
    // YouTube and PubMed block plain requests; use their public metadata APIs.
    const yt = l.url.match(/youtube\.com\/watch\?v=([\w-]+)|youtu\.be\/([\w-]+)/);
    if (yt) {
      const r = await fetchText(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(l.url)}`);
      if (r.code !== 200) return { ...l, status: 'failed', code: r.code, title: '', finalUrl: l.url, match: 'n/a' };
      const title = (JSON.parse(r.text) as { title: string; author_name: string }).title;
      return { ...l, status: 'ok', code: 200, title, finalUrl: l.url, match: overlap(l.expected, title) >= 0.3 ? 'yes' : 'check' };
    }
    const pm = l.url.match(/pubmed\.ncbi\.nlm\.nih\.gov\/(\d+)/);
    if (pm) {
      const r = await fetchText(`https://www.ebi.ac.uk/europepmc/webservices/rest/search?format=json&query=EXT_ID:${pm[1]}%20AND%20SRC:MED`);
      const hit = (JSON.parse(r.text) as { resultList: { result: { title: string }[] } }).resultList.result[0];
      if (!hit) return { ...l, status: 'failed', code: 'PMID not found', title: '', finalUrl: l.url, match: 'n/a' };
      return { ...l, status: 'ok', code: 200, title: hit.title, finalUrl: l.url, match: overlap(l.expected, hit.title) >= 0.3 ? 'yes' : 'check' };
    }
    const r = await fetchText(l.url);
    const title = decode(r.text.match(/<title[^>]*>([^<]*)/i)?.[1] ?? r.text.match(/<h1[^>]*>([^<]*)/i)?.[1] ?? '');
    const blocked = r.code === 401 || r.code === 403 || r.code === 429 || r.code === 202 || /just a moment|access denied|captcha/i.test(title);
    if (blocked) return { ...l, status: 'blocked', code: r.code, title, finalUrl: r.finalUrl, match: 'n/a' };
    if (r.code >= 400) return { ...l, status: 'failed', code: r.code, title, finalUrl: r.finalUrl, match: 'n/a' };
    const isPdf = /\.pdf($|\?)/i.test(r.finalUrl);
    const redirected = r.finalUrl.replace(/\/$/, '') !== l.url.replace(/\/$/, '');
    return {
      ...l,
      status: redirected ? 'redirected' : 'ok',
      code: r.code,
      title: isPdf ? '(PDF)' : title,
      finalUrl: r.finalUrl,
      match: isPdf ? 'n/a' : overlap(l.expected, title) >= 0.3 ? 'yes' : 'check',
    };
  } catch (e) {
    return { ...l, status: 'failed', code: (e as Error).name, title: '', finalUrl: l.url, match: 'n/a' };
  }
}

async function main() {
  const results: Result[] = [];
  const queue = [...links];
  await Promise.all(
    Array.from({ length: 6 }, async () => {
      while (queue.length) results.push(await check(queue.shift()!));
    }),
  );
  results.sort((a, b) => a.where.localeCompare(b.where));
  const count = (s: Status) => results.filter((r) => r.status === s).length;
  const esc = (s: string) => s.replace(/\|/g, '\\|');
  const lines = [
    '# Link check',
    '',
    `Run ${new Date().toISOString().slice(0, 10)} with \`npm run links\`. ${results.length} links: ${count('ok')} ok, ${count('redirected')} redirected, ${count('blocked')} blocked automated access, ${count('failed')} failed.`,
    '',
    '"Match" compares the title the app shows with the page title (YouTube via oEmbed, PubMed via Europe PMC). "check" means the words differ enough to look at by hand; "n/a" means no title could be read (PDF or blocked).',
    '',
    '| Status | Code | Where | Match | App label | Page title | URL |',
    '|---|---|---|---|---|---|---|',
    ...results.map((r) => `| ${r.status} | ${r.code} | ${r.where} | ${r.match} | ${esc(r.expected.slice(0, 80))} | ${esc(r.title.slice(0, 80))} | ${r.finalUrl === r.url ? r.url : `${r.url} → ${r.finalUrl}`} |`),
    '',
  ];
  writeFileSync('docs/link-report.md', lines.join('\n'));
  console.log(lines[2]);
  for (const r of results.filter((x) => x.status === 'failed' || x.match === 'check')) console.log(`${r.status.padEnd(10)} ${String(r.code).padEnd(5)} ${r.match.padEnd(5)} ${r.where}  ${r.url}  [${r.title.slice(0, 70)}]`);
  if (count('failed')) process.exitCode = 1;
}

main();
