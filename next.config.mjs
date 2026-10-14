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

  // Event QR codes / short links. multiplyos.com/rukcon, where the RUKCON booth
  // QR points, is a page while the pricing v2 switch is on (app/rukcon/page.tsx):
  // the pricing page with the RUKCON offer and the code on every trial link. It
  // also remembers the "rukcon" event (lib/event-tag.ts), so a demo request
  // from the booth page is still tagged in GHL. With the switch off, /rukcon
  // falls back to the earlier event link: the home page with the demo modal
  // open. Temporary (307) so browsers don't cache it and the destination can
  // change after the QR codes are printed.
  async redirects() {
    if (pricingV2SiteEnabled()) return [];
    return [
      {
        source: "/rukcon",
        destination: "/?demo=open&utm_source=rukcon&utm_medium=qr",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
