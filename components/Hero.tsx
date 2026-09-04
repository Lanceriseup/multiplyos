"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import WordSwap from "./WordSwap";
import SystemTokens from "./SystemTokens";
import AppMockup from "./AppMockup";
import { useDemo } from "./DemoModal";

const APP_URL = "https://app.multiplyos.com";

export default function Hero() {
  const { openDemo } = useDemo();
  return (
    <section className="relative overflow-x-clip">
      <div className="bg-dotted pointer-events-none absolute inset-0 opacity-60" />

      <div className="relative z-10 mx-auto max-w-container px-5 pb-12 pt-10 text-center sm:px-8 sm:pt-14 md:pb-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2.5 whitespace-nowrap rounded-full border border-black/10 bg-white py-1 pl-1 pr-3.5 shadow-sm sm:gap-3 sm:py-1.5 sm:pl-1.5 sm:pr-5"
        >
          <SystemTokens />
          <span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.04em] text-brand-charcoal sm:text-base sm:tracking-wide">
            Built to Multiply
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mx-auto mt-4 max-w-5xl text-[27px] font-extrabold leading-[1.12] tracking-tight text-brand-ink sm:mt-6 sm:text-5xl sm:leading-[1.08] md:text-6xl"
        >
          The Business Operating Software with built-in AI to Multiply{" "}
          <WordSwap />
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12 }}
          className="mx-auto mt-3.5 max-w-3xl text-sm leading-normal text-brand-charcoal sm:mt-6 sm:text-balance sm:text-xl"
        >
          Tested by thousands of businesses across the U.S., Multiply OS gives
          founders the systems and tools to scale and drive{" "}
          <span className="font-semibold text-brand-orange">
            greater Kingdom Impact.
          </span>
        </motion.p>

        {/* Mobile-only app preview: sits between the tagline and the CTAs.
            Desktop shows the full-size version in the OsOverview section instead. */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.18 }}
          className="mx-auto mt-6 w-full max-w-[560px] md:hidden"
        >
          <AppMockup initialHeight={240} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.24 }}
          className="mx-auto mt-6 flex w-full max-w-[300px] flex-col items-center justify-center gap-3 sm:mt-9 sm:max-w-none sm:flex-row"
        >
          <button
            type="button"
            onClick={openDemo}
            className="flex w-full items-center justify-center rounded-lg bg-brand-orange px-6 py-2.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-brand-orange-dark sm:w-auto sm:min-w-[210px]"
          >
            Request a Demo
          </button>
          <Link
            href={APP_URL}
            className="flex w-full items-center justify-center rounded-lg bg-brand-orange/20 px-6 py-2.5 text-base font-semibold text-brand-orange transition-colors hover:bg-brand-orange/30 sm:w-auto sm:min-w-[210px]"
          >
            Log in
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
