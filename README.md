# TripGuide - 여행 가이드 애플리케이션

패키지 여행을 위한 모바일 친화적 일정 관리 및 여행지 가이드 애플리케이션입니다.

## 주요 기능

### 홈 화면
- **D-Day 카운터**: 여행 시작까지 남은 일수 표시
- **오늘의 일정**: 여행 중일 때 당일 일정 요약
- **여행 하이라이트**: 주요 관광지 및 추천 포인트
- **Pull to Refresh**: 당겨서 데이터 새로고침

### 일정 관리
- **일자별 탭 네비게이션**: 스와이프로 일자 전환 지원
- **타임라인 뷰**: 시간순 일정 표시 (관광, 식사, 이동, 자유시간 등)
- **상세 정보 연결**: 관광지 클릭 시 상세 가이드로 이동
- **선택관광 정보**: 비용, 소요시간, 미참가 시 대체 활동 안내
- **쇼핑 정보**: 쇼핑 장소, 품목, 환불 정책 안내

### 여행지 가이드
- **장소별 상세 정보**: 운영시간, 입장료, 추천 소요시간
- **이미지 갤러리**: 스와이프 지원 이미지 뷰어
- **포토 스팟**: 인생샷 촬영 장소 추천
- **현지 팁**: 방문 시 유용한 정보

### 설정
- **다크 모드**: 시스템 설정 연동 또는 수동 전환
- **여행 선택**: 여러 여행 중 선택

## 기술 스택

| 분류 | 기술 |
|------|------|
| Framework | [Nuxt 3](https://nuxt.com/) |
| UI | [Vue 3](https://vuejs.org/) + [TypeScript](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| State | [Pinia](https://pinia.vuejs.org/) |
| Utilities | [VueUse](https://vueuse.org/) |
| PWA | [@vite-pwa/nuxt](https://vite-pwa-org.netlify.app/frameworks/nuxt.html) |
| Deployment | [Vercel](https://vercel.com/) |

## 프로젝트 구조

```
trip.com/
├── assets/
│   └── css/
│       └── main.css          # Tailwind CSS 설정
├── components/
│   ├── ErrorState.vue        # 에러 상태 표시
│   ├── PullToRefresh.vue     # 당겨서 새로고침
│   ├── SkeletonCard.vue      # 로딩 스켈레톤
│   ├── ToastContainer.vue    # 토스트 알림
│   ├── TripCard.vue          # 여행 카드
│   ├── TripSelector.vue      # 여행 선택기
│   └── Icon*.vue             # 아이콘 컴포넌트
├── composables/
│   ├── usePullToRefresh.ts   # Pull to Refresh 로직
│   ├── useToast.ts           # 토스트 알림
│   └── useTripData.ts        # 여행 데이터 로드
├── layouts/
│   └── default.vue           # 기본 레이아웃 (하단 네비게이션)
├── pages/
│   ├── index.vue             # 홈 화면
│   ├── schedule.vue          # 일정 화면
│   ├── settings.vue          # 설정 화면
│   └── guide/
│       ├── index.vue         # 가이드 목록
│       └── [id].vue          # 장소 상세
├── public/
│   └── data/
│       ├── trips.json        # 여행 목록
│       └── trips/
│           └── {trip-id}/
│               ├── itinerary.json   # 일정 데이터
│               ├── places.json      # 장소 데이터
│               └── highlights.json  # 하이라이트 데이터
├── stores/
│   └── trip.ts               # 여행 상태 관리
├── types/
│   └── index.ts              # TypeScript 타입 정의
├── nuxt.config.ts            # Nuxt 설정
└── tailwind.config.ts        # Tailwind 설정
```

## 데이터 구조

### 일정 데이터 (itinerary.json)

```typescript
interface ScheduleItem {
  id: string
  startTime: string           // "09:00"
  endTime: string             // "11:00"
  title: string
  type: 'meeting' | 'transport' | 'attraction' | 'meal' | 'free' | 'transfer' | 'activity' | 'arrival'
  placeId: string | null      // 장소 상세 연결
  location?: string
  notes: string | null
  recommendations?: FreeTimeRecommendation[]  // 자유시간 추천 활동
  alternatives?: AttractionAlternative[]      // 대체 관광지
  optionalTour?: OptionalTour                 // 선택관광 정보
  shopping?: ShoppingInfo                     // 쇼핑 정보
}
```

### 장소 데이터 (places.json)

```typescript
interface Place {
  id: string
  name: string
  nameLocal: string           // 현지어 이름
  city: string
  country: string
  category: string
  location: {
    address: string
    coordinates: { lat: number; lng: number }
  }
  basicInfo: {
    openingHours: string
    admission: string
    recommendedDuration: string
    website: string | null
  }
  description: {
    summary: string
    history: string
    highlights: string[]
  }
  tips: string[]
  photoSpots: string[]
  images?: string[]
}
```

## 시작하기

### 요구 사항

- Node.js 18.x 이상
- npm 또는 yarn

### 설치

```bash
# 저장소 클론
git clone https://github.com/your-repo/trip.com.git
cd trip.com

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

개발 서버가 `http://localhost:3000`에서 실행됩니다.

### 빌드

```bash
# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview

# 타입 검사
npm run typecheck
```

## 배포

Vercel에 자동 배포되도록 설정되어 있습니다.

```bash
# Vercel CLI 설치
npm install -g vercel

# 프로젝트 연결
vercel link

# 배포
vercel --prod
```

### 환경 변수

| 변수 | 설명 |
|------|------|
| `VERCEL_ORG_ID` | Vercel 조직 ID |
| `VERCEL_PROJECT_ID` | Vercel 프로젝트 ID |

## 주요 컴포넌트 사용법

### Pull to Refresh

```vue
<script setup>
const pageRef = ref<HTMLElement | null>(null)
const { isPulling, isRefreshing, pullDistance, canRefresh } = usePullToRefresh(pageRef, {
  onRefresh: async () => {
    await fetchData()
  }
})
</script>

<template>
  <div ref="pageRef">
    <PullToRefresh :is-refreshing="isRefreshing" :pull-distance="pullDistance" :can-refresh="canRefresh" />
    <!-- content -->
  </div>
</template>
```

### 토스트 알림

```typescript
const toast = useToast()

toast.show('저장되었습니다', 'success')
toast.show('오류가 발생했습니다', 'error')
toast.show('주의가 필요합니다', 'warning')
```

### 스켈레톤 로딩

```vue
<template>
  <SkeletonCard v-if="pending" :show-image="true" :lines="3" />
  <div v-else>{{ data }}</div>
</template>
```

## 모바일 최적화

- **Safe Area 대응**: 노치, 홈 인디케이터 영역 고려
- **터치 타겟**: 최소 44x44px 확보
- **스와이프 제스처**: 일정 탭 전환, 이미지 갤러리
- **페이지 전환 애니메이션**: 부드러운 fade + slide 효과

## 라이선스

MIT License
