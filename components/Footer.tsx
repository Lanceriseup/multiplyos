import Link from "next/link";

export default function Footer() {
  return (
    <footer id="resources" className="scroll-mt-24 border-t border-black/10 bg-white">
      <div className="mx-auto max-w-container px-5 py-10 sm:px-8 sm:py-[67px]">
        {/* Logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/MultiplyOS_logoBlack.png" alt="Multiply OS" className="mx-auto h-8 w-auto sm:mx-0 sm:h-[34px]" />

        {/* Baseline: copyright + legal — centered on mobile, split by a rule on desktop */}
        <div className="mt-4 flex flex-col items-center gap-3 border-t border-black/10 pt-4 text-center sm:mt-[29px] sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:pt-[29px] sm:text-left">
          <p className="text-[13px] text-brand-gray sm:text-[17px]">
            © {new Date().getFullYear()} Multiply OS℠. All rights reserved.
          </p>
          <div className="flex gap-7">
            <Link href="/privacy" className="text-[13px] text-brand-gray hover:text-brand-ink sm:text-[17px]">
              Privacy
            </Link>
            <Link href="/terms" className="text-[13px] text-brand-gray hover:text-brand-ink sm:text-[17px]">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
