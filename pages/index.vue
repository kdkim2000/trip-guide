<script setup lang="ts">
import type { DaySchedule } from '~/types'

// Composable을 통한 데이터 로드
const { data: itinerary } = await useItinerary()
const { data: placesData } = await usePlaces()
const { data: highlightsData } = await useHighlights()

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
</script>

<template>
  <div class="min-h-screen">
    <!-- 헤더 -->
    <header class="bg-primary-500 text-white px-4 pt-12 pb-8 safe-top">
      <div class="max-w-lg mx-auto">
        <h1 class="text-2xl font-bold">{{ itinerary?.tripInfo.title || 'TripGuide' }}</h1>
        <p class="text-primary-100 mt-1">{{ itinerary?.tripInfo.subtitle }}</p>

        <!-- 여행 상태 -->
        <div v-if="tripStatus" class="mt-4 bg-white/20 rounded-lg p-4">
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
      <!-- 오늘의 일정 (여행 중일 때) -->
      <section v-if="currentSchedule" class="card">
        <h2 class="text-lg font-semibold mb-3">오늘의 일정</h2>
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

      <!-- 빠른 링크 -->
      <section class="grid grid-cols-2 gap-3">
        <NuxtLink to="/schedule" class="card flex items-center gap-3">
          <IconCalendar class="w-8 h-8 text-primary-500" />
          <div>
            <p class="font-medium">전체 일정</p>
            <p class="text-sm text-gray-500">{{ itinerary?.schedules.length }}일</p>
          </div>
        </NuxtLink>
        <NuxtLink to="/guide" class="card flex items-center gap-3">
          <IconMap class="w-8 h-8 text-primary-500" />
          <div>
            <p class="font-medium">여행지 정보</p>
            <p class="text-sm text-gray-500">{{ placesData?.places.length }}곳</p>
          </div>
        </NuxtLink>
      </section>
    </div>
  </div>
</template>
