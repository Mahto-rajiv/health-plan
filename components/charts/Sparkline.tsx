/** Tiny dependency-free SVG sparkline for the dashboard. */
export function Sparkline({ values, className, height = 40 }: { values: number[]; className?: string; height?: number }) {
  if (values.length < 2) return null;
  const w = 120;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => [(i / (values.length - 1)) * w, height - 4 - ((v - min) / span) * (height - 8)] as const);
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const [lx, ly] = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className={className} preserveAspectRatio="none" aria-hidden>
      <path d={d} fill="none" stroke="#0f766e" strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      <circle cx={lx} cy={ly} r={2.5} fill="#0f766e" />
    </svg>
  );
}
