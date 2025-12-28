import type { TripMeta, TripsData, UserTripData, TripMetaWithSource } from '~/types'

export const useTripStore = defineStore('trip', () => {
  // 상태
  const trips = ref<TripMeta[]>([])
  const currentTripId = ref<string | null>(null)
  const isLoading = ref(false)
  const isInitialized = ref(false)

  // 사용자 업로드 여행 (IndexedDB)
  const userTrips = ref<UserTripData[]>([])

  // 현재 선택된 여행 정보 (정적 + 사용자 데이터 모두 검색)
  const currentTrip = computed(() => {
    const staticTrip = trips.value.find(t => t.id === currentTripId.value)
    if (staticTrip) return staticTrip

    const userTrip = userTrips.value.find(ut => ut.id === currentTripId.value)
    return userTrip?.tripMeta || null
  })

  // 전체 여행 목록 (정적 + 사용자 병합)
  const allTrips = computed<TripMetaWithSource[]>(() => {
    const staticTrips: TripMetaWithSource[] = trips.value.map(t => ({
      ...t,
      source: 'static' as const,
    }))
    const dynamicTrips: TripMetaWithSource[] = userTrips.value.map(ut => ({
      ...ut.tripMeta,
      source: 'user' as const,
    }))
    return [...staticTrips, ...dynamicTrips]
  })

  // 사용자 여행 데이터 로드 (IndexedDB에서)
  const loadUserTrips = async () => {
    if (import.meta.client) {
      try {
        const db = useIndexedDB()
        userTrips.value = await db.getAllTrips()
      } catch (error) {
        console.error('Failed to load user trips:', error)
      }
    }
  }

  // 사용자 여행 추가
  const addUserTrip = async (tripData: UserTripData) => {
    if (import.meta.client) {
      try {
        const db = useIndexedDB()
        await db.saveTrip(tripData)
        await loadUserTrips()
      } catch (error) {
        console.error('Failed to add user trip:', error)
        throw error
      }
    }
  }

  // 사용자 여행 삭제
  const removeUserTrip = async (tripId: string) => {
    if (import.meta.client) {
      try {
        const db = useIndexedDB()
        await db.deleteTrip(tripId)
        await loadUserTrips()

        // 삭제된 여행이 현재 선택된 여행이면 기본값으로 변경
        if (currentTripId.value === tripId && trips.value.length > 0) {
          currentTripId.value = trips.value[0].id
          localStorage.setItem('currentTripId', trips.value[0].id)
        }
      } catch (error) {
        console.error('Failed to remove user trip:', error)
        throw error
      }
    }
  }

  // 여행 목록 로드
  const loadTrips = async () => {
    if (isInitialized.value) {
      // 이미 초기화됨 - 클라이언트에서 localStorage 복원만 수행
      if (import.meta.client) {
        restoreFromLocalStorage()
        await loadUserTrips()
      }
      return
    }

    isLoading.value = true
    try {
      const data = await $fetch<TripsData>('/data/trips.json')
      trips.value = data.trips

      // 기본값으로 설정 (SSR에서는 항상 기본값 사용)
      currentTripId.value = data.defaultTripId

      isInitialized.value = true

      // 클라이언트에서 localStorage 복원 및 사용자 여행 로드
      if (import.meta.client) {
        restoreFromLocalStorage()
        await loadUserTrips()
      }
    } catch (error) {
      console.error('Failed to load trips:', error)
    } finally {
      isLoading.value = false
    }
  }

  // localStorage에서 마지막 선택 복원 (정적 + 사용자 여행 모두 지원)
  const restoreFromLocalStorage = () => {
    const savedTripId = localStorage.getItem('currentTripId')
    if (savedTripId) {
      const isStaticTrip = trips.value.some(t => t.id === savedTripId)
      const isUserTrip = userTrips.value.some(ut => ut.id === savedTripId)
      if (isStaticTrip || isUserTrip) {
        currentTripId.value = savedTripId
      }
    }
  }

  // 여행 선택 (정적 + 사용자 여행 모두 지원)
  const selectTrip = (tripId: string) => {
    const isStaticTrip = trips.value.some(t => t.id === tripId)
    const isUserTrip = userTrips.value.some(ut => ut.id === tripId)

    if (isStaticTrip || isUserTrip) {
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
    userTrips,

    // Getters
    currentTrip,
    tripsWithStatus,
    allTrips,

    // Actions
    loadTrips,
    selectTrip,
    loadUserTrips,
    addUserTrip,
    removeUserTrip,
  }
})
