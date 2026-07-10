// Value band under the hero: "What changes when Multiply OS is installed."
// "Frosted Glass" treatment — frosted tiles on a warm peach ground with drifting
// color orbs; each point carries a hue of the brand spectrum (gold -> red).

type Item = {
  key: string;
  title: string;
  desc: string;
};

// Single brand orange for the icon badges — matches the CTA band's accent so
// the two glowing sections read as a set.
const BRAND_ORANGE = "#EA7B1B";

export const ITEMS: Item[] = [
  { key: "mission", title: "Mission Alignment", desc: "A singular mission installed across the organization." },
  { key: "leadership", title: "Leadership Multiplication", desc: "Turning managers into mission-driven leaders." },
  { key: "operational", title: "Operational Clarity", desc: "Systems for communication and execution." },
  { key: "accountability", title: "Accountability Rhythms", desc: "Meetings and scoreboards that drive results." },
  { key: "kingdom", title: "Kingdom Impact", desc: "Your business becomes a vehicle for Kingdom influence." },
];

// Icon artwork from /public/{1..5}.svg, recolored via currentColor so each
// item keeps its theme color. Duotone style: a 0.1-opacity fill + 2px stroke.
export const ICON_PATHS: Record<string, React.ReactNode> = {
  mission: (
    <>
      <path opacity="0.1" fillRule="evenodd" clipRule="evenodd" d="M15.9998 16C17.2861 14.7137 18.3497 13.3465 19.1568 12.0001C18.3497 10.6536 17.2861 9.28634 15.9998 8C14.7134 6.71368 13.3462 5.65007 11.9998 4.84302C10.6533 5.65006 9.28611 6.71367 7.99981 7.99998C6.71346 9.28632 5.64983 10.6536 4.84277 12.0001C5.64982 13.3465 6.71343 14.7137 7.99974 16C9.28606 17.2864 10.6533 18.35 11.9998 19.157C13.3463 18.35 14.7135 17.2863 15.9998 16ZM11.9998 9.74994C10.7571 9.74994 9.74976 10.7573 9.74976 11.9999C9.74976 13.2426 10.7571 14.2499 11.9998 14.2499C13.2424 14.2499 14.2498 13.2426 14.2498 11.9999C14.2498 10.7573 13.2424 9.74994 11.9998 9.74994Z" fill="currentColor" />
      <path d="M20 20.0001C17.7909 22.2092 12.4183 20.4183 8 16.0001C3.58171 11.5818 1.79084 6.20916 3.99999 4.00001C6.20913 1.79087 11.5817 3.58173 16 8.00003C20.4183 12.4183 22.2092 17.7909 20 20.0001Z" stroke="currentColor" strokeWidth="2" />
      <path d="M3.99994 20C1.79079 17.7909 3.58166 12.4183 7.99995 8C12.4182 3.58171 17.7908 1.79084 20 3.99999C22.2091 6.20913 20.4183 11.5817 16 16C11.5817 20.4183 6.20908 22.2092 3.99994 20Z" stroke="currentColor" strokeWidth="2" />
      <path d="M14 12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12C10 10.8954 10.8954 10 12 10C13.1046 10 14 10.8954 14 12Z" stroke="currentColor" strokeWidth="2" />
    </>
  ),
  leadership: (
    <>
      <path opacity="0.1" fillRule="evenodd" clipRule="evenodd" d="M16.2841 5C18.0315 5.67886 20.5002 6 20.5002 6C21.1551 10.5839 20.2513 14.4093 17.6215 17.2814C17.4206 17.17 17.2352 17.0384 17.0591 16.8892C16.0243 16.0126 14.4011 15.75 12.0002 15.75C9.64764 15.75 8.04395 16.0223 7.00733 16.8697C6.80812 17.0325 6.60207 17.1578 6.3789 17.2814C3.74913 14.4093 2.84539 10.5839 3.50024 6C3.50024 6 6.15237 5.67886 7.89978 5C9.33366 4.44294 11.1047 3.49316 11.7501 3.13876C11.9095 3.05122 12.0002 3 12.0002 3C12.0002 3 12.0982 3.05122 12.2691 3.13876C12.9612 3.49316 14.8502 4.44294 16.2841 5ZM8.75023 10C8.75023 8.20507 10.2053 6.75 12.0002 6.75C13.7952 6.75 15.2502 8.20507 15.2502 10C15.2502 11.7949 13.7952 13.25 12.0002 13.25C10.2053 13.25 8.75023 11.7949 8.75023 10Z" fill="currentColor" />
      <path d="M15 10C15 11.6569 13.6569 13 12 13C10.3431 13 9 11.6569 9 10C9 8.34315 10.3431 7 12 7C13.6569 7 15 8.34315 15 10Z" stroke="currentColor" strokeWidth="2" />
      <path d="M6.89258 17.3151C7.83086 16.335 9.41279 16 11.9998 16C14.6214 16 16.2109 16.3191 17.1443 17.3151" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16.2836 5C18.031 5.67886 20.4998 6 20.4998 6C21.4998 13 18.8651 18.231 11.9997 21C5.13433 18.231 2.49976 13 3.49976 6C3.49976 6 6.15189 5.67886 7.89931 5C9.33319 4.44294 11.1043 3.49316 11.7496 3.13876C11.909 3.05122 11.9998 3 11.9998 3C11.9998 3 12.0977 3.05122 12.2686 3.13876C12.9607 3.49316 14.8497 4.44294 16.2836 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  operational: (
    <>
      <path opacity="0.1" d="M17.7634 10.7614L17.8704 10.5979C17.9261 10.5129 17.8651 10.4 17.7634 10.4H13.5C13.3817 10.4 13.2857 10.3041 13.2857 10.1857V4.23047V4.21257C13.2857 4.14957 13.2038 4.12513 13.1693 4.17784L7.18868 13.3118L7.10336 13.4421C7.05895 13.51 7.10761 13.6 7.18868 13.6H11.4488H11.5027C11.6196 13.6 11.7143 13.6947 11.7143 13.8116V19.6027C11.7143 19.7205 11.8683 19.7647 11.9328 19.6662L17.7634 10.7614Z" fill="currentColor" />
      <path d="M17.7634 10.7614L17.8704 10.5979C17.9261 10.5129 17.8651 10.4 17.7634 10.4H13.5C13.3817 10.4 13.2857 10.3041 13.2857 10.1857V4.23047V4.21257C13.2857 4.14957 13.2038 4.12513 13.1693 4.17784L7.18868 13.3118L7.10336 13.4421C7.05895 13.51 7.10761 13.6 7.18868 13.6H11.4488H11.5027C11.6196 13.6 11.7143 13.6947 11.7143 13.8116V19.6027C11.7143 19.7205 11.8683 19.7647 11.9328 19.6662L17.7634 10.7614Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </>
  ),
  accountability: (
    <>
      <path opacity="0.1" d="M17 3C18.8856 3 19.8284 3 20.4142 3.58579C21 4.17157 21 5.11438 21 7L21 13C21 14.8856 21 15.8284 20.4142 16.4142C19.8284 17 18.8856 17 17 17L16 17L8 17L7 17C5.11438 17 4.17157 17 3.58579 16.4142C3 15.8284 3 14.8856 3 13L3 7C3 5.11438 3 4.17157 3.58579 3.58579C4.17157 3 5.11438 3 7 3L8 3L16 3L17 3Z" fill="currentColor" />
      <path d="M17 3C18.8856 3 19.8284 3 20.4142 3.58579C21 4.17157 21 5.11438 21 7L21 13C21 14.8856 21 15.8284 20.4142 16.4142C19.8284 17 18.8856 17 17 17L16 17L8 17L7 17C5.11438 17 4.17157 17 3.58579 16.4142C3 15.8284 3 14.8856 3 13L3 7C3 5.11438 3 4.17157 3.58579 3.58579C4.17157 3 5.11438 3 7 3L8 3L16 3L17 3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9 21L11.625 17.5V17.5C11.8125 17.25 12.1875 17.25 12.375 17.5V17.5L15 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 9L12 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 7L16 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 10L8 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  kingdom: (
    <>
      <path opacity="0.1" d="M11.5655 4.24138L3.64286 8.64286C3.36266 8.79852 3.36266 9.20148 3.64286 9.35714L11.5655 13.7586C11.8357 13.9087 12.1643 13.9087 12.4345 13.7586L20.5706 9.23853C20.7578 9.13456 20.7578 8.86544 20.5706 8.76147L12.4345 4.24138C12.1643 4.09126 11.8357 4.09126 11.5655 4.24138Z" fill="currentColor" />
      <path d="M11.5655 4.24138L3.64286 8.64286C3.36266 8.79852 3.36266 9.20148 3.64286 9.35714L11.5655 13.7586C11.8357 13.9087 12.1643 13.9087 12.4345 13.7586L20.5706 9.23853C20.7578 9.13456 20.7578 8.86544 20.5706 8.76147L12.4345 4.24138C12.1643 4.09126 11.8357 4.09126 11.5655 4.24138Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 10.5L5.13149 15.2906C5.05583 16.2742 5.70934 17.1639 6.66043 17.426C7.28355 17.5976 7.96876 17.8017 8.5 18C9.26467 18.2854 10.1126 18.7657 10.7824 19.1841C11.5227 19.6465 12.4773 19.6465 13.2177 19.184C13.8874 18.7657 14.7354 18.2854 15.5 18C16.0312 17.8017 16.7165 17.5976 17.3396 17.4259C18.2907 17.1639 18.9442 16.2742 18.8686 15.2906L18.5 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.5 10.5L9.00772 11.9242C8.38457 12.2802 8 12.9429 8 13.6606V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
};

export function Glyph({ name, color }: { name: string; color: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-[30px] w-[30px]"
      style={{ color }}
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

export default function OrangeStrip() {
  return (
    <section className="relative px-5 py-10 sm:px-6">
      <div className="bg-dotted pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative mx-auto max-w-[1440px]">
        <div className="relative overflow-hidden rounded-[26px] border border-[#E0DCD3] bg-[#EDEAE4] px-5 py-12 shadow-[0_26px_70px_-40px_rgba(234,123,27,0.55)] sm:px-8">
          {/* warm dot texture + ambient orange glow (matches the CTA band) */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#C6C0B4_1px,transparent_1px)] opacity-40 [background-size:22px_22px]" />
          <div className="cta-glow pointer-events-none absolute -top-20 right-[4%] h-[300px] w-[300px] rounded-full bg-[radial-gradient(circle,rgba(234,123,27,0.45),transparent_62%)] blur-2xl" />
          <div className="cta-glow pointer-events-none absolute -bottom-24 left-[2%] h-60 w-60 rounded-full bg-[radial-gradient(circle,rgba(234,123,27,0.28),transparent_65%)] blur-2xl" style={{ animationDelay: "1.8s" }} />
          {/* frosted tiles */}
          <div className="relative grid grid-cols-2 gap-3.5 md:grid-cols-5">
            {ITEMS.map((it, i) => (
              <div
                key={it.key}
                className="flex h-full flex-col items-center rounded-2xl border border-white/90 bg-white/70 px-4 py-6 text-center shadow-[0_14px_30px_-20px_rgba(120,70,20,0.3),inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-[14px] backdrop-saturate-150"
              >
                <span
                  className="icon-shimmer mb-3.5 grid h-[54px] w-[54px] place-items-center rounded-2xl"
                  style={{
                    backgroundColor: `${BRAND_ORANGE}1F`,
                    ["--shimmer-delay" as string]: `${i * 0.45}s`,
                  }}
                >
                  <Glyph name={it.key} color={BRAND_ORANGE} />
                </span>
                <h3 className="text-[15px] font-bold tracking-tight text-brand-ink">
                  {it.title}
                </h3>
                <p className="mt-1.5 max-w-[21ch] text-[13px] leading-snug text-brand-charcoal">
                  {it.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
