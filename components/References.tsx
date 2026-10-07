import { REFS, type RefId } from '@/lib/data/references';
import { Disclosure } from './ui/Disclosure';

/** Collapsible list of verified sources for a section. */
export function References({ ids, title = 'Sources' }: { ids: RefId[]; title?: string }) {
  const unique = [...new Set(ids)];
  return (
    <Disclosure summary={<span className="text-muted">{title} ({unique.length})</span>} className="mt-4">
      <ol className="list-decimal space-y-2 pl-5 text-xs leading-relaxed text-ink-2">
        {unique.map((id) => {
          const r = REFS[id] as { label: string; url: string; note?: string };
          return (
            <li key={id} className="break-words">
              <a href={r.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {r.label}
              </a>
              <span className="sr-only"> (opens in a new tab)</span>
              {r.note && <span className="text-muted"> — {r.note}</span>}
            </li>
          );
        })}
      </ol>
    </Disclosure>
  );
}
