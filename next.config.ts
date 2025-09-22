import { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Экспериментальные функции для максимальной производительности
  experimental: {
    // Оптимизация сборки и code splitting
    optimizePackageImports: [
      '@radix-ui/react-icons', 
      'lucide-react',
      '@hookform/resolvers',
      'react-hook-form',
      'zod',
      'date-fns',
      'clsx',
      'tailwind-merge'
    ],
    // Турбо режим для быстрой разработки
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
    // Оптимизация CSS
    optimizeCss: true,
  },
  
  // Сжатие и оптимизация
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  
  // Output configuration for production
  output: 'standalone',
  
  // External packages for server components (исправленная конфигурация)
  serverExternalPackages: ['mongoose', 'bcryptjs', 'sharp'],
  
  // Оптимизация изображений
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 год
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.imgur.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
    ],
  },
  
  // Заголовки безопасности и производительности
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
              "font-src 'self' fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self'",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "object-src 'none'",
            ].join('; '),
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000',
          },
        ],
      },
    ];
  },
  
  // Редиректы для SEO
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/admin/dashboard',
        permanent: true,
      },
    ];
  },
  
  // Rewrites для API
  async rewrites() {
    return [
      {
        source: '/api/health',
        destination: '/api/healthcheck',
      },
    ];
  },
  
  // Webpack оптимизации
  webpack: (config: any, { dev, isServer }: { dev: boolean; isServer: boolean }) => {
    // Оптимизация для production
    if (!dev && !isServer) {
      // Code splitting оптимизации
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 200000,
          cacheGroups: {
            // React и основные библиотеки
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              name: 'react',
              chunks: 'all',
              priority: 30,
              enforce: true,
            },
            // Next.js специфичные модули
            next: {
              test: /[\\/]node_modules[\\/]next[\\/]/,
              name: 'next',
              chunks: 'all',
              priority: 25,
            },
            // UI библиотеки (Radix UI)
            ui: {
              test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
              name: 'ui-radix',
              chunks: 'all',
              priority: 20,
            },
            // Иконки
            icons: {
              test: /[\\/]node_modules[\\/](lucide-react|react-icons)[\\/]/,
              name: 'icons',
              chunks: 'all',
              priority: 18,
            },
            // Формы и валидация
            forms: {
              test: /[\\/]node_modules[\\/](react-hook-form|@hookform|zod)[\\/]/,
              name: 'forms',
              chunks: 'all',
              priority: 15,
            },
            // Утилиты
            utils: {
              test: /[\\/]node_modules[\\/](date-fns|clsx|tailwind-merge|class-variance-authority)[\\/]/,
              name: 'utils',
              chunks: 'all',
              priority: 12,
            },
            // Общие компоненты приложения
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 8,
              reuseExistingChunk: true,
              enforce: true,
            },
            // Остальные vendor библиотеки
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 5,
              maxSize: 150000,
            },
          },
        },
      };
    }

    // SVG оптимизация
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    // Алиасы для быстрого импорта
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };

    return config;
  },
  
  // Настройки для анализа бандла
  env: {
    ANALYZE: process.env.ANALYZE || 'false',
  },
};

let config = nextConfig;

// Bundle analyzer для анализа размера
if (process.env.ANALYZE === 'true') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: true,
  });
  config = withBundleAnalyzer(config);
}

export default config;
