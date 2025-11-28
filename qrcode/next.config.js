/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['images.unsplash.com'],
  },
  env: {
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || '',
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
    EMAIL_USER: process.env.EMAIL_USER || '',
    EMAIL_PASS: process.env.EMAIL_PASS || '',
    // NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    // NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },
}

module.exports = nextConfig

// // Alternative: Minimal config without env section
// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   // Your other Next.js config options here
//   experimental: {
//     // Add any experimental features if needed
//   },
// }

// module.exports = nextConfig