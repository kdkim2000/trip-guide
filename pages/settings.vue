<script setup lang="ts">
import type { TripUploadPayload, UserTripData } from '~/types'

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

// 알림 관리
const notifications = useNotifications()

// 데이터 업로드 관련
const showUploadModal = ref(false)
const uploadPreview = ref<TripUploadPayload | null>(null)
const isUploading = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

// 파일 선택 처리
const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  try {
    const text = await file.text()
    const data = JSON.parse(text) as TripUploadPayload

    // 데이터 유효성 검증
    if (!data.tripMeta?.id || !data.tripMeta?.title || !data.itinerary) {
      throw new Error('필수 데이터가 누락되었습니다')
    }

    uploadPreview.value = data
    showUploadModal.value = true
  } catch (e) {
    toast.error('잘못된 형식의 파일입니다')
  }

  // 입력 초기화 (같은 파일 다시 선택 가능)
  if (target) {
    target.value = ''
  }
}

// 업로드 확인
const confirmUpload = async () => {
  if (!uploadPreview.value) return

  isUploading.value = true
  try {
    const userTripData: UserTripData = {
      id: uploadPreview.value.tripMeta.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tripMeta: uploadPreview.value.tripMeta,
      itinerary: uploadPreview.value.itinerary,
      places: uploadPreview.value.places,
      highlights: uploadPreview.value.highlights,
    }

    await tripStore.addUserTrip(userTripData)
    toast.success('여행 데이터가 업로드되었습니다')
    showUploadModal.value = false
    uploadPreview.value = null
  } catch (e) {
    toast.error('업로드에 실패했습니다')
  } finally {
    isUploading.value = false
  }
}

// 업로드 취소
const cancelUpload = () => {
  showUploadModal.value = false
  uploadPreview.value = null
}

// 사용자 여행 삭제
const deleteUserTrip = async (tripId: string) => {
  if (!confirm('이 여행 데이터를 삭제하시겠습니까?')) return

  try {
    await tripStore.removeUserTrip(tripId)
    toast.success('여행 데이터가 삭제되었습니다')
  } catch (e) {
    toast.error('삭제에 실패했습니다')
  }
}

// PWA 설치
const canInstall = ref(false)
const installPrompt = ref<any>(null)

