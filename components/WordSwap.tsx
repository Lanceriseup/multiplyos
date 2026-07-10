"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Word + its accent color (cycles orange -> gold -> red-orange)
const WORDS = [
  { text: "Revenue", accent: "#EA7B1B" }, // orange
  { text: "Profit", accent: "#E8A21A" }, // gold / yellow
  { text: "Impact", accent: "#E5532A" }, // red-orange
];

const INTERVAL = 2300;

export default function WordSwap() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % WORDS.length), INTERVAL);
    return () => clearInterval(id);
  }, []);

  const { text, accent } = WORDS[i];

  return (
    // Inline beside the text on mobile; its own centered line on desktop (sm+).
    <span className="inline align-middle sm:mt-2 sm:block">
      <motion.span
        layout
        transition={{ layout: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } }}
        className="inline-flex items-center gap-[0.35em] rounded-[0.5em] px-[0.42em] py-[0.1em] align-middle transition-colors duration-300"
        style={{ backgroundColor: `${accent}26` }}
      >
        <span
          className="h-[0.4em] w-[0.4em] flex-none rounded-full transition-colors duration-300"
          style={{ backgroundColor: accent }}
        />
        {/* hugs the current word; width animates via the parent's layout */}
        <span className="relative grid overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={text}
              initial={{ opacity: 0, y: "-45%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "45%" }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="col-start-1 row-start-1 block whitespace-nowrap text-brand-ink"
            >
              {text}
            </motion.span>
          </AnimatePresence>
        </span>
      </motion.span>
    </span>
  );
}
