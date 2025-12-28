<script setup lang="ts">
import type { TripUploadPayload } from '~/types'

const props = defineProps<{
  data: TripUploadPayload | null
  isUploading: boolean
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const getDaysCount = computed(() => {
  if (!props.data?.itinerary?.schedules) return 0
  return props.data.itinerary.schedules.length
})

const getPlacesCount = computed(() => {
  if (!props.data?.places?.places) return 0
  return props.data.places.places.length
})

const getHighlightsCount = computed(() => {
  if (!props.data?.highlights?.tripHighlights) return 0
  return props.data.highlights.tripHighlights.length
})
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      @click.self="!isUploading && emit('cancel')"
    >
      <div
        class="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
      >
        <!-- 헤더 -->
        <div class="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            여행 데이터 미리보기
          </h2>
        </div>

        <!-- 내용 -->
        <div class="p-4 space-y-4">
          <template v-if="data">
            <!-- 여행 정보 -->
            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <div
                  class="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center"
                >
                  <svg
                    class="w-6 h-6 text-primary-600 dark:text-primary-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M6.115 5.19l.319 1.913A6 6 0 008.11 10.36L9.75 12l-.387.775c-.217.433-.132.956.21 1.298l1.348 1.348c.21.21.329.497.329.795v1.089c0 .426.24.815.622 1.006l.153.076c.433.217.956.132 1.298-.21l.723-.723a8.7 8.7 0 002.288-4.042 1.087 1.087 0 00-.358-1.099l-1.33-1.108c-.251-.21-.582-.299-.905-.245l-1.17.195a1.125 1.125 0 01-.98-.314l-.295-.295a1.125 1.125 0 010-1.591l.13-.132a1.125 1.125 0 011.3-.21l.603.302a.809.809 0 001.086-1.086L14.25 7.5l1.256-.837a4.5 4.5 0 001.528-1.732l.146-.292M6.115 5.19A9 9 0 1017.18 4.64M6.115 5.19A8.965 8.965 0 0112 3c1.929 0 3.716.607 5.18 1.64"
                    />
                  </svg>
                </div>
                <div>
                  <p class="font-semibold text-gray-900 dark:text-white">
                    {{ data.tripMeta.title }}
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ data.tripMeta.subtitle }}
                  </p>
                </div>
              </div>

              <!-- 상세 정보 -->
              <div
                class="grid grid-cols-2 gap-3 text-sm"
              >
                <div
                  class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <p class="text-gray-500 dark:text-gray-400">기간</p>
                  <p class="font-medium text-gray-900 dark:text-white">
                    {{ data.tripMeta.startDate }} ~ {{ data.tripMeta.endDate }}
                  </p>
                </div>
                <div
                  class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <p class="text-gray-500 dark:text-gray-400">일정</p>
                  <p class="font-medium text-gray-900 dark:text-white">
                    {{ getDaysCount }}일
                  </p>
                </div>
                <div
                  class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <p class="text-gray-500 dark:text-gray-400">장소</p>
                  <p class="font-medium text-gray-900 dark:text-white">
                    {{ getPlacesCount }}곳
                  </p>
                </div>
                <div
                  class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <p class="text-gray-500 dark:text-gray-400">하이라이트</p>
                  <p class="font-medium text-gray-900 dark:text-white">
                    {{ getHighlightsCount }}개
                  </p>
                </div>
              </div>
            </div>

            <!-- 경고 메시지 -->
            <div
              class="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
            >
              <div class="flex gap-2">
                <svg
                  class="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                  />
                </svg>
                <p class="text-sm text-yellow-800 dark:text-yellow-200">
                  기존 동일 ID 데이터가 있으면 덮어씌워집니다.
                </p>
              </div>
            </div>
          </template>
        </div>

        <!-- 버튼 -->
        <div
          class="flex gap-3 p-4 border-t border-gray-200 dark:border-gray-700"
        >
          <button
            @click="emit('cancel')"
            :disabled="isUploading"
            class="flex-1 py-2.5 px-4 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            취소
          </button>
          <button
            @click="emit('confirm')"
            :disabled="isUploading"
            class="flex-1 py-2.5 px-4 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <svg
              v-if="isUploading"
              class="w-4 h-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {{ isUploading ? '업로드 중...' : '업로드 확인' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
