// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  // GitHub Pages 정적 사이트 생성
  ssr: false,

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
  // SPA 모드(ssr: false)에서는 IPX 서버가 동작하지 않으므로 비활성화
  image: {
    provider: 'none',
    // 로컬 이미지 디렉토리
    dir: 'public',
  },

  app: {
    // GitHub Pages 배포 시 기본 경로 설정
    baseURL: process.env.NUXT_APP_BASE_URL || '/',
    head: {
      title: 'TripGuide - 여행 가이드',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'description', content: '여행 계획 수립 및 실시간 가이드 애플리케이션' },
        { name: 'theme-color', content: '#007AFF' },
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
      theme_color: '#007AFF',
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

  // Nitro 설정 - 배포 환경별 preset 자동 선택
  // - Vercel: 자동 감지 (preset 생략)
  // - GitHub Pages: NUXT_APP_BASE_URL 설정 시 'github-pages' 사용
  nitro: {
    preset: process.env.NUXT_APP_BASE_URL ? 'github-pages' : undefined,
    publicAssets: [
      {
        dir: 'public',
        maxAge: 60 * 60 * 24 * 365, // 1 year
      },
    ],
  },

  compatibilityDate: '2024-12-28',
})
