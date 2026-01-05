<script setup lang="ts">
import type { ScheduleItem } from '~/types'
import { isValidTime, timeToMinutes } from '~/composables/useTimeEditor'

const props = defineProps<{
  isOpen: boolean
  insertAfterItemId?: string | null
  defaultStartTime?: string
  defaultEndTime?: string
}>()

const emit = defineEmits<{
  close: []
  save: [item: Omit<ScheduleItem, 'id' | 'status'>]
}>()

// 일정 타입 옵션
const scheduleTypes = [
  { value: 'meeting', label: '미팅' },
  { value: 'transport', label: '이동' },
  { value: 'attraction', label: '관광지' },
  { value: 'meal', label: '식사' },
  { value: 'free', label: '자유시간' },
  { value: 'transfer', label: '이동/전송' },
  { value: 'activity', label: '활동' },
  { value: 'arrival', label: '도착' },
] as const

// 로컬 상태
const title = ref('')
const startTime = ref(props.defaultStartTime || '09:00')
const endTime = ref(props.defaultEndTime || '10:00')
const type = ref<ScheduleItem['type']>('activity')
const location = ref('')
const notes = ref('')
const placeId = ref<string | null>(null)
const transportType = ref<'flight' | 'bus' | 'train' | undefined>(undefined)

const errors = ref<{
  title?: string
  startTime?: string
  endTime?: string
  type?: string
}>({})

// 시트가 열릴 때마다 상태 초기화
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    title.value = ''
    startTime.value = props.defaultStartTime || '09:00'
    endTime.value = props.defaultEndTime || '10:00'
    type.value = 'activity'
    location.value = ''
    notes.value = ''
    placeId.value = null
    transportType.value = undefined
    errors.value = {}
  }
})

// 타입이 transport일 때 transportType 필수
watch(type, (newType) => {
  if (newType !== 'transport') {
    transportType.value = undefined
  }
})

// 입력 검증
const validate = (): boolean => {
  errors.value = {}

  // 제목 검증
  if (!title.value.trim()) {
    errors.value.title = '제목을 입력해주세요'
    return false
  }

  // 시작 시간 검증
  if (!startTime.value) {
    errors.value.startTime = '시작 시간을 입력해주세요'
    return false
  }

  if (!isValidTime(startTime.value)) {
    errors.value.startTime = '올바른 시간 형식이 아닙니다 (HH:mm)'
    return false
  }

  // 종료 시간 검증
  if (!endTime.value) {
    errors.value.endTime = '종료 시간을 입력해주세요'
    return false
  }

  if (!isValidTime(endTime.value)) {
    errors.value.endTime = '올바른 시간 형식이 아닙니다 (HH:mm)'
    return false
  }

  const startMinutes = timeToMinutes(startTime.value)
  const endMinutes = timeToMinutes(endTime.value)

  if (endMinutes <= startMinutes) {
    errors.value.endTime = '종료 시간은 시작 시간보다 이후여야 합니다'
    return false
  }

  // 타입이 transport일 때 transportType 필수
  if (type.value === 'transport' && !transportType.value) {
    errors.value.type = '이동 수단을 선택해주세요'
    return false
  }

  return true
}

// 저장
const handleSave = () => {
  if (validate()) {
    const newItem: Omit<ScheduleItem, 'id' | 'status'> = {
      startTime: startTime.value,
      endTime: endTime.value,
      title: title.value.trim(),
      type: type.value,
      placeId: placeId.value,
      location: location.value.trim() || undefined,
      notes: notes.value.trim() || null,
      ...(type.value === 'transport' && transportType.value
        ? { transportType: transportType.value }
        : {}),
    }

    emit('save', newItem)
  }
}

// 취소
const handleCancel = () => {
  emit('close')
}

// 외부 클릭 시 닫기
const handleBackdropClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (target.classList.contains('sheet-backdrop')) {
    handleCancel()
  }
}

