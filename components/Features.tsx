import Reveal from "./Reveal";

// Feature highlights — gradient illustration panel on top (orange), title +
// description below. Each panel is a small self-contained product mockup.
type Feature = {
  key: string;
  head: string;
  body: string;
};

const FEATURES: Feature[] = [
  { key: "score", head: "Weekly Scoreboards", body: "Give every department a live scoreboard and see green and red weeks at a glance." },
  { key: "cfo", head: "CFO Dashboard", body: "A real-time view that turns your numbers into decisions you can act on." },
  { key: "ai", head: "AI-Driven Decisions", body: "Built-in AI surfaces what needs attention and recommends the next move." },
  { key: "meet", head: "Leadership Meetings & 1-on-1s", body: "Structured leadership meetings and focused 1-on-1s with built-in agendas." },
  { key: "sop", head: "SOP & Training", body: "Capture processes as living SOPs and turn them into training your team uses." },
  { key: "task", head: "Projects & Tasks", body: "Plan, assign, and track work, connecting daily tasks to weekly goals." },
];

function GaugeRing({ value }: { value: number }) {
  const c = 2 * Math.PI * 20;
  return (
    <svg width="52" height="52" viewBox="0 0 56 56" className="shrink-0">
      <circle cx="28" cy="28" r="20" fill="none" stroke="#EEEEEE" strokeWidth="7" />
      <circle
        cx="28"
        cy="28"
        r="20"
        fill="none"
        stroke="#EA7B1B"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - value / 100)}
        transform="rotate(-90 28 28)"
      />
      <text x="28" y="33" textAnchor="middle" fontSize="15" fontWeight="800" fill="#334155">
        {value}
      </text>
    </svg>
  );
}

function GaugeCard({
  value,
  title,
  sub,
  chip,
  className = "",
}: {
  value: number;
  title: string;
  sub: string;
  chip: string;
  className?: string;
}) {
  return (
    <div className={`absolute flex items-center gap-3 rounded-xl bg-white p-3 shadow-xl ${className}`}>
      <GaugeRing value={value} />
      <div>
        <div className="whitespace-nowrap text-[12px] font-semibold text-slate-700">{title}</div>
        <div className="whitespace-nowrap text-[10px] font-medium text-emerald-600">{sub}</div>
        <span className="mt-1.5 inline-block rounded-md bg-brand-orange px-2 py-0.5 text-[9px] font-bold text-white">
          {chip}
        </span>
      </div>
    </div>
  );
}

function PhotoAvatar({ src, className = "" }: { src: string; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      className={`rounded-full object-cover shadow-md ring-2 ring-white ${className}`}
    />
  );
}

