<script setup lang="ts">
import type { DaySchedule } from '~/types'

// 여행 스토어
const tripStore = useTripStore()

// Composable을 통한 데이터 로드 (pending, error 상태 추적)
const { data: itinerary, pending: itineraryPending, error: itineraryError, refresh: refreshItinerary } = await useItinerary()
const { data: placesData, pending: placesPending } = await usePlaces()
const { data: highlightsData, pending: highlightsPending } = await useHighlights()

// 전체 로딩 상태
const isLoading = computed(() => itineraryPending.value || placesPending.value || highlightsPending.value)

// 현재 시간
const now = useNow({ interval: 1000 })

// 여행 상태 계산
const tripStatus = computed(() => {
  if (!itinerary.value) return null

  const startDate = new Date(itinerary.value.tripInfo.startDate)
  const endDate = new Date(itinerary.value.tripInfo.endDate)
  const today = new Date(now.value)

  if (today < startDate) {
    const diff = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return { type: 'before' as const, daysLeft: diff }
  } else if (today > endDate) {
    return { type: 'after' as const }
  } else {
    const dayNumber = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    return { type: 'during' as const, dayNumber }
  }
})

// 현재 또는 다음 일정 찾기
const currentSchedule = computed<DaySchedule | undefined>(() => {
  if (!itinerary.value || tripStatus.value?.type !== 'during') return undefined
  return itinerary.value.schedules.find(s => s.dayNumber === tripStatus.value?.dayNumber)
})

// 상위 하이라이트
const topHighlights = computed(() => {
  if (!highlightsData.value) return []
  return highlightsData.value.tripHighlights
    .filter(h => h.priority <= 2)
    .slice(0, 4)
})

// Pull to Refresh
const pageRef = ref<HTMLElement | null>(null)
const { isPulling, isRefreshing, pullDistance, canRefresh } = usePullToRefresh(pageRef, {
  onRefresh: async () => {
    await refreshItinerary()
  }
})
</script>

