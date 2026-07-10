// Overlapping cluster of circular "system" tokens for the hero eyebrow.
// Each circle represents a business system Multiply OS unifies.

type Ring = "charcoal" | "orange" | "gray";

const RING: Record<Ring, string> = {
  charcoal: "border-brand-charcoal text-brand-ink",
  orange: "border-brand-orange text-brand-orange-dark",
  gray: "border-brand-gray text-brand-charcoal",
};

const TOKENS: { name: string; ring: Ring }[] = [
  { name: "sales", ring: "charcoal" },
  { name: "finance", ring: "orange" },
  { name: "ops", ring: "gray" },
  { name: "mkt", ring: "charcoal" },
  { name: "people", ring: "gray" },
  { name: "ai", ring: "orange" },
];

function Icon({ name }: { name: string }) {
  const props = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.85,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-3.5 w-3.5 sm:h-[22px] sm:w-[22px]",
  };
  switch (name) {
    case "sales":
      return (
        <svg {...props}>
          <path d="M3 17l5-5 4 3 6-7" />
          <path d="M14 8h4v4" />
        </svg>
      );
    case "finance":
      return (
        <svg {...props}>
          <path d="M12 2v20" />
          <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        </svg>
      );
    case "ops":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="3.2" />
          <path d="M12 4v2M12 18v2M4 12h2M18 12h2M6.3 6.3l1.5 1.5M16.2 16.2l1.5 1.5M17.7 6.3l-1.5 1.5M7.8 16.2l-1.5 1.5" />
        </svg>
      );
    case "mkt":
      return (
        <svg {...props}>
          <path d="M4 11l13-5v12M4 11v4l13 4M4 11l4 1.5v5L4 15" />
        </svg>
      );
    case "people":
      return (
        <svg {...props}>
          <circle cx="9" cy="9" r="3" />
          <path d="M3.5 19a5.5 5.5 0 0111 0M16 7a3 3 0 010 6M21 19a5 5 0 00-4-4.9" />
        </svg>
      );
    case "ai":
      return (
        <svg {...props}>
          <rect x="6" y="6" width="12" height="12" rx="2" />
          <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
          <path d="M9 6V3.5M15 6V3.5M9 20.5V18M15 20.5V18M6 9H3.5M6 15H3.5M20.5 9H18M20.5 15H18" />
        </svg>
      );
    default:
      return null;
  }
}

export default function SystemTokens() {
  return (
    <span className="flex items-center" aria-hidden="true">
      {TOKENS.map((t, i) => (
        <span
          key={t.name}
          className={`token-float grid h-6 w-6 place-items-center rounded-full border-2 bg-white shadow-sm sm:h-10 sm:w-10 ${RING[t.ring]} ${i > 0 ? "-ml-2 sm:-ml-[13px]" : ""}`}
          style={{ animationDelay: `${i * 0.25}s`, zIndex: TOKENS.length - i }}
        >
          <Icon name={t.name} />
        </span>
      ))}
    </span>
  );
}