function Mockup({ k }: { k: string }) {
  switch (k) {
    case "score":
      return (
        <div className="absolute bottom-[-24px] left-[-24px] right-7 overflow-hidden rounded-xl bg-white pb-4 pl-8 pr-4 pt-4 shadow-xl">
          <div className="text-[11px] text-slate-500">Weekly Scoreboard</div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold tracking-tight text-slate-800">94%</span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-600">
              On track
            </span>
          </div>
          <div className="mt-3 flex h-20 items-end gap-[3px]">
            {[45, 62, 40, 70, 52, 66, 48, 74, 46, 92, 58, 68, 50, 60].map((h, i) => (
              <div
                key={i}
                className={`flex-1 rounded-sm ${i === 9 ? "bg-brand-orange" : "bg-brand-orange/20"}`}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
      );
    case "cfo":
      return (
        <div className="absolute left-6 right-[-28px] top-8 rounded-xl bg-white p-4 shadow-xl">
          <span className="text-[11px] text-slate-500">Monthly Revenue</span>
          <div className="text-2xl font-extrabold tracking-tight text-slate-800">$182,400</div>
          <span className="text-[10px] font-semibold text-emerald-600">▲ 12.4% vs last month</span>
          <svg viewBox="0 0 200 50" preserveAspectRatio="none" className="mt-2 h-12 w-full">
            <polyline points="0,40 28,34 56,36 84,22 112,26 140,14 168,12 200,5" fill="none" stroke="#EA7B1B" strokeWidth={2.5} />
            <polyline points="0,40 28,34 56,36 84,22 112,26 140,14 168,12 200,5 200,50 0,50" fill="rgba(234,123,27,0.12)" stroke="none" />
          </svg>
        </div>
      );
    case "ai":
      return (
        <>
          <GaugeCard
            value={82}
            title="Business Health"
            sub="Strong & improving"
            chip="2 actions"
            className="left-4 right-[-46px] top-7"
          />
          <GaugeCard
            value={70}
            title="Goal Progress"
            sub="On track for Q3"
            chip="3 in progress"
            className="left-9 right-[-22px] top-[120px]"
          />
        </>
      );
    case "meet":
      return (
        <>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
            <g stroke="rgba(255,255,255,0.55)" strokeWidth="0.6" strokeDasharray="3 3">
              <line x1="50" y1="50" x2="22" y2="28" />
              <line x1="50" y1="50" x2="80" y2="26" />
              <line x1="50" y1="50" x2="26" y2="74" />
              <line x1="50" y1="50" x2="78" y2="72" />
            </g>
          </svg>
          <PhotoAvatar src="https://i.pravatar.cc/120?img=12" className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2" />
          <PhotoAvatar src="https://i.pravatar.cc/120?img=13" className="absolute left-[22%] top-[28%] h-10 w-10 -translate-x-1/2 -translate-y-1/2" />
          <PhotoAvatar src="https://i.pravatar.cc/120?img=5" className="absolute left-[80%] top-[26%] h-10 w-10 -translate-x-1/2 -translate-y-1/2" />
          <PhotoAvatar src="https://i.pravatar.cc/120?img=47" className="absolute left-[26%] top-[74%] h-10 w-10 -translate-x-1/2 -translate-y-1/2" />
          <PhotoAvatar src="https://i.pravatar.cc/120?img=32" className="absolute left-[78%] top-[72%] h-10 w-10 -translate-x-1/2 -translate-y-1/2" />
        </>
      );
    case "sop":
      return (
        <div className="absolute inset-x-8 inset-y-5 rounded-xl bg-white p-4 shadow-xl">
          {/* dog-eared corner */}
          <span
            aria-hidden
            className="absolute right-0 top-0 h-0 w-0 border-l-[18px] border-t-[18px] border-l-transparent border-t-slate-100"
          />
          <div className="text-[11px] font-semibold text-slate-700">Sales Onboarding SOP</div>
          <div className="mt-0.5 text-[10px] text-slate-500">v2 · Updated 3d ago</div>
          <div className="mt-3 flex flex-col gap-1.5">
            <span className="h-[5px] w-full rounded bg-slate-100" />
            <span className="h-[5px] w-[92%] rounded bg-slate-100" />
            <span className="h-[5px] w-[74%] rounded bg-slate-100" />
            <span className="h-[5px] w-[58%] rounded bg-slate-100" />
          </div>
          {/* Loom-style webcam bubble, lower-right */}
          <span className="absolute -bottom-2 -right-2">
            <PhotoAvatar src="https://i.pravatar.cc/200?img=60" className="h-[68px] w-[68px] ring-[3px] ring-white" />
            <span className="absolute bottom-0 right-0 grid h-5 w-5 place-items-center rounded-full bg-brand-orange ring-2 ring-white">
              <span className="ml-px h-0 w-0 border-y-[4px] border-l-[6px] border-y-transparent border-l-white" />
            </span>
          </span>
        </div>
      );
    case "task":
      return (
        <div className="absolute inset-5 rounded-xl bg-white p-3 shadow-xl">
          <div className="grid h-full grid-cols-3 gap-2 text-left">
            {/* TO DO */}
            <div>
              <div className="mb-1.5 text-[9px] font-bold text-slate-400">TO DO</div>
              <div className="mb-1.5 rounded-md border border-slate-100 bg-slate-50 p-1.5">
                <span className="block text-[8px] font-medium leading-tight text-slate-600">Launch summer campaign</span>
                <span className="mt-1 inline-block rounded bg-amber-100 px-1 py-px text-[7px] font-bold text-amber-700">Marketing</span>
              </div>
              <div className="rounded-md border border-slate-100 bg-slate-50 p-1.5">
                <span className="block text-[8px] font-medium leading-tight text-slate-600">Refresh process docs</span>
                <span className="mt-1 inline-block rounded bg-slate-200 px-1 py-px text-[7px] font-bold text-slate-600">Ops</span>
              </div>
            </div>
            {/* DOING */}
            <div>
              <div className="mb-1.5 text-[9px] font-bold text-brand-orange-dark">DOING</div>
              <div className="rounded-md border border-brand-orange/30 bg-brand-orange/10 p-1.5">
                <span className="block text-[8px] font-medium leading-tight text-slate-700">Ship reporting v2</span>
                <span className="mt-1.5 block h-1 w-full overflow-hidden rounded bg-brand-orange/20">
                  <span className="block h-full w-1/2 rounded bg-brand-orange" />
                </span>
                <span className="mt-1 block text-[7px] text-slate-500">JD · 50%</span>
              </div>
            </div>
            {/* DONE */}
            <div>
              <div className="mb-1.5 text-[9px] font-bold text-emerald-600">DONE</div>
              {["Hire new CSM", "Q3 planning"].map((t) => (
                <div key={t} className="mb-1.5 flex items-start gap-1 rounded-md border border-emerald-200 bg-emerald-50 p-1.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth={3.5} className="mt-px h-2 w-2 shrink-0">
                    <path d="M5 12l4 4 10-11" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-[8px] leading-tight text-slate-500 line-through">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    default:
      return null;
  }
}

export default function Features() {
  return (
    <section id="features" className="scroll-mt-24 px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-container">
        <Reveal className="text-center">
          <h2 className="inline-block bg-gradient-to-r from-[#F6A85C] via-[#EA7B1B] to-[#C9650F] bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-6xl md:text-7xl">
            Features
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.key} delay={(i % 3) * 0.08}>
              <div className="group transition duration-300 hover:-translate-y-1">
                <div className="relative h-56 overflow-hidden rounded-2xl bg-gradient-to-br from-[#F2973C] to-[#C0600E] shadow-lg shadow-brand-orange/20">
                  <Mockup k={f.key} />
                </div>
                <h3 className="mt-4 text-base font-semibold text-brand-ink">
                  {f.head}
                </h3>
                <p className="mt-1 text-sm text-brand-charcoal">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