<template>
  <div ref="pageRef" class="min-h-screen relative bg-flat-gray-50 dark:bg-flat-gray-900">
    <!-- Pull to Refresh 인디케이터 -->
    <PullToRefresh
      :is-refreshing="isRefreshing"
      :pull-distance="pullDistance"
      :can-refresh="canRefresh"
    />

    <!-- 헤더 -->
    <header class="bg-white dark:bg-flat-gray-900 pt-safe-top">
      <div class="px-4 pt-4 pb-2 max-w-lg mx-auto">
        <!-- Large Title -->
        <h1 class="text-title-large dark:text-white">여행</h1>
      </div>

      <!-- 여행 선택 -->
      <div class="px-4 pb-4 max-w-lg mx-auto">
        <TripSelector />
      </div>

      <!-- 여행 상태 -->
      <div v-if="tripStatus" class="px-4 pb-6 max-w-lg mx-auto">
        <div v-if="tripStatus.type === 'before'" class="flex items-baseline gap-2">
          <span class="text-footnote text-flat-gray-500">출발까지</span>
          <span class="text-title-1 text-flat-blue dark:text-flat-blue-dark">D-{{ tripStatus.daysLeft }}</span>
        </div>
        <div v-else-if="tripStatus.type === 'during'" class="flex items-baseline gap-2">
          <span class="text-footnote text-flat-gray-500">여행중</span>
          <span class="text-title-1 text-flat-blue dark:text-flat-blue-dark">Day {{ tripStatus.dayNumber }}</span>
        </div>
        <div v-else class="flex items-center gap-2">
          <span class="text-headline text-flat-gray-500">여행 완료</span>
          <svg class="w-5 h-5 text-flat-green" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
      </div>
    </header>

    <!-- 메인 콘텐츠 -->
    <div class="px-4 py-6 max-w-lg mx-auto space-y-8">
      <!-- 로딩 상태 -->
      <template v-if="isLoading">
        <SkeletonCard :show-image="false" :lines="2" />
        <SkeletonCard :show-image="false" :lines="3" />
        <SkeletonList :count="2" :show-thumbnail="false" />
      </template>

      <!-- 에러 상태 -->
      <ErrorState
        v-else-if="itineraryError"
        message="여행 정보를 불러올 수 없습니다"
        @retry="refreshItinerary"
      />

      <!-- 콘텐츠 -->
      <template v-else>
        <!-- 빠른 액세스 -->
        <section class="grid grid-cols-2 gap-3">
          <NuxtLink
            to="/schedule"
            class="card-apple p-4 flex items-center gap-3 touch-scale"
          >
            <div class="w-10 h-10 rounded-flat-md bg-primary-50 flex items-center justify-center">
              <IconCalendar class="w-5 h-5 text-flat-blue" />
            </div>
            <div>
              <p class="text-headline dark:text-white">일정</p>
              <p class="text-footnote text-flat-gray-500">{{ itinerary?.schedules.length }}일</p>
            </div>
          </NuxtLink>
          <NuxtLink
            to="/guide"
            class="card-apple p-4 flex items-center gap-3 touch-scale"
          >
            <div class="w-10 h-10 rounded-flat-md bg-orange-50 flex items-center justify-center">
              <IconMap class="w-5 h-5 text-flat-orange" />
            </div>
            <div>
              <p class="text-headline dark:text-white">가이드</p>
              <p class="text-footnote text-flat-gray-500">{{ placesData?.places.length }}곳</p>
            </div>
          </NuxtLink>
        </section>

        <!-- 오늘의 일정 (여행 중일 때) -->
        <section v-if="currentSchedule" class="card-apple overflow-hidden">
          <div class="px-4 py-3 border-b border-flat-gray-200 dark:border-flat-gray-700 flex items-center justify-between">
            <h2 class="text-headline dark:text-white">오늘의 일정</h2>
            <span class="badge badge-primary">Day {{ tripStatus?.dayNumber }}</span>
          </div>
          <div class="divide-y divide-flat-gray-200 dark:divide-flat-gray-700">
            <div
              v-for="item in currentSchedule.items.slice(0, 3)"
              :key="item.id"
              class="px-4 py-3 flex items-start gap-4"
            >
              <span class="text-subhead text-flat-gray-500 w-12 shrink-0">{{ item.startTime }}</span>
              <div class="flex-1 min-w-0">
                <p class="text-body dark:text-white truncate">{{ item.title }}</p>
                <p v-if="item.notes" class="text-footnote text-flat-gray-500 truncate">{{ item.notes }}</p>
              </div>
            </div>
          </div>
          <NuxtLink
            to="/schedule"
            class="block px-4 py-3 text-center text-flat-blue dark:text-flat-blue-dark text-subhead font-medium border-t border-flat-gray-200 dark:border-flat-gray-700 touch-feedback"
          >
            전체 일정 보기
          </NuxtLink>
        </section>

        <!-- 주요 하이라이트 -->
        <section v-if="topHighlights.length > 0">
          <h2 class="text-footnote uppercase text-flat-gray-500 px-1 mb-3">하이라이트</h2>
          <div class="grid grid-cols-2 gap-3">
            <div
              v-for="highlight in topHighlights"
              :key="highlight.id"
              class="card-apple p-4"
            >
              <span class="badge badge-primary">Day {{ highlight.dayNumber }}</span>
              <h3 class="text-headline dark:text-white mt-2 line-clamp-2">{{ highlight.title }}</h3>
              <p class="text-footnote text-flat-gray-500 mt-1 line-clamp-2">{{ highlight.description }}</p>
            </div>
          </div>
        </section>

        <!-- 여행 정보 요약 -->
        <section>
          <h2 class="text-footnote uppercase text-flat-gray-500 px-1 mb-3">여행 정보</h2>
          <div class="card-apple overflow-hidden divide-y divide-flat-gray-200 dark:divide-flat-gray-700">
            <div class="px-4 py-3 flex justify-between items-center">
              <span class="text-body dark:text-white">기간</span>
              <span class="text-body text-flat-gray-500">{{ itinerary?.tripInfo.startDate }} ~ {{ itinerary?.tripInfo.endDate }}</span>
            </div>
            <div class="px-4 py-3 flex justify-between items-center">
              <span class="text-body dark:text-white">항공</span>
              <span class="text-body text-flat-gray-500">{{ itinerary?.tripInfo.airline?.name }}</span>
            </div>
            <div class="px-4 py-3 flex justify-between items-center">
              <span class="text-body dark:text-white">숙소</span>
              <span class="text-body text-flat-gray-500 text-right max-w-[55%] truncate">{{ itinerary?.tripInfo.accommodation }}</span>
            </div>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>
