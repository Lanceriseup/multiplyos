/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // A production build and `next dev` both write to .next, so running a build
  // while the dev server is up leaves it serving HTML against chunks that no
  // longer exist: the page arrives unstyled and nothing hydrates. Set BUILD_DIR
  // to send a build somewhere else and leave the running dev server alone:
  //   BUILD_DIR=.next-check npx next build
  ...(process.env.BUILD_DIR ? { distDir: process.env.BUILD_DIR } : {}),
  // Event QR codes / short links. Each opens the demo modal and marks the
  // visitor with the event (lib/event-tag.ts, which also lists the tags GHL
  // accepts). Temporary (307) so browsers don't cache it and the destination
  // can change after the QR codes are printed.
  async redirects() {
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
