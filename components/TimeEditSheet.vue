<script setup lang="ts">
import type { ScheduleItem } from '~/types'
import { isValidTime, timeToMinutes } from '~/composables/useTimeEditor'

const props = defineProps<{
  item: ScheduleItem | null
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
  save: [startTime: string, endTime: string]
}>()

// 로컬 상태
const startTime = ref('')
const endTime = ref('')
const errors = ref<{ startTime?: string; endTime?: string }>({})

// 아이템이 변경되면 로컬 상태 업데이트
watch(() => props.item, (item) => {
  if (item) {
    startTime.value = item.startTime
    endTime.value = item.endTime
    errors.value = {}
  }
}, { immediate: true })

// 시트가 열릴 때마다 상태 초기화
watch(() => props.isOpen, (isOpen) => {
  if (isOpen && props.item) {
    startTime.value = props.item.startTime
    endTime.value = props.item.endTime
    errors.value = {}
  }
})

// 시간 입력 검증
const validateTimes = (): boolean => {
  errors.value = {}

  if (!startTime.value) {
    errors.value.startTime = '시작 시간을 입력해주세요'
    return false
  }

  if (!isValidTime(startTime.value)) {
    errors.value.startTime = '올바른 시간 형식이 아닙니다 (HH:mm)'
    return false
  }

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

  return true
}

// 저장
const handleSave = () => {
  if (validateTimes()) {
    emit('save', startTime.value, endTime.value)
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
          class="sheet-content w-full max-w-lg bg-flat-gray-50 dark:bg-flat-gray-900 rounded-t-[20px] overflow-hidden"
          @click.stop
        >
          <!-- 핸들 -->
          <div class="flex justify-center pt-2 pb-1">
            <div class="w-9 h-1 rounded-full bg-flat-gray-300 dark:bg-flat-gray-600"></div>
          </div>

          <!-- 헤더 -->
          <div class="px-4 py-3 flex items-center justify-between border-b border-flat-gray-200 dark:border-flat-gray-700">
            <h2 class="text-headline dark:text-white">시간 편집</h2>
            <button
              @click="handleCancel"
              class="w-8 h-8 rounded-full bg-flat-gray-200 dark:bg-flat-gray-700 flex items-center justify-center touch-feedback"
            >
              <svg class="w-4 h-4 text-flat-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- 내용 -->
          <div class="px-4 py-6 space-y-6">
            <div v-if="item" class="mb-4">
              <p class="text-body font-medium dark:text-white mb-1">{{ item.title }}</p>
              <p class="text-footnote text-flat-gray-500">일정 시간을 수정합니다</p>
            </div>

            <!-- 시작 시간 -->
            <div>
              <label class="block text-subhead font-medium dark:text-white mb-2">
                시작 시간
              </label>
              <input
                v-model="startTime"
                type="time"
                class="w-full px-4 py-3 rounded-lg bg-white dark:bg-flat-gray-800 border border-flat-gray-200 dark:border-flat-gray-700 text-body dark:text-white focus:outline-none focus:ring-2 focus:ring-flat-blue focus:border-transparent"
                :class="{ 'border-flat-red dark:border-flat-red': errors.startTime }"
                placeholder="HH:mm"
              />
              <p v-if="errors.startTime" class="mt-1 text-caption-1 text-flat-red">
                {{ errors.startTime }}
              </p>
            </div>

            <!-- 종료 시간 -->
            <div>
              <label class="block text-subhead font-medium dark:text-white mb-2">
                종료 시간
              </label>
              <input
                v-model="endTime"
                type="time"
                class="w-full px-4 py-3 rounded-lg bg-white dark:bg-flat-gray-800 border border-flat-gray-200 dark:border-flat-gray-700 text-body dark:text-white focus:outline-none focus:ring-2 focus:ring-flat-blue focus:border-transparent"
                :class="{ 'border-flat-red dark:border-flat-red': errors.endTime }"
                placeholder="HH:mm"
              />
              <p v-if="errors.endTime" class="mt-1 text-caption-1 text-flat-red">
                {{ errors.endTime }}
              </p>
              <p class="mt-2 text-caption-1 text-flat-gray-500">
                종료 시간을 변경하면 이후 일정이 자동으로 조정됩니다
              </p>
            </div>
          </div>

          <!-- 버튼 -->
          <div class="px-4 pb-4 pt-2 flex gap-3 border-t border-flat-gray-200 dark:border-flat-gray-700">
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
              저장
            </button>
          </div>

          <!-- 하단 안전 영역 -->
          <div class="h-safe-bottom bg-flat-gray-50 dark:bg-flat-gray-900" />
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

