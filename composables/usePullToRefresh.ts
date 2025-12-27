import { ref, onMounted, onUnmounted } from 'vue'

interface PullToRefreshOptions {
  onRefresh: () => Promise<void>
  threshold?: number
  maxPull?: number
}

export function usePullToRefresh(
  containerRef: Ref<HTMLElement | null>,
  options: PullToRefreshOptions
) {
  const { onRefresh, threshold = 80, maxPull = 120 } = options

  const isPulling = ref(false)
  const isRefreshing = ref(false)
  const pullDistance = ref(0)

  let startY = 0
  let currentY = 0

  const canPull = () => {
    // 스크롤이 맨 위에 있을 때만 pull 가능
    return window.scrollY === 0
  }

  const handleTouchStart = (e: TouchEvent) => {
    if (!canPull() || isRefreshing.value) return
    startY = e.touches[0].clientY
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!canPull() || isRefreshing.value || startY === 0) return

    currentY = e.touches[0].clientY
    const diff = currentY - startY

    if (diff > 0) {
      isPulling.value = true
      // 저항감 있는 pull (로그 함수 사용)
      pullDistance.value = Math.min(diff * 0.5, maxPull)

      // 기본 스크롤 방지
      if (pullDistance.value > 10) {
        e.preventDefault()
      }
    }
  }

  const handleTouchEnd = async () => {
    if (!isPulling.value) return

    if (pullDistance.value >= threshold) {
      // 새로고침 실행
      isRefreshing.value = true
      pullDistance.value = 60 // 로딩 표시 위치

      try {
        await onRefresh()
      } finally {
        isRefreshing.value = false
        pullDistance.value = 0
      }
    } else {
      pullDistance.value = 0
    }

    isPulling.value = false
    startY = 0
    currentY = 0
  }

  onMounted(() => {
    const container = containerRef.value || document
    container.addEventListener('touchstart', handleTouchStart as EventListener, { passive: true })
    container.addEventListener('touchmove', handleTouchMove as EventListener, { passive: false })
    container.addEventListener('touchend', handleTouchEnd as EventListener, { passive: true })
  })

  onUnmounted(() => {
    const container = containerRef.value || document
    container.removeEventListener('touchstart', handleTouchStart as EventListener)
    container.removeEventListener('touchmove', handleTouchMove as EventListener)
    container.removeEventListener('touchend', handleTouchEnd as EventListener)
  })

  return {
    isPulling,
    isRefreshing,
    pullDistance,
    canRefresh: computed(() => pullDistance.value >= threshold)
  }
}
