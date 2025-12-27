<script setup lang="ts">
import type { DaySchedule, Place } from '~/types'

// Composable을 통한 데이터 로드
const { data: itinerary } = await useItinerary()
const { data: placesData } = await usePlaces()

// 선택된 일자
const selectedDay = ref(1)

// 현재 선택된 일정
const currentDaySchedule = computed<DaySchedule | undefined>(() => {
  return itinerary.value?.schedules.find(s => s.dayNumber === selectedDay.value)
})

// 아이템 타입별 아이콘
const getTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    meeting: '👥',
    transport: '✈️',
    attraction: '🏛️',
    meal: '🍽️',
    free: '🚶',
    transfer: '🚌',
    activity: '⭐',
    arrival: '🛬',
  }
  return icons[type] || '📍'
}

// 아이템 타입별 색상
const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    meeting: 'bg-blue-100 text-blue-700',
    transport: 'bg-purple-100 text-purple-700',
    attraction: 'bg-amber-100 text-amber-700',
    meal: 'bg-green-100 text-green-700',
    free: 'bg-pink-100 text-pink-700',
    transfer: 'bg-gray-100 text-gray-700',
    activity: 'bg-orange-100 text-orange-700',
    arrival: 'bg-cyan-100 text-cyan-700',
  }
  return colors[type] || 'bg-gray-100 text-gray-700'
}

// 장소 정보 가져오기
const getPlace = (placeId: string | null): Place | undefined => {
  if (!placeId) return undefined
  return placesData.value?.places.find(p => p.id === placeId)
}
</script>

<template>
  <div class="min-h-screen">
    <!-- 헤더 -->
    <header class="bg-white border-b border-gray-200 px-4 pt-12 pb-4 safe-top sticky top-0 z-10">
      <h1 class="text-xl font-bold">여행 일정</h1>

      <!-- 일자 선택 탭 -->
      <div class="flex gap-2 mt-4 overflow-x-auto no-scrollbar -mx-4 px-4">
        <button
          v-for="schedule in itinerary?.schedules"
          :key="schedule.id"
          class="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors"
          :class="selectedDay === schedule.dayNumber
            ? 'bg-primary-500 text-white'
            : 'bg-gray-100 text-gray-600'"
          @click="selectedDay = schedule.dayNumber"
        >
          Day {{ schedule.dayNumber }}
        </button>
      </div>
    </header>

    <!-- 일정 상세 -->
    <div v-if="currentDaySchedule" class="px-4 py-6 max-w-lg mx-auto">
      <!-- 일자 정보 -->
      <div class="mb-6">
        <h2 class="text-lg font-semibold">{{ currentDaySchedule.title }}</h2>
        <p class="text-sm text-gray-500">
          {{ currentDaySchedule.date }} ({{ currentDaySchedule.dayOfWeek }})
          • {{ currentDaySchedule.cities.join(' → ') }}
        </p>
      </div>

      <!-- 식사 정보 -->
      <div class="card mb-6">
        <h3 class="text-sm font-medium text-gray-500 mb-2">오늘의 식사</h3>
        <div class="flex justify-between text-sm">
          <span>조식: {{ currentDaySchedule.meals.breakfast.type }}</span>
          <span>중식: {{ currentDaySchedule.meals.lunch.type }}</span>
          <span>석식: {{ currentDaySchedule.meals.dinner.type }}</span>
        </div>
      </div>

      <!-- 타임라인 -->
      <div class="space-y-4">
        <div
          v-for="item in currentDaySchedule.items"
          :key="item.id"
          class="timeline-item"
        >
          <div class="card">
            <div class="flex items-start justify-between mb-2">
              <span class="text-sm text-gray-500">
                {{ item.startTime }} - {{ item.endTime }}
              </span>
              <span
                class="text-xs px-2 py-0.5 rounded-full"
                :class="getTypeColor(item.type)"
              >
                {{ getTypeIcon(item.type) }}
              </span>
            </div>

            <h3 class="font-semibold">{{ item.title }}</h3>

            <p v-if="item.location" class="text-sm text-gray-500 mt-1">
              📍 {{ item.location }}
            </p>

            <p v-if="item.notes" class="text-sm text-gray-600 mt-2">
              {{ item.notes }}
            </p>

            <!-- 연결된 장소 정보 -->
            <NuxtLink
              v-if="item.placeId && getPlace(item.placeId)"
              :to="`/guide/${item.placeId}`"
              class="mt-3 flex items-center gap-2 text-primary-500 text-sm font-medium"
            >
              상세 정보 보기 →
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
