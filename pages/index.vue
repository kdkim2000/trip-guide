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
  <div ref="pageRef" class="min-h-screen relative">
    <!-- Pull to Refresh 인디케이터 -->
    <PullToRefresh
      :is-refreshing="isRefreshing"
      :pull-distance="pullDistance"
      :can-refresh="canRefresh"
    />

    <!-- 헤더 -->
    <header class="bg-primary-500 text-white px-4 pt-12 pb-6 safe-top">
      <div class="max-w-lg mx-auto">
        <!-- 여행 선택 -->
        <div class="mb-4">
          <TripSelector />
        </div>

        <!-- 여행 상태 -->
        <div v-if="tripStatus" class="bg-white/20 rounded-lg p-4">
          <template v-if="tripStatus.type === 'before'">
            <p class="text-sm text-primary-100">여행까지</p>
            <p class="text-3xl font-bold">D-{{ tripStatus.daysLeft }}</p>
          </template>
          <template v-else-if="tripStatus.type === 'during'">
            <p class="text-sm text-primary-100">현재</p>
            <p class="text-3xl font-bold">Day {{ tripStatus.dayNumber }}</p>
          </template>
          <template v-else>
            <p class="text-lg font-medium">여행 완료</p>
          </template>
        </div>
      </div>
    </header>

    <!-- 메인 콘텐츠 -->
    <div class="px-4 py-6 max-w-lg mx-auto space-y-6">
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
        <!-- 빠른 링크 (상단으로 이동) -->
        <section class="grid grid-cols-2 gap-3">
          <NuxtLink to="/schedule" class="card flex items-center gap-3 hover:shadow-md transition-shadow active:scale-98">
            <IconCalendar class="w-8 h-8 text-primary-500" />
            <div>
              <p class="font-semibold">전체 일정</p>
              <p class="text-sm text-gray-500">{{ itinerary?.schedules.length }}일</p>
            </div>
          </NuxtLink>
          <NuxtLink to="/guide" class="card flex items-center gap-3 hover:shadow-md transition-shadow active:scale-98">
            <IconMap class="w-8 h-8 text-primary-500" />
            <div>
              <p class="font-semibold">여행지 정보</p>
              <p class="text-sm text-gray-500">{{ placesData?.places.length }}곳</p>
            </div>
          </NuxtLink>
        </section>

        <!-- 오늘의 일정 (여행 중일 때) - 강조 스타일 -->
        <section v-if="currentSchedule" class="card border-l-4 border-l-primary-500 bg-gradient-to-r from-primary-50 to-white dark:from-primary-900/20 dark:to-gray-800">
          <div class="flex items-center gap-2 mb-3">
            <span class="text-xl">📅</span>
            <h2 class="text-lg font-bold">오늘의 일정</h2>
            <span class="ml-auto text-xs bg-primary-500 text-white px-2 py-0.5 rounded-full">
              Day {{ tripStatus?.dayNumber }}
            </span>
          </div>
        <div class="space-y-3">
          <div
            v-for="item in currentSchedule.items.slice(0, 3)"
            :key="item.id"
            class="flex items-start gap-3"
          >
            <span class="text-sm text-gray-500 w-14 shrink-0">{{ item.startTime }}</span>
            <div>
              <p class="font-medium">{{ item.title }}</p>
              <p v-if="item.notes" class="text-sm text-gray-500">{{ item.notes }}</p>
            </div>
          </div>
        </div>
        <NuxtLink to="/schedule" class="block mt-4 text-center text-primary-500 text-sm font-medium">
          전체 일정 보기 →
        </NuxtLink>
      </section>

      <!-- 주요 하이라이트 -->
      <section>
        <h2 class="text-lg font-semibold mb-3">주요 하이라이트</h2>
        <div class="grid grid-cols-2 gap-3">
          <div
            v-for="highlight in topHighlights"
            :key="highlight.id"
            class="card"
          >
            <span class="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
              Day {{ highlight.dayNumber }}
            </span>
            <h3 class="font-medium mt-2 line-clamp-2">{{ highlight.title }}</h3>
            <p class="text-sm text-gray-500 mt-1 line-clamp-2">{{ highlight.description }}</p>
          </div>
        </div>
      </section>

      <!-- 여행 정보 요약 -->
      <section class="card">
        <h2 class="text-lg font-semibold mb-3">여행 정보</h2>
        <dl class="space-y-2 text-sm">
          <div class="flex justify-between">
            <dt class="text-gray-500">기간</dt>
            <dd>{{ itinerary?.tripInfo.startDate }} ~ {{ itinerary?.tripInfo.endDate }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-gray-500">항공</dt>
            <dd>{{ itinerary?.tripInfo.airline?.name }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-gray-500">숙소</dt>
            <dd class="text-right max-w-[60%]">{{ itinerary?.tripInfo.accommodation }}</dd>
          </div>
        </dl>
      </section>
      </template>
    </div>
  </div>
</template>
