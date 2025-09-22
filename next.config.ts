import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  // Конфигурация для внешних изображений
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Исправляем проблемы с HMR и Vite клиентом
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Предотвращаем конфликты с Vite клиентом
      config.resolve.alias = {
        ...config.resolve.alias,
        '@vite/client': false,
      };
    }
    return config;
  },
};

export default nextConfig;
