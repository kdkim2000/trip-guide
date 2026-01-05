<script setup lang="ts">
import type { DaySchedule, Place, ScheduleItem } from '~/types'
import { timeToMinutes, minutesToTime } from '~/composables/useTimeEditor'

// Composable을 통한 데이터 로드 (pending, error 상태 추적)
const { data: itinerary, pending, error, refresh } = await useItinerary()
const { data: placesData } = await usePlaces()

// Trip Store
const tripStore = useTripStore()
const toast = useToast()

// 시간 편집 시트 상태
const isTimeEditSheetOpen = ref(false)
const editingItem = ref<ScheduleItem | null>(null)
const isSaving = ref(false)

// 일정 추가 시트 상태
const isAddSheetOpen = ref(false)
const insertAfterItemId = ref<string | null>(null)
const isAdding = ref(false)

// URL 쿼리에서 선택된 일자 읽기/쓰기
const route = useRoute()
const router = useRouter()

// 선택된 일자 (URL 쿼리 파라미터로 유지)
const getInitialDay = () => {
  const queryDay = Number(route.query.day)
  const maxDays = itinerary.value?.schedules.length || 1
  // 유효한 범위 내의 값만 허용
  if (queryDay >= 1 && queryDay <= maxDays) {
    return queryDay
  }
  return 1
}
const selectedDay = ref(getInitialDay())

// 선택된 일자가 변경되면 URL 업데이트
watch(selectedDay, (day) => {
  router.replace({ query: { ...route.query, day: day.toString() } })
}, { immediate: false })

// 콘텐츠 영역 ref (스와이프용)
const contentRef = ref<HTMLElement | null>(null)

// 최대 일자 수
const maxDay = computed(() => itinerary.value?.schedules.length || 1)

// 스와이프로 일자 변경
const { direction } = useSwipe(contentRef, {
  onSwipeEnd() {
    if (direction.value === 'left' && selectedDay.value < maxDay.value) {
      selectedDay.value++
    } else if (direction.value === 'right' && selectedDay.value > 1) {
      selectedDay.value--
    }
  }
})

// 선택된 탭 자동 스크롤
watch(selectedDay, (day) => {
  nextTick(() => {
    const tab = document.querySelector(`[data-day="${day}"]`)
    tab?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  })
})

// 현재 선택된 일정
const currentDaySchedule = computed<DaySchedule | undefined>(() => {
  return itinerary.value?.schedules.find(s => s.dayNumber === selectedDay.value)
})

// 아이템 타입별 색상
const getTypeDotColor = (type: string) => {
  const colors: Record<string, string> = {
    meeting: 'bg-flat-blue',
    transport: 'bg-purple-500',
    attraction: 'bg-flat-orange',
    meal: 'bg-flat-green',
    free: 'bg-pink-500',
    transfer: 'bg-flat-gray-400',
    activity: 'bg-flat-yellow',
    arrival: 'bg-teal-500',
  }
  return colors[type] || 'bg-flat-gray-400'
}

// 장소 정보 가져오기
const getPlace = (placeId: string | null): Place | undefined => {
  if (!placeId) return undefined
  return placesData.value?.places.find(p => p.id === placeId)
}

// 시간 편집 시작
const openTimeEdit = (item: ScheduleItem) => {
  editingItem.value = item
  isTimeEditSheetOpen.value = true
}

// 시간 편집 닫기
const closeTimeEdit = () => {
  isTimeEditSheetOpen.value = false
  editingItem.value = null
}

// 일정 추가 시작
const openAddSheet = (afterItemId?: string | null) => {
  insertAfterItemId.value = afterItemId || null
  isAddSheetOpen.value = true
}

// 일정 추가 닫기
const closeAddSheet = () => {
  isAddSheetOpen.value = false
  insertAfterItemId.value = null
}

