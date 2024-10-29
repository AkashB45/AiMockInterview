/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer }) => {
      if (!isServer) {
        // Ignore the `fs` module in client-side builds
        config.resolve.fallback = {
          fs: false,
        };
      }
      return config;
    },
  };
  
  export default nextConfig;
  