"use client";

import { useRef, useState } from "react";

/* Roles are placeholders — swap in the real titles/companies. */
interface Item {
  id: string;
  name: string;
  role: string;
  src: string;
}

const ITEMS: Item[] = [
  {
    id: "gary",
    name: "Gary Cucchi",
    role: "Founder, Cucchi Consulting",
    src: "https://assets.cdn.filesafe.space/SN98jGPwU5VanbeT2Rfm/media/6a582232c06d2134c6e5be00.mp4",
  },
  {
    id: "ned",
    name: "Ned Schaut",
    role: "Operations Lead, Schaut & Co.",
    src: "https://assets.cdn.filesafe.space/SN98jGPwU5VanbeT2Rfm/media/6a582231524a3ec4c6f7a5e6.mp4",
  },
];

function VideoCard({ item }: { item: Item }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const start = () => {
    setPlaying(true);
    videoRef.current?.play().catch(() => setPlaying(false));
  };

  return (
    <div className="rounded-[20px] border border-[#F1E7D8] bg-white p-2.5 shadow-[0_30px_60px_-34px_rgba(60,35,8,0.5)]">
      <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
        <video
          ref={videoRef}
          src={item.src}
          preload="metadata"
          playsInline
          controls={playing}
          onEnded={() => setPlaying(false)}
          className="h-full w-full object-cover"
        />

        {!playing && (
          <button
            type="button"
            onClick={start}
            aria-label={`Play ${item.name}'s testimonial`}
            className="group absolute inset-0 grid place-items-center"
          >
            <span className="absolute inset-0 bg-black/15 transition-colors duration-200 group-hover:bg-black/25" />

            {/* play button */}
            <span className="relative grid h-[66px] w-[66px] place-items-center rounded-full bg-brand-orange text-white shadow-[0_12px_30px_-8px_rgba(234,123,27,0.85)] transition-transform duration-200 group-hover:scale-110">
              <span className="testi-halo pointer-events-none absolute inset-0 rounded-full border-2 border-brand-orange" />
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>

            {/* name / role caption */}
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#080603]/85 via-[#080603]/25 to-transparent px-5 pb-4 pt-8 text-left">
              <span className="block text-[16.5px] font-bold tracking-tight text-white">{item.name}</span>
              <span className="mt-0.5 block text-[12.5px] text-white/80">{item.role}</span>
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

export default function Testimonials() {
  return (
    <section
      className="relative overflow-hidden px-5 py-16 sm:px-8 sm:py-20"
      style={{
        backgroundColor: "#fff",
        backgroundImage: "radial-gradient(rgba(234,123,27,0.34) 1.7px, transparent 1.8px)",
        backgroundSize: "24px 24px",
      }}
    >
      {/* warm bloom behind, then fade the dots out toward the edges */}
      <span className="pointer-events-none absolute -top-28 left-1/2 h-[340px] w-[520px] -translate-x-1/2 rounded-full bg-brand-orange/[0.14] blur-[80px]" />
      <span className="pointer-events-none absolute inset-0 [background:radial-gradient(95%_80%_at_50%_42%,transparent_45%,rgba(255,255,255,0.92)_100%)]" />

      <div className="relative mx-auto max-w-container">
        <header className="mx-auto mb-10 max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange-dark">
            Don&rsquo;t take our word for it
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-brand-ink sm:text-4xl">
            Teams that switched aren&rsquo;t going back
          </h2>
        </header>

        <div className="mx-auto grid max-w-[1040px] gap-8 md:grid-cols-2">
          {ITEMS.map((item) => (
            <VideoCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
