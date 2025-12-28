// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@vite-pwa/nuxt',
    '@nuxt/image',
    '@nuxtjs/color-mode',
  ],

  // 다크 모드 설정
  colorMode: {
    preference: 'system',
    fallback: 'light',
    classSuffix: '',
  },

  // 런타임 설정
  runtimeConfig: {
    public: {
      appVersion: process.env.npm_package_version || '1.0.0',
    },
  },

  // 이미지 최적화 설정
  image: {
    // 로컬 이미지 최적화
    dir: 'public',
    // 이미지 품질 (기본값 80)
    quality: 80,
    // 이미지 포맷 설정
    format: ['webp', 'jpg'],
    // 화면 크기별 이미지 사이즈
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
    },
  },

  app: {
    head: {
      title: 'TripGuide - 여행 가이드',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'description', content: '여행 계획 수립 및 실시간 가이드 애플리케이션' },
        { name: 'theme-color', content: '#3b82f6' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },

  css: ['~/assets/css/main.css'],

  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: 'tailwind.config.ts',
  },

  pwa: {
    registerType: 'autoUpdate',
    // 개발 모드에서 PWA 비활성화
    devOptions: {
      enabled: false,
    },
    manifest: {
      name: 'TripGuide - 여행 가이드',
      short_name: 'TripGuide',
      description: '여행 계획 수립 및 실시간 가이드 애플리케이션',
      theme_color: '#3b82f6',
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'portrait',
      icons: [
        {
          src: '/icons/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/icons/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico,json}'],
    },
    client: {
      installPrompt: true,
    },
  },

  typescript: {
    strict: true,
    // 개발 중 typeCheck 비활성화 (vite-plugin-checker 오류 방지)
    // 빌드 시에는 별도로 typecheck 실행 권장
    typeCheck: false,
  },

  // Nitro 설정 - Vercel 배포
  nitro: {
    preset: 'vercel',
    publicAssets: [
      {
        dir: 'public',
        maxAge: 60 * 60 * 24 * 365, // 1 year
      },
    ],
    // Vercel 함수 설정
    vercel: {
      functions: {
        maxDuration: 10,
      },
    },
  },

  compatibilityDate: '2024-12-28',
})
