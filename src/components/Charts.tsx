import { cn } from "@/lib/utils";

export function BarChart({ data, height = 160 }: { data: { label: string; value: number }[]; height?: number }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center justify-end gap-1">
          <div className="w-full rounded-t bg-primary transition-all" style={{ height: `${(d.value / max) * (height - 28)}px` }} title={String(d.value)} />
          <span className="text-[10px] text-muted-foreground">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function LineChart({ points, height = 160 }: { points: number[]; height?: number }) {
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = max - min || 1;
  const w = 600;
  const step = w / (points.length - 1 || 1);
  const coords = points.map((p, i) => [i * step, height - 20 - ((p - min) / range) * (height - 40)]);
  const path = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${path} L${w},${height - 20} L0,${height - 20} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className={cn("w-full")} preserveAspectRatio="none" style={{ height }}>
      <path d={area} fill="currentColor" className="text-primary/10" />
      <path d={path} fill="none" stroke="currentColor" strokeWidth={2} className="text-primary" />
    </svg>
  );
}
