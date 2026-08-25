/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // A production build and `next dev` both write to .next, so running a build
  // while the dev server is up leaves it serving HTML against chunks that no
  // longer exist: the page arrives unstyled and nothing hydrates. Set BUILD_DIR
  // to send a build somewhere else and leave the running dev server alone:
  //   BUILD_DIR=.next-check npx next build
  ...(process.env.BUILD_DIR ? { distDir: process.env.BUILD_DIR } : {}),
};

export default nextConfig;
