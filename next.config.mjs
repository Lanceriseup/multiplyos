/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // A production build and `next dev` both write to .next, so running a build
  // while the dev server is up leaves it serving HTML against chunks that no
  // longer exist: the page arrives unstyled and nothing hydrates. Set BUILD_DIR
  // to send a build somewhere else and leave the running dev server alone:
  //   BUILD_DIR=.next-check npx next build
  ...(process.env.BUILD_DIR ? { distDir: process.env.BUILD_DIR } : {}),

  // multiplyos.com/rukcon, where the RUKCON booth QR points, used to be a
  // redirect into the SCALE trial. It is now a page (app/rukcon/page.tsx): the
  // pricing page with the RUKCON offer and the code on every trial link.
};

export default nextConfig;
