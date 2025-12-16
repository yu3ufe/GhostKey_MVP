/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // 1. Force Next.js to compile the Crossmint SDK
  transpilePackages: ['@crossmint/client-sdk-react-ui'],

  webpack: (config) => {
    // 2. Ignore the "React Native" storage causing the MetaMask error
    config.resolve.fallback = { fs: false, net: false, tls: false };
    
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-native': false,
      'react-native-web': false,
      '@react-native-async-storage/async-storage': false,
    };

    return config;
  },
};

export default nextConfig;