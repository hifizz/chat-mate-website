import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // 生产环境优化
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  
  // 图像优化配置
  images: {
    domains: ['localhost'],
    formats: ['image/avif', 'image/webp'],
  },
  
  // 压缩配置
  compress: true,
  
  // 缓存配置
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000, // 1 小时
    pagesBufferLength: 5,
  },
  
  // 环境变量配置
  env: {
    APP_VERSION: process.env.npm_package_version,
  },
  
  // 安全配置
  headers: async () => {
    return [
      // 默认安全头信息（适用于大多数页面）
      {
        source: '/((?!embed).*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      // 嵌入页面特殊配置（允许被任何网站嵌入）
      {
        source: '/embed',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors *;",
          },
        ],
      },
    ];
  },
  
  // 重定向配置
  redirects: async () => {
    return [
      {
        source: '/viewer',
        destination: '/',
        permanent: true,
      },
    ];
  },
  
  // 实验性功能
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
};

export default nextConfig;
