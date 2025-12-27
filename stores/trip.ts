import type { TripMeta, TripsData } from '~/types'

export const useTripStore = defineStore('trip', () => {
  // 상태
  const trips = ref<TripMeta[]>([])
  const currentTripId = ref<string | null>(null)
  const isLoading = ref(false)
  const isInitialized = ref(false)

  // 현재 선택된 여행 정보
  const currentTrip = computed(() =>
    trips.value.find(t => t.id === currentTripId.value) || null
  )

  // 여행 목록 로드
  const loadTrips = async () => {
    if (isInitialized.value) return

    isLoading.value = true
    try {
      const data = await $fetch<TripsData>('/data/trips.json')
      trips.value = data.trips

      // localStorage에서 마지막 선택 복원 또는 기본값 사용
      const savedTripId = import.meta.client
        ? localStorage.getItem('currentTripId')
        : null

      if (savedTripId && data.trips.some(t => t.id === savedTripId)) {
        currentTripId.value = savedTripId
      } else {
        currentTripId.value = data.defaultTripId
      }

      isInitialized.value = true
    } catch (error) {
      console.error('Failed to load trips:', error)
    } finally {
      isLoading.value = false
    }
  }

  // 여행 선택
  const selectTrip = (tripId: string) => {
    if (trips.value.some(t => t.id === tripId)) {
      currentTripId.value = tripId
      if (import.meta.client) {
        localStorage.setItem('currentTripId', tripId)
      }
    }
  }

  // 여행 상태 계산 (upcoming, ongoing, completed)
  const getTripStatus = (trip: TripMeta): TripMeta['status'] => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const startDate = new Date(trip.startDate)
    const endDate = new Date(trip.endDate)

    if (today < startDate) return 'upcoming'
    if (today > endDate) return 'completed'
    return 'ongoing'
  }

  // 여행 목록 (상태 업데이트됨)
  const tripsWithStatus = computed(() =>
    trips.value.map(trip => ({
      ...trip,
      status: getTripStatus(trip)
    }))
  )

  return {
    // 상태
    trips,
    currentTripId,
    isLoading,
    isInitialized,

    // Getters
    currentTrip,
    tripsWithStatus,

    // Actions
    loadTrips,
    selectTrip,
  }
})
