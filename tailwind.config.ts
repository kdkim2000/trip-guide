import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue',
  ],
  theme: {
    extend: {
      colors: {
        // 미니멀 컬러 시스템
        flat: {
          blue: '#007AFF',
          green: '#00C853',
          red: '#FF3B30',
          orange: '#FF9500',
          yellow: '#FFC107',
          gray: {
            50: '#FAFAFA',
            100: '#F5F5F5',
            200: '#EEEEEE',
            300: '#E0E0E0',
            400: '#BDBDBD',
            500: '#9E9E9E',
            600: '#757575',
            700: '#616161',
            800: '#424242',
            900: '#212121',
          },
        },
        // Primary 색상
        primary: {
          50: '#E3F2FD',
          100: '#BBDEFB',
          200: '#90CAF9',
          300: '#64B5F6',
          400: '#42A5F5',
          500: '#007AFF',
          600: '#1E88E5',
          700: '#1976D2',
          800: '#1565C0',
          900: '#0D47A1',
        },
      },
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', 'sans-serif'],
      },
      // 미니멀 타이포그래피
      fontSize: {
        'title-large': ['32px', { lineHeight: '40px', fontWeight: '600' }],
        'title-1': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'title-2': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'title-3': ['18px', { lineHeight: '24px', fontWeight: '500' }],
        'headline': ['16px', { lineHeight: '24px', fontWeight: '500' }],
        'body': ['15px', { lineHeight: '22px', fontWeight: '400' }],
        'subhead': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'footnote': ['13px', { lineHeight: '18px', fontWeight: '400' }],
        'caption-1': ['12px', { lineHeight: '16px', fontWeight: '400' }],
        'caption-2': ['11px', { lineHeight: '14px', fontWeight: '400' }],
      },
      // 간격 시스템
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      // 플랫 라운드 코너 (최소화)
      borderRadius: {
        'flat-sm': '4px',
        'flat-md': '6px',
        'flat-lg': '8px',
        'flat-xl': '12px',
      },
      // 터치 친화적 최소 크기
      minHeight: {
        'touch': '44px',
        'nav': '48px',
      },
      minWidth: {
        'touch': '44px',
      },
      // 그림자 제거 (플랫 디자인)
      boxShadow: {
        'none': 'none',
        'subtle': '0 1px 2px rgba(0, 0, 0, 0.05)',
      },
      // 간단한 애니메이션
      animation: {
        'skeleton': 'skeleton 1.5s ease-in-out infinite',
        'fade-in': 'fadeIn 0.15s ease-out',
      },
      keyframes: {
        skeleton: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      // 빠른 트랜지션
      transitionDuration: {
        'fast': '150ms',
      },
    },
  },
  plugins: [],
} satisfies Config
