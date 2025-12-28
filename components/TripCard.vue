<script setup lang="ts">
import type { TripMeta } from '~/types'

interface Props {
  trip: TripMeta
  isSelected?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isSelected: false
})

const emit = defineEmits<{
  select: [tripId: string]
}>()

// 날짜 포맷
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

// 여행 기간
const tripDuration = computed(() => {
  const start = new Date(props.trip.startDate)
  const end = new Date(props.trip.endDate)
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  return `${days}일`
})

// 상태 라벨
const statusLabel = computed(() => {
  switch (props.trip.status) {
    case 'upcoming': return '예정'
    case 'ongoing': return '진행중'
    case 'completed': return '완료'
    default: return ''
  }
})

// 상태 배지 클래스
const statusBadgeClass = computed(() => {
  switch (props.trip.status) {
    case 'upcoming': return 'badge-primary'
    case 'ongoing': return 'badge-success'
    case 'completed': return 'badge-secondary'
    default: return 'badge-secondary'
  }
})
</script>

<template>
  <button
    @click="emit('select', trip.id)"
    class="w-full text-left p-3 rounded-apple-lg transition-all duration-200 touch-feedback"
    :class="[
      isSelected
        ? 'bg-apple-blue/5 dark:bg-apple-blue/10 ring-2 ring-apple-blue'
        : 'bg-white dark:bg-apple-gray-800 hover:bg-apple-gray-50 dark:hover:bg-apple-gray-700'
    ]"
  >
    <div class="flex gap-3">
      <!-- 썸네일 -->
      <div class="w-16 h-16 rounded-apple-md overflow-hidden shrink-0 bg-apple-gray-100 dark:bg-apple-gray-700">
        <NuxtImg
          :src="trip.thumbnail"
          :alt="trip.title"
          class="w-full h-full object-cover"
          loading="lazy"
          width="64"
          height="64"
        />
      </div>

      <!-- 정보 -->
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-2">
          <h3 class="text-body font-medium dark:text-white truncate">{{ trip.title }}</h3>
          <span class="badge shrink-0" :class="statusBadgeClass">{{ statusLabel }}</span>
        </div>

        <p class="text-footnote text-apple-gray-500 mt-0.5 truncate">{{ trip.subtitle }}</p>

        <div class="flex items-center gap-2 mt-1.5 text-caption-1 text-apple-gray-400">
          <span>{{ formatDate(trip.startDate) }} - {{ formatDate(trip.endDate) }}</span>
          <span class="text-apple-gray-300">|</span>
          <span>{{ tripDuration }}</span>
        </div>

        <div class="flex gap-1 mt-1.5">
          <span
            v-for="country in trip.countries"
            :key="country"
            class="text-caption-2 px-1.5 py-0.5 bg-apple-gray-100 dark:bg-apple-gray-700 text-apple-gray-600 dark:text-apple-gray-400 rounded"
          >
            {{ country }}
          </span>
        </div>
      </div>

      <!-- 선택 표시 -->
      <div v-if="isSelected" class="flex items-center">
        <svg class="w-5 h-5 text-apple-blue" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
      </div>
    </div>
  </button>
</template>
