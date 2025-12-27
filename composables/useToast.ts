// 토스트 알림 타입
export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: number
  message: string
  type: ToastType
  duration: number
}

// 토스트 ID 카운터
let toastId = 0

export const useToast = () => {
  // SSR-safe 상태 관리 (useState 사용)
  const toasts = useState<Toast[]>('toasts', () => [])
  // 토스트 추가
  const show = (message: string, type: ToastType = 'info', duration = 3000) => {
    const id = ++toastId
    const toast: Toast = { id, message, type, duration }

    toasts.value.push(toast)

    // 자동 제거
    if (duration > 0) {
      setTimeout(() => {
        remove(id)
      }, duration)
    }

    return id
  }

  // 토스트 제거
  const remove = (id: number) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  // 모든 토스트 제거
  const clear = () => {
    toasts.value = []
  }

  // 편의 메서드
  const success = (message: string, duration?: number) => show(message, 'success', duration)
  const error = (message: string, duration?: number) => show(message, 'error', duration)
  const warning = (message: string, duration?: number) => show(message, 'warning', duration)
  const info = (message: string, duration?: number) => show(message, 'info', duration)

  return {
    toasts: computed(() => toasts.value),
    show,
    remove,
    clear,
    success,
    error,
    warning,
    info,
  }
}