// 시간 저장
const handleTimeSave = async (startTime: string, endTime: string) => {
  if (!editingItem.value || !currentDaySchedule.value) {
    return
  }

  isSaving.value = true
  try {
    const hasStartTimeChanged = editingItem.value.startTime !== startTime
    const hasEndTimeChanged = editingItem.value.endTime !== endTime

    if (!hasStartTimeChanged && !hasEndTimeChanged) {
      closeTimeEdit()
      return
    }

    await tripStore.updateItineraryItem(
      currentDaySchedule.value.dayNumber,
      editingItem.value.id,
      hasStartTimeChanged ? startTime : undefined,
      hasEndTimeChanged ? endTime : undefined
    )

    // 데이터 새로고침
    await refresh()

    toast.success('시간이 업데이트되었습니다')
    closeTimeEdit()
  } catch (error: any) {
    console.error('Failed to update time:', error)
    toast.error(error.message || '시간 업데이트에 실패했습니다')
  } finally {
    isSaving.value = false
  }
}

// 일정 추가 저장
const handleAddItem = async (newItem: Omit<ScheduleItem, 'id' | 'status'>) => {
  if (!currentDaySchedule.value) {
    return
  }

  isAdding.value = true
  try {
    await tripStore.addScheduleItem(
      currentDaySchedule.value.dayNumber,
      newItem,
      insertAfterItemId.value
    )

    // 데이터 새로고침
    await refresh()

    toast.success('일정이 추가되었습니다')
    closeAddSheet()
  } catch (error: any) {
    console.error('Failed to add schedule item:', error)
    toast.error(error.message || '일정 추가에 실패했습니다')
  } finally {
    isAdding.value = false
  }
}

</script>