onMounted(() => {
  // 알림 초기화
  notifications.init()

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

// 알림 토글
const handleNotificationToggle = async (enabled: boolean) => {
  const success = await notifications.toggleEnabled(enabled)
  if (success && enabled) {
    toast.success('알림이 활성화되었습니다')
  } else if (success && !enabled) {
    toast.info('알림이 비활성화되었습니다')
  } else if (!success) {
    toast.error('알림 권한이 거부되었습니다. 브라우저 설정에서 허용해주세요.')
  }
}

// 알림 설정 변경
const handleNotificationSettingChange = (key: 'tripReminder' | 'dailySchedule' | 'checklistReminder', value: boolean) => {
  notifications.updateSettings({ [key]: value })
}

// 테스트 알림
const sendTestNotification = () => {
  if (notifications.permission.value !== 'granted') {
    toast.error('먼저 알림을 활성화해주세요')
    return
  }

  notifications.showNotification('테스트 알림', {
    body: '알림이 정상적으로 작동합니다!',
    tag: 'test',
  })
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
        notifications: notifications.settings.value,
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
  <div class="min-h-screen bg-apple-gray-100 dark:bg-apple-gray-900">
    <!-- Apple 스타일 Large Title 헤더 -->
    <header class="bg-white dark:bg-apple-gray-900 pt-safe-top">
      <div class="px-4 pt-4 pb-6 max-w-lg mx-auto">
        <h1 class="text-title-large dark:text-white">설정</h1>
      </div>
    </header>

    <div class="max-w-lg mx-auto space-y-8 pb-8">
      <!-- PWA 설치 (설치 가능할 때만 표시) -->
      <section v-if="canInstall" class="px-4">
        <div class="card-apple p-4 bg-apple-blue/5 dark:bg-apple-blue/10">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-apple-lg bg-apple-blue flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <div class="flex-1">
              <h2 class="text-headline dark:text-white">앱 설치하기</h2>
              <p class="text-footnote text-apple-gray-500 mt-1">홈 화면에 추가하여 더 빠르게 접근하세요</p>
              <button
                @click="installPWA"
                class="mt-3 btn btn-primary text-subhead"
              >
                설치
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 일반 설정 -->
      <section>
        <h2 class="text-footnote uppercase text-apple-gray-500 px-5 mb-2">일반</h2>
        <div class="card-inset divide-y divide-apple-gray-200/50 dark:divide-apple-gray-700/50">
          <!-- 다크 모드 -->
          <div class="card-item">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-apple-sm bg-apple-gray-900 dark:bg-apple-gray-100 flex items-center justify-center">
                <svg class="w-4 h-4 text-white dark:text-apple-gray-900" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              </div>
              <span class="text-body dark:text-white">다크 모드</span>
            </div>
            <label class="toggle-apple">
              <input v-model="isDark" type="checkbox" />
              <div class="toggle-track"></div>
              <div class="toggle-thumb"></div>
            </label>
          </div>
        </div>
      </section>

      <!-- 알림 설정 -->
      <section>
        <h2 class="text-footnote uppercase text-apple-gray-500 px-5 mb-2">알림</h2>
        <div class="card-inset divide-y divide-apple-gray-200/50 dark:divide-apple-gray-700/50">
          <!-- 알림 활성화 -->
          <div class="card-item">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-apple-sm bg-apple-red flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div class="flex-1">
                <span class="text-body dark:text-white">알림 허용</span>
                <p class="text-caption-1 text-apple-gray-500">
                  <template v-if="!notifications.isSupported.value">
                    이 브라우저에서 지원되지 않습니다
                  </template>
                  <template v-else-if="notifications.permission.value === 'denied'">
                    브라우저 설정에서 차단됨
                  </template>
                  <template v-else-if="notifications.settings.value.enabled">
                    활성화됨
                  </template>
                  <template v-else>
                    비활성화됨
                  </template>
                </p>
              </div>
            </div>
            <label v-if="notifications.isSupported.value && notifications.permission.value !== 'denied'" class="toggle-apple">
              <input
                :checked="notifications.settings.value.enabled"
                type="checkbox"
                @change="handleNotificationToggle(($event.target as HTMLInputElement).checked)"
              />
              <div class="toggle-track"></div>
              <div class="toggle-thumb"></div>
            </label>
            <span v-else-if="notifications.permission.value === 'denied'" class="text-caption-1 text-apple-red">
              차단됨
            </span>
          </div>

          <!-- 알림 세부 설정 (활성화된 경우만) -->
          <template v-if="notifications.settings.value.enabled">
            <!-- 출발 D-Day 알림 -->
            <div class="card-item pl-14">
              <span class="text-body dark:text-white">출발 알림</span>
              <label class="toggle-apple">
                <input
                  :checked="notifications.settings.value.tripReminder"
                  type="checkbox"
                  @change="handleNotificationSettingChange('tripReminder', ($event.target as HTMLInputElement).checked)"
                />
                <div class="toggle-track"></div>
                <div class="toggle-thumb"></div>
              </label>
            </div>

            <!-- 오늘 일정 알림 -->
            <div class="card-item pl-14">
              <span class="text-body dark:text-white">오늘 일정 알림</span>
              <label class="toggle-apple">
                <input
                  :checked="notifications.settings.value.dailySchedule"
                  type="checkbox"
                  @change="handleNotificationSettingChange('dailySchedule', ($event.target as HTMLInputElement).checked)"
                />
                <div class="toggle-track"></div>
                <div class="toggle-thumb"></div>
              </label>
            </div>

            <!-- 준비물 알림 -->
            <div class="card-item pl-14">
              <span class="text-body dark:text-white">준비물 체크 알림</span>
              <label class="toggle-apple">
                <input
                  :checked="notifications.settings.value.checklistReminder"
                  type="checkbox"
                  @change="handleNotificationSettingChange('checklistReminder', ($event.target as HTMLInputElement).checked)"
                />
                <div class="toggle-track"></div>
                <div class="toggle-thumb"></div>
              </label>
            </div>

            <!-- 테스트 알림 -->
            <div class="card-item cursor-pointer touch-feedback" @click="sendTestNotification">
              <span class="text-body text-apple-blue dark:text-apple-blue-dark">테스트 알림 보내기</span>
              <svg class="w-5 h-5 text-apple-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          </template>
        </div>

        <!-- iOS PWA 안내 -->
        <p v-if="notifications.isIOSPWA.value" class="text-caption-1 text-apple-gray-400 px-5 mt-2">
          iOS에서는 앱이 홈 화면에 설치된 경우에만 알림이 작동합니다
        </p>
      </section>

      <!-- 데이터 관리 -->
      <section>
        <h2 class="text-footnote uppercase text-apple-gray-500 px-5 mb-2">데이터</h2>
        <div class="card-inset divide-y divide-apple-gray-200/50 dark:divide-apple-gray-700/50">
          <!-- 여행 데이터 업로드 -->
          <div
            class="card-item cursor-pointer touch-feedback"
            @click="fileInputRef?.click()"
          >
            <input
              ref="fileInputRef"
              type="file"
              accept=".json"
              class="hidden"
              @change="handleFileSelect"
            />
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-apple-sm bg-apple-blue flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                </svg>
              </div>
              <span class="text-body dark:text-white">여행 데이터 업로드</span>
            </div>
            <svg class="w-5 h-5 text-apple-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </div>

          <!-- 데이터 내보내기 -->
          <div class="card-item cursor-pointer touch-feedback" @click="exportData">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-apple-sm bg-apple-green flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <span class="text-body dark:text-white">데이터 내보내기</span>
            </div>
            <svg class="w-5 h-5 text-apple-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </div>

          <!-- 캐시 초기화 -->
          <div class="card-item cursor-pointer touch-feedback" @click="clearCache">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-apple-sm bg-apple-orange flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </div>
              <span class="text-body dark:text-white">캐시 초기화</span>
            </div>
            <svg class="w-5 h-5 text-apple-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </div>
      </section>

      <!-- 업로드된 여행 목록 -->
      <section v-if="tripStore.userTrips.length > 0">
        <h2 class="text-footnote uppercase text-apple-gray-500 px-5 mb-2">
          업로드된 여행 ({{ tripStore.userTrips.length }})
        </h2>
        <div class="card-inset divide-y divide-apple-gray-200/50 dark:divide-apple-gray-700/50">
          <div
            v-for="trip in tripStore.userTrips"
            :key="trip.id"
            class="card-item"
          >
            <div class="min-w-0 flex-1">
              <p class="text-body dark:text-white truncate">{{ trip.tripMeta.title }}</p>
              <p class="text-caption-1 text-apple-gray-500">
                {{ trip.tripMeta.startDate }} ~ {{ trip.tripMeta.endDate }}
              </p>
            </div>
            <button
              @click="deleteUserTrip(trip.id)"
              class="p-2 text-apple-red touch-feedback rounded-apple-sm"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      <!-- 앱 정보 -->
      <section>
        <h2 class="text-footnote uppercase text-apple-gray-500 px-5 mb-2">정보</h2>
        <div class="card-inset divide-y divide-apple-gray-200/50 dark:divide-apple-gray-700/50">
          <div class="card-item">
            <span class="text-body dark:text-white">버전</span>
            <span class="text-body text-apple-gray-500">{{ appVersion }}</span>
          </div>
          <div class="card-item">
            <span class="text-body dark:text-white">빌드</span>
            <span class="text-body text-apple-gray-500">Nuxt 3 + PWA</span>
          </div>
        </div>
        <p class="text-caption-1 text-apple-gray-400 px-5 mt-2">
          오프라인에서도 사용 가능한 PWA 앱입니다
        </p>
      </section>

      <!-- 푸터 -->
      <section class="text-center py-4">
        <p class="text-caption-1 text-apple-gray-400">TripGuide</p>
        <p class="text-caption-2 text-apple-gray-300 mt-1">Made with Nuxt.js</p>
      </section>
    </div>

    <!-- 업로드 미리보기 모달 -->
    <DataUploadModal
      v-if="showUploadModal"
      :data="uploadPreview"
      :is-uploading="isUploading"
      @confirm="confirmUpload"
      @cancel="cancelUpload"
    />
  </div>
</template>