// ESC 키로 닫기
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.isOpen) {
    handleCancel()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div
        v-if="isOpen"
        class="sheet-backdrop fixed inset-0 z-50 flex items-end justify-center bg-black/40"
        @click="handleBackdropClick"
      >
        <div
          class="sheet-content w-full max-w-lg bg-flat-gray-50 dark:bg-flat-gray-900 rounded-t-[20px] overflow-hidden max-h-[90vh] flex flex-col"
          @click.stop
        >
          <!-- 핸들 -->
          <div class="flex justify-center pt-2 pb-1">
            <div class="w-9 h-1 rounded-full bg-flat-gray-300 dark:bg-flat-gray-600"></div>
          </div>

          <!-- 헤더 -->
          <div class="px-4 py-3 flex items-center justify-between border-b border-flat-gray-200 dark:border-flat-gray-700 shrink-0">
            <h2 class="text-headline dark:text-white">일정 추가</h2>
            <button
              @click="handleCancel"
              class="w-8 h-8 rounded-full bg-flat-gray-200 dark:bg-flat-gray-700 flex items-center justify-center touch-feedback"
            >
              <svg class="w-4 h-4 text-flat-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- 내용 (스크롤 가능) -->
          <div class="px-4 py-6 space-y-6 overflow-y-auto flex-1">
            <!-- 제목 -->
            <div>
              <label class="block text-subhead font-medium dark:text-white mb-2">
                제목 <span class="text-flat-red">*</span>
              </label>
              <input
                v-model="title"
                type="text"
                class="w-full px-4 py-3 rounded-lg bg-white dark:bg-flat-gray-800 border border-flat-gray-200 dark:border-flat-gray-700 text-body dark:text-white focus:outline-none focus:ring-2 focus:ring-flat-blue focus:border-transparent"
                :class="{ 'border-flat-red dark:border-flat-red': errors.title }"
                placeholder="일정 제목을 입력하세요"
              />
              <p v-if="errors.title" class="mt-1 text-caption-1 text-flat-red">
                {{ errors.title }}
              </p>
            </div>

            <!-- 시작 시간 -->
            <div>
              <label class="block text-subhead font-medium dark:text-white mb-2">
                시작 시간 <span class="text-flat-red">*</span>
              </label>
              <input
                v-model="startTime"
                type="time"
                class="w-full px-4 py-3 rounded-lg bg-white dark:bg-flat-gray-800 border border-flat-gray-200 dark:border-flat-gray-700 text-body dark:text-white focus:outline-none focus:ring-2 focus:ring-flat-blue focus:border-transparent"
                :class="{ 'border-flat-red dark:border-flat-red': errors.startTime }"
              />
              <p v-if="errors.startTime" class="mt-1 text-caption-1 text-flat-red">
                {{ errors.startTime }}
              </p>
            </div>

            <!-- 종료 시간 -->
            <div>
              <label class="block text-subhead font-medium dark:text-white mb-2">
                종료 시간 <span class="text-flat-red">*</span>
              </label>
              <input
                v-model="endTime"
                type="time"
                class="w-full px-4 py-3 rounded-lg bg-white dark:bg-flat-gray-800 border border-flat-gray-200 dark:border-flat-gray-700 text-body dark:text-white focus:outline-none focus:ring-2 focus:ring-flat-blue focus:border-transparent"
                :class="{ 'border-flat-red dark:border-flat-red': errors.endTime }"
              />
              <p v-if="errors.endTime" class="mt-1 text-caption-1 text-flat-red">
                {{ errors.endTime }}
              </p>
            </div>

            <!-- 타입 -->
            <div>
              <label class="block text-subhead font-medium dark:text-white mb-2">
                타입 <span class="text-flat-red">*</span>
              </label>
              <select
                v-model="type"
                class="w-full px-4 py-3 rounded-lg bg-white dark:bg-flat-gray-800 border border-flat-gray-200 dark:border-flat-gray-700 text-body dark:text-white focus:outline-none focus:ring-2 focus:ring-flat-blue focus:border-transparent"
                :class="{ 'border-flat-red dark:border-flat-red': errors.type }"
              >
                <option v-for="option in scheduleTypes" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
              <p v-if="errors.type" class="mt-1 text-caption-1 text-flat-red">
                {{ errors.type }}
              </p>
            </div>

            <!-- 이동 수단 (transport 타입일 때만) -->
            <div v-if="type === 'transport'">
              <label class="block text-subhead font-medium dark:text-white mb-2">
                이동 수단 <span class="text-flat-red">*</span>
              </label>
              <select
                v-model="transportType"
                class="w-full px-4 py-3 rounded-lg bg-white dark:bg-flat-gray-800 border border-flat-gray-200 dark:border-flat-gray-700 text-body dark:text-white focus:outline-none focus:ring-2 focus:ring-flat-blue focus:border-transparent"
                :class="{ 'border-flat-red dark:border-flat-red': errors.type }"
              >
                <option :value="undefined">선택하세요</option>
                <option value="flight">항공편</option>
                <option value="bus">버스</option>
                <option value="train">기차</option>
              </select>
            </div>

            <!-- 위치 -->
            <div>
              <label class="block text-subhead font-medium dark:text-white mb-2">
                위치
              </label>
              <input
                v-model="location"
                type="text"
                class="w-full px-4 py-3 rounded-lg bg-white dark:bg-flat-gray-800 border border-flat-gray-200 dark:border-flat-gray-700 text-body dark:text-white focus:outline-none focus:ring-2 focus:ring-flat-blue focus:border-transparent"
                placeholder="위치를 입력하세요 (선택)"
              />
            </div>

            <!-- 메모 -->
            <div>
              <label class="block text-subhead font-medium dark:text-white mb-2">
                메모
              </label>
              <textarea
                v-model="notes"
                rows="3"
                class="w-full px-4 py-3 rounded-lg bg-white dark:bg-flat-gray-800 border border-flat-gray-200 dark:border-flat-gray-700 text-body dark:text-white focus:outline-none focus:ring-2 focus:ring-flat-blue focus:border-transparent resize-none"
                placeholder="메모를 입력하세요 (선택)"
              ></textarea>
            </div>
          </div>

          <!-- 버튼 -->
          <div class="px-4 pb-4 pt-2 flex gap-3 border-t border-flat-gray-200 dark:border-flat-gray-700 shrink-0">
            <button
              @click="handleCancel"
              class="flex-1 py-3 px-4 rounded-lg border border-flat-gray-300 dark:border-flat-gray-600 text-flat-gray-700 dark:text-flat-gray-300 font-medium hover:bg-flat-gray-100 dark:hover:bg-flat-gray-800 transition-colors touch-feedback"
            >
              취소
            </button>
            <button
              @click="handleSave"
              class="flex-1 py-3 px-4 rounded-lg bg-flat-blue dark:bg-flat-blue-dark text-white font-medium hover:bg-flat-blue-dark dark:hover:bg-flat-blue transition-colors touch-feedback"
            >
              추가
            </button>
          </div>

          <!-- 하단 안전 영역 -->
          <div class="h-safe-bottom bg-flat-gray-50 dark:bg-flat-gray-900 shrink-0" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.2s ease;
}

.sheet-enter-active .sheet-content,
.sheet-leave-active .sheet-content {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}

.sheet-enter-from .sheet-content,
.sheet-leave-to .sheet-content {
  transform: translateY(100%);
}

.h-safe-bottom {
  height: env(safe-area-inset-bottom, 0px);
}
</style>