<template>
  <div class="min-h-screen bg-flat-gray-50 dark:bg-flat-gray-900">
    <!-- 헤더 -->
    <header class="nav-bar pt-safe-top">
      <div class="max-w-lg mx-auto">
        <div class="px-4 pt-4 pb-2">
          <h1 class="text-title-large dark:text-white">일정</h1>
        </div>

        <!-- 세그먼트 컨트롤 스타일 Day 선택 -->
        <div class="px-4 pb-4">
          <div class="segment-control overflow-x-auto no-scrollbar">
            <button
              v-for="schedule in itinerary?.schedules"
              :key="schedule.id"
              :data-day="schedule.dayNumber"
              class="segment-item shrink-0"
              :class="{ active: selectedDay === schedule.dayNumber }"
              @click="selectedDay = schedule.dayNumber"
            >
              Day {{ schedule.dayNumber }}
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- 메인 콘텐츠 (스와이프 영역) -->
    <div ref="contentRef" class="px-4 py-6 max-w-lg mx-auto">
      <!-- 로딩 상태 -->
      <template v-if="pending">
        <SkeletonCard :show-image="false" :lines="2" />
        <div class="mt-4">
          <SkeletonCard :show-image="false" :lines="1" />
        </div>
        <div class="mt-4 space-y-4">
          <SkeletonCard v-for="i in 4" :key="i" :show-image="false" :lines="3" />
        </div>
      </template>

      <!-- 에러 상태 -->
      <ErrorState
        v-else-if="error"
        message="일정을 불러올 수 없습니다"
        @retry="refresh"
      />

      <!-- 일정 상세 -->
      <template v-else-if="currentDaySchedule">
        <!-- 일자 정보 카드 -->
        <div class="card-apple p-4 mb-6">
          <h2 class="text-headline dark:text-white">{{ currentDaySchedule.title }}</h2>
          <p class="text-footnote text-flat-gray-500 mt-1">
            {{ currentDaySchedule.date }} ({{ currentDaySchedule.dayOfWeek }})
          </p>
          <div class="flex items-center gap-2 mt-2">
            <svg class="w-4 h-4 text-flat-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            <span class="text-footnote text-flat-gray-500">{{ currentDaySchedule.cities.join(' → ') }}</span>
          </div>
        </div>

        <!-- 식사 정보 -->
        <div class="card-apple overflow-hidden mb-6">
          <div class="px-4 py-3 border-b border-flat-gray-200 dark:border-flat-gray-700">
            <h3 class="text-footnote uppercase text-flat-gray-500">오늘의 식사</h3>
          </div>
          <div class="grid grid-cols-3 divide-x divide-flat-gray-200 dark:divide-flat-gray-700">
            <div class="px-3 py-3 text-center">
              <p class="text-caption-1 text-flat-gray-500">조식</p>
              <p class="text-subhead dark:text-white mt-0.5">{{ currentDaySchedule.meals.breakfast.type }}</p>
            </div>
            <div class="px-3 py-3 text-center">
              <p class="text-caption-1 text-flat-gray-500">중식</p>
              <p class="text-subhead dark:text-white mt-0.5">{{ currentDaySchedule.meals.lunch.type }}</p>
            </div>
            <div class="px-3 py-3 text-center">
              <p class="text-caption-1 text-flat-gray-500">석식</p>
              <p class="text-subhead dark:text-white mt-0.5">{{ currentDaySchedule.meals.dinner.type }}</p>
            </div>
          </div>
        </div>

        <!-- 일정 리스트 -->
        <div class="card-apple overflow-hidden">
          <template v-for="(item, index) in currentDaySchedule.items" :key="item.id">
            <!-- 일정 아이템 -->
            <div
              class="px-4 py-4 border-b border-flat-gray-200 dark:border-flat-gray-700"
            >
            <div class="flex gap-4">
              <!-- 시간 (클릭 가능) -->
              <button
                @click="openTimeEdit(item)"
                class="w-14 shrink-0 text-left touch-feedback"
              >
                <p class="text-subhead text-flat-gray-500">{{ item.startTime }}</p>
                <p class="text-caption-1 text-flat-gray-400">{{ item.endTime }}</p>
              </button>

              <!-- 내용 -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start gap-2">
                  <h3 class="text-body font-medium dark:text-white flex-1">{{ item.title }}</h3>
                  <!-- 타입 도트 -->
                  <span
                    class="w-2 h-2 rounded-full shrink-0 mt-2"
                    :class="getTypeDotColor(item.type)"
                  ></span>
                </div>

                <p v-if="item.location" class="text-footnote text-flat-gray-500 mt-1 flex items-center gap-1">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                  {{ item.location }}
                </p>

                <p v-if="item.notes" class="text-footnote text-flat-gray-500 mt-1">
                  {{ item.notes }}
                </p>

                <!-- 연결된 장소 정보 -->
                <NuxtLink
                  v-if="item.placeId && getPlace(item.placeId)"
                  :to="`/guide/${item.placeId}`"
                  class="inline-flex items-center gap-1 mt-2 text-flat-blue dark:text-primary-400 text-footnote font-medium touch-feedback"
                >
                  상세 정보
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </NuxtLink>
              </div>
            </div>
            </div>

            <!-- 일정 사이 삽입 버튼 -->
            <button
              @click="openAddSheet(item.id)"
              class="w-full px-4 py-2 flex items-center justify-center gap-2 text-flat-gray-400 hover:text-flat-blue dark:hover:text-flat-blue-dark transition-colors touch-feedback border-b border-flat-gray-200 dark:border-flat-gray-700"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span class="text-caption-1">일정 추가</span>
            </button>
          </template>

          <!-- 맨 끝 추가 버튼 -->
          <button
            @click="openAddSheet(null)"
            class="w-full px-4 py-3 flex items-center justify-center gap-2 text-flat-blue dark:text-flat-blue-dark font-medium hover:bg-flat-gray-100 dark:hover:bg-flat-gray-800 transition-colors touch-feedback"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span class="text-subhead">일정 추가</span>
          </button>
        </div>

        <!-- 스와이프 힌트 -->
        <p class="text-center text-caption-1 text-flat-gray-400 mt-6">
          좌우로 스와이프하여 일자 변경
        </p>
      </template>
    </div>

    <!-- 시간 편집 시트 -->
    <TimeEditSheet
      :item="editingItem"
      :is-open="isTimeEditSheetOpen"
      @close="closeTimeEdit"
      @save="handleTimeSave"
    />

    <!-- 일정 추가 시트 -->
    <ScheduleItemAddSheet
      :is-open="isAddSheetOpen"
      :insert-after-item-id="insertAfterItemId"
      @close="closeAddSheet"
      @save="handleAddItem"
    />
  </div>
</template>
