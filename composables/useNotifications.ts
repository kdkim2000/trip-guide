/**
 * 알림 관리 Composable
 * - 브라우저 알림 권한 관리
 * - 여행 관련 알림 스케줄링
 * - 알림 설정 저장/로드
 */

export interface NotificationSettings {
  enabled: boolean
  tripReminder: boolean      // 출발 D-Day 알림
  dailySchedule: boolean     // 오늘 일정 알림
  checklistReminder: boolean // 준비물 체크 알림
}

const STORAGE_KEY = 'notification-settings'
const LAST_NOTIFICATION_KEY = 'last-notification-date'

const defaultSettings: NotificationSettings = {
  enabled: false,
  tripReminder: true,
  dailySchedule: true,
  checklistReminder: true,
}

export const useNotifications = () => {
  // 알림 권한 상태
  const permission = ref<NotificationPermission>('default')

  // 알림 설정
  const settings = ref<NotificationSettings>({ ...defaultSettings })

  // 알림 지원 여부
  const isSupported = computed(() => {
    if (import.meta.server) return false
    return 'Notification' in window
  })

  // iOS PWA 여부 확인
  const isIOSPWA = computed(() => {
    if (import.meta.server) return false
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isStandalone = (window.navigator as any).standalone === true
    return isIOS && isStandalone
  })

  // 설정 로드
  const loadSettings = () => {
    if (import.meta.server) return

    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        settings.value = { ...defaultSettings, ...JSON.parse(saved) }
      }
    } catch (e) {
      console.error('Failed to load notification settings:', e)
    }
  }

  // 설정 저장
  const saveSettings = () => {
    if (import.meta.server) return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings.value))
    } catch (e) {
      console.error('Failed to save notification settings:', e)
    }
  }

  // 권한 요청
  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!isSupported.value) {
      return 'denied'
    }

    try {
      const result = await Notification.requestPermission()
      permission.value = result

      if (result === 'granted') {
        settings.value.enabled = true
        saveSettings()
      }

      return result
    } catch (e) {
      console.error('Failed to request notification permission:', e)
      return 'denied'
    }
  }

  // 알림 표시
  const showNotification = (title: string, options?: NotificationOptions) => {
    if (!isSupported.value || permission.value !== 'granted') {
      return null
    }

    try {
      const notification = new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        ...options,
      })

      // 클릭 시 앱으로 포커스
      notification.onclick = () => {
        window.focus()
        notification.close()
      }

      return notification
    } catch (e) {
      // Service Worker를 통한 알림 시도 (모바일용)
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_NOTIFICATION',
          payload: { title, options },
        })
      }
      return null
    }
  }

  // D-Day 알림 체크 및 표시
  const checkTripReminder = (tripStartDate: string, tripTitle: string) => {
    if (!settings.value.enabled || !settings.value.tripReminder) return

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const startDate = new Date(tripStartDate)
    startDate.setHours(0, 0, 0, 0)

    const diffDays = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    // 오늘 이미 알림을 보냈는지 확인
    const lastNotification = localStorage.getItem(LAST_NOTIFICATION_KEY)
    const todayStr = today.toISOString().split('T')[0]

    if (lastNotification === todayStr) return

    let message = ''

    if (diffDays === 0) {
      message = '오늘 출발입니다! 즐거운 여행 되세요!'
    } else if (diffDays === 1) {
      message = '내일 출발합니다. 준비물을 확인해주세요!'
    } else if (diffDays === 3) {
      message = '출발 3일 전입니다. 준비는 잘 되고 있나요?'
    } else if (diffDays === 7) {
      message = '출발 일주일 전입니다. 여행 준비를 시작해보세요!'
    }

    if (message) {
      showNotification(tripTitle, {
        body: message,
        tag: 'trip-reminder',
      })
      localStorage.setItem(LAST_NOTIFICATION_KEY, todayStr)
    }
  }

  // 오늘 일정 알림
  const showDailyScheduleNotification = (scheduleTitle: string, itemCount: number) => {
    if (!settings.value.enabled || !settings.value.dailySchedule) return

    showNotification('오늘의 일정', {
      body: `${scheduleTitle} - ${itemCount}개의 일정이 있습니다`,
      tag: 'daily-schedule',
    })
  }

  // 준비물 알림
  const showChecklistReminder = (totalItems: number, checkedItems: number) => {
    if (!settings.value.enabled || !settings.value.checklistReminder) return

    const remaining = totalItems - checkedItems
    if (remaining > 0) {
      showNotification('준비물 체크', {
        body: `아직 ${remaining}개의 준비물을 체크하지 않았습니다`,
        tag: 'checklist-reminder',
      })
    }
  }

  // 설정 업데이트
  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    settings.value = { ...settings.value, ...newSettings }
    saveSettings()
  }

  // 알림 활성화/비활성화
  const toggleEnabled = async (enabled: boolean) => {
    if (enabled && permission.value !== 'granted') {
      const result = await requestPermission()
      if (result !== 'granted') {
        return false
      }
    }

    settings.value.enabled = enabled
    saveSettings()
    return true
  }

  // 초기화
  const init = () => {
    if (import.meta.server) return

    // 현재 권한 상태 확인
    if (isSupported.value) {
      permission.value = Notification.permission
    }

    // 저장된 설정 로드
    loadSettings()

    // 권한이 있으면 enabled 상태 동기화
    if (permission.value === 'granted' && settings.value.enabled) {
      settings.value.enabled = true
    } else if (permission.value !== 'granted') {
      settings.value.enabled = false
    }
  }

  return {
    // State
    permission,
    settings,
    isSupported,
    isIOSPWA,

    // Methods
    init,
    requestPermission,
    showNotification,
    checkTripReminder,
    showDailyScheduleNotification,
    showChecklistReminder,
    updateSettings,
    toggleEnabled,
  }
}
