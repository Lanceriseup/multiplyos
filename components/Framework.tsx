import Reveal from "./Reveal";
import GearCluster from "./GearCluster";

// The Multiply Framework — Plan · People · Process · Product, rendered as a
// technical "blueprint" schematic: dashed wireframe modules wired together
// with a dotted orange bus, on graph paper.
const PILLARS = [
  {
    n: "01",
    name: "Plan",
    desc: "One shared mission, vision, and quarterly goals. Everyone rowing the same direction.",
  },
  {
    n: "02",
    name: "People",
    desc: "The right people in the right seats, developed into mission-driven leaders.",
  },
  {
    n: "03",
    name: "Process",
    desc: "Documented systems and SOPs that make great execution repeatable.",
  },
  {
    n: "04",
    name: "Product",
    desc: "Consistently deliver what your customers love, then scale it.",
  },
];

export default function Framework() {
  return (
    <section
      id="framework"
      className="scroll-mt-24 py-14 sm:py-24"
      style={{
        backgroundColor: "#FBFAF8",
        backgroundImage:
          "linear-gradient(rgba(14,13,12,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(14,13,12,0.045) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      <div className="mx-auto max-w-[1440px] px-6 sm:px-10">
        <Reveal className="text-center">
          <h2 className="mx-auto max-w-4xl whitespace-nowrap text-[clamp(1.5rem,7vw,2.5rem)] font-extrabold tracking-tight text-brand-ink sm:whitespace-normal sm:text-balance sm:text-5xl md:text-6xl md:leading-[1.04]">
            <span className="relative inline-block">
              <span className="relative z-10">
                A system, <span className="text-brand-orange">by design</span>
              </span>
              <GearCluster className="pointer-events-none absolute right-[-0.5em] top-1/2 z-0 h-[1.7em] w-auto -translate-y-1/2 opacity-40" />
            </span>
          </h2>
        </Reveal>

          <Reveal className="relative mt-8 grid grid-cols-2 gap-3 sm:mt-14 sm:grid-cols-4 sm:gap-6">
            {/* dotted orange bus connecting the module nodes (desktop) */}
            <div
              aria-hidden
              className="absolute left-[12.5%] right-[12.5%] top-[7px] hidden h-0.5 opacity-70 sm:block"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, #EA7B1B 0 7px, transparent 7px 15px)",
              }}
            />
            {PILLARS.map((p) => (
              <div key={p.n} className="relative flex flex-col text-center">
                <div className="relative z-10 mx-auto mb-5 hidden h-4 w-4 rounded-full border-2 border-brand-orange bg-[#FBFAF8] sm:block" />
                <div className="flex-1 rounded-[10px] border-[1.5px] border-dashed border-black/30 bg-white/70 p-3.5 text-left sm:p-5">
                  <div className="flex items-baseline gap-2 sm:block">
                    <div className="font-mono text-xs font-bold tracking-wide text-brand-orange-dark">
                      [{p.n}]
                    </div>
                    <h3 className="text-lg font-extrabold text-brand-ink sm:mt-1.5">
                      {p.name}
                    </h3>
                  </div>
                  <p className="mt-1.5 text-[13px] leading-snug text-brand-charcoal sm:mt-2 sm:text-sm">
                    {p.desc}
                  </p>
                </div>
              </div>
            ))}
          </Reveal>
      </div>
    </section>
  );
}
