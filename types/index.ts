// 여행 메타데이터 (목록용)
export interface TripMeta {
  id: string
  title: string
  subtitle: string
  thumbnail: string
  startDate: string
  endDate: string
  countries: string[]
  status: 'upcoming' | 'ongoing' | 'completed'
}

// 여행 목록 데이터
export interface TripsData {
  trips: TripMeta[]
  defaultTripId: string
}

// 여행 정보
export interface TripInfo {
  id: string
  title: string
  subtitle?: string
  startDate: string
  endDate: string
  timezone: string
  airline?: {
    name: string
    mileage: string
  }
  accommodation?: string
  highlights?: string[]
}

// 식사 정보
export interface Meal {
  type: string
  description?: string | null
}

export interface DayMeals {
  breakfast: Meal
  lunch: Meal
  dinner: Meal
}

// 자유시간 추천 활동
export interface FreeTimeRecommendation {
  title: string
  description: string
  location: string
  duration: string
  cost: string
}

// 대체 관광지
export interface AttractionAlternative {
  title: string
  description: string
  reason: string
}

// 선택관광
export interface OptionalTour {
  id: string
  title: string
  description: string
  cost: string
  duration: string
  waitingPlace: string       // 미참가시 대기장소
  waitingActivity: string    // 미참가시 활동
  isGuideAccompanied: boolean // 가이드 동행 여부
}

// 쇼핑 정보
export interface ShoppingInfo {
  id: string
  item: string               // 쇼핑 항목
  location: string           // 쇼핑 장소
  duration: string           // 소요시간
  refundPolicy: string       // 환불 정책
}

// 일정 아이템
export interface ScheduleItem {
  id: string
  startTime: string
  endTime: string
  title: string
  type: 'meeting' | 'transport' | 'attraction' | 'meal' | 'free' | 'transfer' | 'activity' | 'arrival'
  transportType?: 'flight' | 'bus' | 'train'
  placeId: string | null
  location?: string
  notes: string | null
  status: 'pending' | 'in_progress' | 'completed'
  recommendations?: FreeTimeRecommendation[]  // 자유시간 추천 활동
  alternatives?: AttractionAlternative[]       // 대체 관광지/선택관광
  optionalTour?: OptionalTour                  // 선택관광
  shopping?: ShoppingInfo                      // 쇼핑 정보
}

// 일별 일정
export interface DaySchedule {
  id: string
  date: string
  dayNumber: number
  dayOfWeek: string
  title: string
  cities: string[]
  items: ScheduleItem[]
  meals: DayMeals
}

// 특별 기능
export interface SpecialFeature {
  title: string
  description: string
}

// 음식 하이라이트
export interface FoodHighlights {
  desserts: string[]
  mainDishes: string[]
  drinks: string[]
}

// 전체 여행 일정
export interface Itinerary {
  tripInfo: TripInfo
  schedules: DaySchedule[]
  specialFeatures?: SpecialFeature[]
  foodHighlights?: FoodHighlights
}

// 위치 좌표
export interface Coordinates {
  lat: number
  lng: number
}

// 위치 정보
export interface Location {
  address: string
  coordinates: Coordinates
}

// 기본 정보
export interface BasicInfo {
  openingHours: string
  admission: string
  recommendedDuration: string
  website: string | null
}

// 여행지 설명
export interface PlaceDescription {
  summary: string
  history: string
  highlights: string[]
}

// 여행지 정보
export interface Place {
  id: string
  name: string
  nameLocal: string
  city: string
  country: string
  category: string
  location: Location
  basicInfo: BasicInfo
  description: PlaceDescription
  tips: string[]
  photoSpots: string[]
  images?: string[]
}

// 여행지 목록
export interface PlacesData {
  places: Place[]
}

// 하이라이트
export interface TripHighlight {
  id: string
  placeId: string
  dayNumber: number
  title: string
  description: string
  priority: number
  tags: string[]
}

// 일별 베스트
export interface DailyBest {
  dayNumber: number
  title: string
  bestMoment: string
}

// 사진 스팟
export interface PhotoSpot {
  id: string
  placeId: string
  title: string
  description: string
  bestTime: string
  tips: string
}

// 로컬 팁
export interface LocalTip {
  category: string
  title: string
  description: string
  where: string
}

// 하이라이트 데이터
export interface HighlightsData {
  tripHighlights: TripHighlight[]
  dailyBest: DailyBest[]
  photoSpots: PhotoSpot[]
  localTips: LocalTip[]
}
