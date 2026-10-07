import { appTrialUrl, RUKCON_PROMO_CODE } from "./lib/app-links.mjs";
import { pricingV2SiteEnabled } from "./lib/pricing-v2-switch.mjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // A production build and `next dev` both write to .next, so running a build
  // while the dev server is up leaves it serving HTML against chunks that no
  // longer exist: the page arrives unstyled and nothing hydrates. Set BUILD_DIR
  // to send a build somewhere else and leave the running dev server alone:
  //   BUILD_DIR=.next-check npx next build
  ...(process.env.BUILD_DIR ? { distDir: process.env.BUILD_DIR } : {}),

  // multiplyos.com/rukcon is where the RUKCON booth QR points. It sends people
  // into the SCALE annual trial with the booth code applied, so the signup
  // carries the RUKCON code the offer is tracked by. It exists only while the
  // pricing v2 switch is on; switched off, the site has no /rukcon.
  //
  // Temporary (307), not permanent, so the destination can change after the
  // event without browsers holding on to the old one. Ashley names the final
  // code: it lives in lib/app-links.mjs as RUKCON_PROMO_CODE.
  //
  // The lib imports are .mjs because this file runs on Node 20 in CI, which
  // cannot load .ts.
  async redirects() {
    if (!pricingV2SiteEnabled()) return [];
    return [
      {
        source: "/rukcon",
        destination: appTrialUrl({ plan: "scale", billing: "annual", promo: RUKCON_PROMO_CODE }),
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
