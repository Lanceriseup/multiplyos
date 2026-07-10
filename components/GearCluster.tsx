// Decorative rotating gear cluster (Option A). Pure SVG + CSS animation.

function gearPath(cx: number, cy: number, rOut: number, teeth: number): string {
  const rIn = rOut * 0.8;
  const ta = (Math.PI * 2) / teeth;
  let d = "";
  for (let i = 0; i < teeth; i++) {
    const a = i * ta;
    const pts: [number, number][] = [
      [rIn, a],
      [rOut, a + ta * 0.2],
      [rOut, a + ta * 0.4],
      [rIn, a + ta * 0.6],
    ];
    pts.forEach(([r, ang], j) => {
      const x = cx + Math.cos(ang) * r;
      const y = cy + Math.sin(ang) * r;
      d += (i === 0 && j === 0 ? "M" : "L") + x.toFixed(2) + " " + y.toFixed(2);
    });
  }
  return d + "Z";
}

function Gear({
  cx,
  cy,
  rOut,
  teeth,
  color,
  spin,
}: {
  cx: number;
  cy: number;
  rOut: number;
  teeth: number;
  color: string;
  spin: string;
}) {
  return (
    <g className={spin}>
      <path d={gearPath(cx, cy, rOut, teeth)} fill={color} />
      <circle cx={cx} cy={cy} r={rOut * 0.34} fill="#FFFFFF" />
    </g>
  );
}

export default function GearCluster({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 116 92" className={className} aria-hidden="true">
      <Gear cx={70} cy={36} rOut={26} teeth={10} color="#4A4A4A" spin="gear-cw" />
      <Gear cx={34} cy={30} rOut={17} teeth={9} color="#A6A6A6" spin="gear-ccw" />
      <Gear cx={52} cy={64} rOut={20} teeth={10} color="#EA7B1B" spin="gear-cw fast" />
    </svg>
  );
}
