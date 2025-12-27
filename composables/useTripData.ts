import type { Itinerary, PlacesData, HighlightsData, Place, TripHighlight, TripsData } from '~/types'

// 여행 목록 데이터 로드
export const useTrips = () => {
  return useAsyncData<TripsData>('trips', () =>
    $fetch('/data/trips.json')
  )
}

// 현재 선택된 여행 ID 가져오기
const getCurrentTripId = () => {
  const store = useTripStore()
  return store.currentTripId || 'spain-portugal-2025' // 기본값
}

// 여행 일정 데이터 로드
export const useItinerary = () => {
  const store = useTripStore()
  const tripId = computed(() => store.currentTripId || 'spain-portugal-2025')

  return useAsyncData<Itinerary>(
    () => `itinerary-${tripId.value}`,
    () => $fetch(`/data/trips/${tripId.value}/itinerary.json`),
    { watch: [tripId] }
  )
}

// 여행지 정보 데이터 로드
export const usePlaces = () => {
  const store = useTripStore()
  const tripId = computed(() => store.currentTripId || 'spain-portugal-2025')

  return useAsyncData<PlacesData>(
    () => `places-${tripId.value}`,
    () => $fetch(`/data/trips/${tripId.value}/places.json`),
    { watch: [tripId] }
  )
}

// 하이라이트 데이터 로드
export const useHighlights = () => {
  const store = useTripStore()
  const tripId = computed(() => store.currentTripId || 'spain-portugal-2025')

  return useAsyncData<HighlightsData>(
    () => `highlights-${tripId.value}`,
    () => $fetch(`/data/trips/${tripId.value}/highlights.json`),
    { watch: [tripId] }
  )
}

// 특정 장소 정보 가져오기
export const usePlace = (placeId: string) => {
  const { data: placesData } = usePlaces()

  return computed<Place | undefined>(() => {
    return placesData.value?.places.find(p => p.id === placeId)
  })
}

// 특정 장소의 하이라이트 가져오기
export const usePlaceHighlight = (placeId: string) => {
  const { data: highlightsData } = useHighlights()

  return computed<TripHighlight | undefined>(() => {
    return highlightsData.value?.tripHighlights.find(h => h.placeId === placeId)
  })
}
