import type { Itinerary, PlacesData, HighlightsData, Place, TripHighlight } from '~/types'

// 여행 일정 데이터 로드
export const useItinerary = () => {
  return useAsyncData<Itinerary>('itinerary', () =>
    $fetch('/data/itinerary.json')
  )
}

// 여행지 정보 데이터 로드
export const usePlaces = () => {
  return useAsyncData<PlacesData>('places', () =>
    $fetch('/data/places.json')
  )
}

// 하이라이트 데이터 로드
export const useHighlights = () => {
  return useAsyncData<HighlightsData>('highlights', () =>
    $fetch('/data/highlights.json')
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
