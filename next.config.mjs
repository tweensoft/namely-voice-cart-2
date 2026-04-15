/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push("playwright-core", "@sparticuz/chromium");
    }
    return config;
  },
};

export default nextConfig;
