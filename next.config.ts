import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ac.goit.global",
        port: "",
        pathname: "/**",
      },
      // Дополнительные удаленные шаблоны можно добавить здесь
      // {
      //   protocol: 'https',
      //   hostname: 'example.com',
      //   port: '',
      //   pathname: '/images/**',
      // },
    ],
  },
  // Другие конфигурации Next.js
  experimental: {
    // Экспериментальные функции при необходимости
  },
};

export default nextConfig;
