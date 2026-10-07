'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  BarChart,
  Bar,
} from 'recharts';

export interface Series {
  key: string;
  name: string;
  color: string;
  dashed?: boolean;
  dots?: boolean;
  width?: number;
}

const axis = { fontSize: 11, fill: '#64748b' };
const tooltipStyle = { fontSize: 12, borderRadius: 10, border: '1px solid #e3e7ed', boxShadow: '0 4px 12px rgb(15 23 42 / 0.08)' };

export default function TrendChart({
  data,
  xKey,
  series,
  unit = '',
  domain,
  refLines = [],
  height = 220,
}: {
  data: Record<string, unknown>[];
  xKey: string;
  series: Series[];
  unit?: string;
  domain?: [number | string, number | string];
  refLines?: { y: number; label: string; color?: string }[];
  height?: number;
}) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#eef1f5" vertical={false} />
          <XAxis dataKey={xKey} tick={axis} tickLine={false} axisLine={false} minTickGap={24} />
          <YAxis
            tick={axis}
            tickLine={false}
            axisLine={false}
            domain={domain ?? [(min: number) => Math.floor(min - 0.5), (max: number) => Math.ceil(max + 0.5)]}
            width={40}
            tickFormatter={(v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1))}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(v, name) => [`${typeof v === 'number' ? Math.round(v * 10) / 10 : v}${unit}`, name]}
          />
          {refLines.map((r) => (
            <ReferenceLine
              key={r.label}
              y={r.y}
              stroke={r.color ?? '#94a3b8'}
              strokeDasharray="4 4"
              label={{ value: r.label, position: 'insideTopRight', fontSize: 10, fill: r.color ?? '#64748b' }}
            />
          ))}
          {series.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color}
              strokeWidth={s.width ?? 2}
              strokeDasharray={s.dashed ? '4 3' : undefined}
              dot={s.dots ? { r: 2.5, strokeWidth: 0, fill: s.color } : false}
              activeDot={{ r: 4 }}
              connectNulls
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function Bars({
  data,
  xKey,
  barKey,
  name,
  color = '#0f766e',
  unit = '',
  target,
  max,
  height = 200,
}: {
  data: Record<string, unknown>[];
  xKey: string;
  barKey: string;
  name: string;
  color?: string;
  unit?: string;
  target?: number;
  max?: number;
  height?: number;
}) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#eef1f5" vertical={false} />
          <XAxis dataKey={xKey} tick={axis} tickLine={false} axisLine={false} minTickGap={8} />
          <YAxis tick={axis} tickLine={false} axisLine={false} domain={[0, max ?? 'auto']} width={40} allowDecimals={false} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f1f5f9' }} formatter={(v) => [`${v}${unit}`, name]} />
          {target !== undefined && <ReferenceLine y={target} stroke="#94a3b8" strokeDasharray="4 4" />}
          <Bar dataKey={barKey} name={name} fill={color} radius={[4, 4, 0, 0]} maxBarSize={36} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
