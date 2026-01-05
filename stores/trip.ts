import type { TripMeta, TripsData, UserTripData, TripMetaWithSource, Itinerary, PlacesData, HighlightsData, ScheduleItem } from '~/types'
import { toRaw } from 'vue'

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
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/6d58e71f-f7ca-4deb-8a44-d47e17225386',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trip.ts:48',message:'addUserTrip entry',data:{tripDataId:tripData.id,hasItinerary:!!tripData.itinerary,itineraryType:typeof tripData.itinerary,itineraryIsArray:Array.isArray(tripData.itinerary),itinerarySchedulesType:typeof tripData.itinerary?.schedules,itinerarySchedulesIsArray:Array.isArray(tripData.itinerary?.schedules)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        const db = useIndexedDB()
        // #region agent log
        const canStringify = (() => { try { JSON.stringify(tripData); return true; } catch { return false; } })();
        fetch('http://127.0.0.1:7242/ingest/6d58e71f-f7ca-4deb-8a44-d47e17225386',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trip.ts:52',message:'before saveTrip',data:{canStringify:canStringify},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        await db.saveTrip(tripData)
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/6d58e71f-f7ca-4deb-8a44-d47e17225386',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trip.ts:54',message:'after saveTrip success',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        await loadUserTrips()
      } catch (error) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/6d58e71f-f7ca-4deb-8a44-d47e17225386',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trip.ts:57',message:'addUserTrip error',data:{errorName:error?.name,errorMessage:error?.message,errorStack:error?.stack?.substring(0,200)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
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

  // 정적 여행을 사용자 여행으로 복사
  const copyStaticTripToUser = async (staticTripId: string): Promise<string> => {
    if (!import.meta.client) {
      throw new Error('클라이언트에서만 사용 가능합니다')
    }

    // 이미 사용자 여행이 있는지 확인 (id가 {staticTripId}-user-로 시작하는 것 찾기)
    const existingUserTrip = userTrips.value.find(ut => ut.id.startsWith(`${staticTripId}-user-`))
    if (existingUserTrip) {
      return existingUserTrip.id
    }

    // 정적 여행 메타데이터 찾기
    const staticTrip = trips.value.find(t => t.id === staticTripId)
    if (!staticTrip) {
      throw new Error('정적 여행을 찾을 수 없습니다')
    }

    try {
      // 정적 데이터 로드
      const [itinerary, places, highlights] = await Promise.all([
        $fetch<Itinerary>(`/data/trips/${staticTripId}/itinerary.json`),
        $fetch<PlacesData>(`/data/trips/${staticTripId}/places.json`),
        $fetch<HighlightsData>(`/data/trips/${staticTripId}/highlights.json`)
      ])

      // 사용자 여행 ID 생성
      const userTripId = `${staticTripId}-user-${Date.now()}`

      // 사용자 여행 데이터 생성 (reactive 객체를 평면 객체로 변환)
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6d58e71f-f7ca-4deb-8a44-d47e17225386',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trip.ts:189',message:'before creating userTripData',data:{itineraryType:typeof itinerary,itineraryIsArray:Array.isArray(itinerary),placesType:typeof places,placesIsArray:Array.isArray(places),highlightsType:typeof highlights,highlightsIsArray:Array.isArray(highlights)},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      // toRaw로 reactive 객체를 평면 객체로 변환한 후 JSON 직렬화/역직렬화
      const userTripDataRaw = {
        id: userTripId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tripMeta: {
          ...toRaw(staticTrip),
          id: userTripId
        },
        itinerary: toRaw(itinerary),
        places: toRaw(places),
        highlights: toRaw(highlights)
      }
      // JSON 직렬화/역직렬화로 완전히 평면 객체로 변환
      const userTripData: UserTripData = JSON.parse(JSON.stringify(userTripDataRaw))
      // #region agent log
      const canStringifyUserTrip = (() => { try { JSON.stringify(userTripData); return true; } catch { return false; } })();
      fetch('http://127.0.0.1:7242/ingest/6d58e71f-f7ca-4deb-8a44-d47e17225386',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trip.ts:201',message:'after creating userTripData (after JSON parse/stringify)',data:{canStringify:canStringifyUserTrip},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'D'})}).catch(()=>{});
      // #endregion

      // IndexedDB에 저장
      await addUserTrip(userTripData)

      // 현재 여행 ID 변경
      currentTripId.value = userTripId
      if (import.meta.client) {
        localStorage.setItem('currentTripId', userTripId)
      }

      return userTripId
    } catch (error) {
      console.error('Failed to copy static trip to user trip:', error)
      throw error
    }
  }

  // 일정 아이템 시간 업데이트
  const updateItineraryItem = async (
    dayNumber: number,
    itemId: string,
    newStartTime?: string,
    newEndTime?: string
  ): Promise<void> => {
    if (!import.meta.client) {
      throw new Error('클라이언트에서만 사용 가능합니다')
    }

    const tripId = currentTripId.value
    if (!tripId) {
      throw new Error('선택된 여행이 없습니다')
    }

    // 정적 여행인지 확인
    const isStaticTrip = trips.value.some(t => t.id === tripId)
    let workingTripId = tripId

    // 정적 여행이면 사용자 여행으로 복사
    if (isStaticTrip) {
      workingTripId = await copyStaticTripToUser(tripId)
    }

    // 사용자 여행 데이터 찾기
    const userTrip = userTrips.value.find(ut => ut.id === workingTripId)
    if (!userTrip) {
      throw new Error('여행 데이터를 찾을 수 없습니다')
    }
    // #region agent log
    const canStringifyItinerary = (() => { try { JSON.stringify(userTrip.itinerary); return true; } catch { return false; } })();
    fetch('http://127.0.0.1:7242/ingest/6d58e71f-f7ca-4deb-8a44-d47e17225386',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trip.ts:245',message:'found userTrip',data:{userTripId:userTrip.id,itineraryType:typeof userTrip.itinerary,itineraryIsReactive:!!userTrip.itinerary?.__v_isRef,canStringifyItinerary},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    // 시간 업데이트 로직 사용
    const { updateItemTime } = await import('~/composables/useTimeEditor')
    const updatedItinerary = updateItemTime(
      userTrip.itinerary,
      dayNumber,
      itemId,
      newStartTime,
      newEndTime
    )
    // #region agent log
    const canStringifyUpdatedItinerary = (() => { try { JSON.stringify(updatedItinerary); return true; } catch { return false; } })();
    fetch('http://127.0.0.1:7242/ingest/6d58e71f-f7ca-4deb-8a44-d47e17225386',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trip.ts:258',message:'after updateItemTime',data:{updatedItineraryType:typeof updatedItinerary,updatedItineraryIsReactive:!!updatedItinerary?.__v_isRef,canStringifyUpdatedItinerary},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    // 업데이트된 데이터 저장 (reactive 객체를 평면 객체로 변환)
    // toRaw로 먼저 reactive 객체를 평면 객체로 변환한 후 JSON 직렬화/역직렬화
    const updatedUserTripRaw = {
      ...toRaw(userTrip),
      itinerary: updatedItinerary, // 이미 updateItemTime에서 평면 객체로 변환됨
      updatedAt: new Date().toISOString()
    }
    const updatedUserTrip: UserTripData = JSON.parse(JSON.stringify(updatedUserTripRaw))
    // #region agent log
    const canStringifyUpdatedUserTrip = (() => { try { JSON.stringify(updatedUserTrip); return true; } catch { return false; } })();
    fetch('http://127.0.0.1:7242/ingest/6d58e71f-f7ca-4deb-8a44-d47e17225386',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trip.ts:265',message:'before addUserTrip with updatedUserTrip (after JSON parse/stringify)',data:{canStringify:canStringifyUpdatedUserTrip,placesType:typeof updatedUserTrip.places,highlightsType:typeof updatedUserTrip.highlights},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'C'})}).catch(()=>{});
    // #endregion

    await addUserTrip(updatedUserTrip)
    
    // userTrips가 업데이트되었으므로 현재 tripId가 변경되었을 수 있음
    // (정적 여행에서 사용자 여행으로 복사된 경우)
    if (workingTripId !== tripId) {
      currentTripId.value = workingTripId
      if (import.meta.client) {
        localStorage.setItem('currentTripId', workingTripId)
      }
    }
  }

  // 일정 아이템 추가
  const addScheduleItem = async (
    dayNumber: number,
    newItem: Omit<ScheduleItem, 'id' | 'status'>,
    insertAfterItemId?: string | null
  ): Promise<void> => {
    if (!import.meta.client) {
      throw new Error('클라이언트에서만 사용 가능합니다')
    }

    const tripId = currentTripId.value
    if (!tripId) {
      throw new Error('선택된 여행이 없습니다')
    }

    // 정적 여행인지 확인
    const isStaticTrip = trips.value.some(t => t.id === tripId)
    let workingTripId = tripId

    // 정적 여행이면 사용자 여행으로 복사
    if (isStaticTrip) {
      workingTripId = await copyStaticTripToUser(tripId)
    }

    // 사용자 여행 데이터 찾기
    const userTrip = userTrips.value.find(ut => ut.id === workingTripId)
    if (!userTrip) {
      throw new Error('여행 데이터를 찾을 수 없습니다')
    }

    // 일정 삽입 로직 사용
    const { insertScheduleItem } = await import('~/composables/useTimeEditor')
    const updatedItinerary = insertScheduleItem(
      userTrip.itinerary,
      dayNumber,
      newItem,
      insertAfterItemId
    )

    // 업데이트된 데이터 저장 (reactive 객체를 평면 객체로 변환)
    // toRaw로 먼저 reactive 객체를 평면 객체로 변환한 후 JSON 직렬화/역직렬화
    const updatedUserTripRaw = {
      ...toRaw(userTrip),
      itinerary: updatedItinerary, // 이미 insertScheduleItem에서 평면 객체로 변환됨
      updatedAt: new Date().toISOString()
    }
    const updatedUserTrip: UserTripData = JSON.parse(JSON.stringify(updatedUserTripRaw))

    await addUserTrip(updatedUserTrip)
    
    // userTrips가 업데이트되었으므로 현재 tripId가 변경되었을 수 있음
    // (정적 여행에서 사용자 여행으로 복사된 경우)
    if (workingTripId !== tripId) {
      currentTripId.value = workingTripId
      if (import.meta.client) {
        localStorage.setItem('currentTripId', workingTripId)
      }
    }
  }

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
    copyStaticTripToUser,
    updateItineraryItem,
    addScheduleItem,
  }
})
