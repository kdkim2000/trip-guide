<script setup lang="ts">
// 토스트 알림
const toast = useToast()

// 런타임 설정 (앱 버전)
const config = useRuntimeConfig()
const appVersion = config.public.appVersion as string

// 다크모드 토글
const colorMode = useColorMode()
const isDark = computed({
  get: () => colorMode.preference === 'dark',
  set: (value) => {
    colorMode.preference = value ? 'dark' : 'light'
  }
})

// 여행 스토어
const tripStore = useTripStore()

// PWA 설치
const canInstall = ref(false)
const installPrompt = ref<any>(null)

// 알림 권한
const notificationPermission = ref<NotificationPermission>('default')

onMounted(() => {
  // 알림 권한 확인
  if ('Notification' in window) {
    notificationPermission.value = Notification.permission
  }

  // PWA 설치 프롬프트 이벤트 리스너
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault()
    installPrompt.value = e
    canInstall.value = true
  })

  // 앱이 이미 설치된 경우 감지
  window.addEventListener('appinstalled', () => {
    canInstall.value = false
    installPrompt.value = null
    toast.success('앱이 설치되었습니다!')
  })
})

// PWA 설치
const installPWA = async () => {
  if (installPrompt.value) {
    installPrompt.value.prompt()
    const { outcome } = await installPrompt.value.userChoice
    if (outcome === 'accepted') {
      toast.success('앱 설치가 시작되었습니다')
    }
    canInstall.value = false
    installPrompt.value = null
  }
}

const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission()
    notificationPermission.value = permission
    if (permission === 'granted') {
      toast.success('알림 권한이 허용되었습니다')
    } else if (permission === 'denied') {
      toast.error('알림 권한이 거부되었습니다')
    }
  }
}

// 캐시 초기화
const clearCache = async () => {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.map(name => caches.delete(name)))
      toast.success('캐시가 초기화되었습니다')
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch {
      toast.error('캐시 초기화에 실패했습니다')
    }
  }
}

// 데이터 내보내기
const exportData = () => {
  try {
    // localStorage 데이터 수집
    const localStorageData: Record<string, any> = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        try {
          localStorageData[key] = JSON.parse(localStorage.getItem(key) || '')
        } catch {
          localStorageData[key] = localStorage.getItem(key)
        }
      }
    }

    const data = {
      exportedAt: new Date().toISOString(),
      appVersion: appVersion,
      currentTripId: tripStore.currentTripId,
      settings: {
        colorMode: colorMode.preference,
        notificationPermission: notificationPermission.value,
      },
      localStorage: localStorageData,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tripguide-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('데이터가 다운로드되었습니다')
  } catch {
    toast.error('데이터 내보내기에 실패했습니다')
  }
}
</script>

<template>
  <div class="min-h-screen">
    <!-- 헤더 -->
    <header class="bg-white border-b border-gray-200 px-4 pt-12 pb-4 safe-top">
      <h1 class="text-xl font-bold">설정</h1>
    </header>

    <div class="px-4 py-6 max-w-lg mx-auto space-y-6">
      <!-- PWA 설치 (설치 가능할 때만 표시) -->
      <section v-if="canInstall" class="card bg-primary-50 border-primary-200 dark:bg-primary-900/20 dark:border-primary-800">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-xl bg-primary-500 flex items-center justify-center flex-shrink-0">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>
          <div class="flex-1">
            <h2 class="text-lg font-semibold text-primary-900 dark:text-primary-100">앱 설치하기</h2>
            <p class="text-sm text-primary-700 dark:text-primary-300 mt-1">홈 화면에 추가하여 더 빠르게 접근하세요.</p>
            <button
              @click="installPWA"
              class="mt-3 btn btn-primary text-sm"
            >
              설치하기
            </button>
          </div>
        </div>
      </section>

      <!-- 앱 정보 -->
      <section class="card">
        <h2 class="text-lg font-semibold mb-4">앱 정보</h2>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-gray-600">버전</span>
            <span class="text-gray-900">{{ appVersion }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">빌드</span>
            <span class="text-gray-900">Nuxt 3 + PWA</span>
          </div>
        </div>
      </section>

      <!-- 화면 설정 -->
      <section class="card">
        <h2 class="text-lg font-semibold mb-4">화면 설정</h2>
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <div>
              <p class="font-medium">다크 모드</p>
              <p class="text-sm text-gray-500">어두운 테마 사용</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input v-model="isDark" type="checkbox" class="sr-only peer" />
              <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>
        </div>
      </section>

      <!-- 알림 설정 -->
      <section class="card">
        <h2 class="text-lg font-semibold mb-4">알림 설정</h2>
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <div>
              <p class="font-medium">알림 권한</p>
              <p class="text-sm text-gray-500">
                {{ notificationPermission === 'granted' ? '허용됨' : notificationPermission === 'denied' ? '거부됨' : '설정 안함' }}
              </p>
            </div>
            <button
              v-if="notificationPermission !== 'granted'"
              @click="requestNotificationPermission"
              class="btn btn-secondary text-sm"
            >
              권한 요청
            </button>
            <span v-else class="text-green-500 text-sm">✓ 활성화</span>
          </div>
        </div>
      </section>

      <!-- 데이터 관리 -->
      <section class="card">
        <h2 class="text-lg font-semibold mb-4">데이터 관리</h2>
        <div class="space-y-3">
          <button @click="exportData" class="w-full btn btn-secondary text-left flex justify-between items-center">
            <span>데이터 내보내기</span>
            <span class="text-gray-400">→</span>
          </button>
          <button @click="clearCache" class="w-full btn bg-red-50 text-red-600 hover:bg-red-100 text-left flex justify-between items-center">
            <span>캐시 초기화</span>
            <span class="text-red-400">→</span>
          </button>
        </div>
      </section>

      <!-- 오프라인 상태 -->
      <section class="card">
        <h2 class="text-lg font-semibold mb-4">오프라인 지원</h2>
        <div class="space-y-2 text-sm text-gray-600">
          <p>이 앱은 PWA로 제작되어 오프라인에서도 동작합니다.</p>
          <p>여행 데이터는 JSON 파일로 저장되어 네트워크 없이도 모든 정보를 확인할 수 있습니다.</p>
        </div>
      </section>

      <!-- 정보 -->
      <section class="text-center text-sm text-gray-400 py-4">
        <p>TripGuide - 여행 가이드 앱</p>
        <p class="mt-1">Made with Nuxt.js</p>
      </section>
    </div>
  </div>
</template>
