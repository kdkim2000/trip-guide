<script setup lang="ts">
const tripStore = useTripStore()
const toast = useToast()

// 모달 상태
const isOpen = ref(false)

// 여행 선택
const selectTrip = (tripId: string) => {
  tripStore.selectTrip(tripId)
  isOpen.value = false
  toast.success('여행이 변경되었습니다')
}

// 모달 외부 클릭 시 닫기
const closeOnOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (target.classList.contains('modal-backdrop')) {
    isOpen.value = false
  }
}

// 키보드 ESC로 닫기
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    isOpen.value = false
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
  <div class="trip-selector">
    <!-- 현재 여행 표시 버튼 -->
    <button
      @click="isOpen = true"
      class="w-full flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-primary-300 transition-colors"
    >
      <div v-if="tripStore.currentTrip" class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
          <NuxtImg
            :src="tripStore.currentTrip.thumbnail"
            :alt="tripStore.currentTrip.title"
            class="w-full h-full object-cover"
            width="40"
            height="40"
          />
        </div>
        <div class="text-left">
          <p class="font-semibold text-gray-900 text-sm">{{ tripStore.currentTrip.title }}</p>
          <p class="text-xs text-gray-500">{{ tripStore.currentTrip.subtitle }}</p>
        </div>
      </div>
      <div v-else class="flex items-center gap-2 text-gray-400">
        <span>여행을 선택하세요</span>
      </div>

      <!-- 화살표 아이콘 -->
      <svg
        class="w-5 h-5 text-gray-400 transition-transform"
        :class="{ 'rotate-180': isOpen }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- 모달 -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="isOpen"
          class="modal-backdrop fixed inset-0 z-50 flex items-end justify-center bg-black/50"
          @click="closeOnOutside"
        >
          <div
            class="modal-content w-full max-w-lg max-h-[70vh] bg-white rounded-t-2xl overflow-hidden"
            @click.stop
          >
            <!-- 헤더 -->
            <div class="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
              <h2 class="text-lg font-semibold">여행 선택</h2>
              <button
                @click="isOpen = false"
                class="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- 여행 목록 -->
            <div class="p-4 space-y-2 overflow-y-auto">
              <TripCard
                v-for="trip in tripStore.tripsWithStatus"
                :key="trip.id"
                :trip="trip"
                :is-selected="trip.id === tripStore.currentTripId"
                @select="selectTrip"
              />

              <!-- 빈 상태 -->
              <div
                v-if="tripStore.trips.length === 0"
                class="text-center py-8 text-gray-400"
              >
                <svg class="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>등록된 여행이 없습니다</p>
              </div>
            </div>

            <!-- 하단 안전 영역 -->
            <div class="h-safe-bottom bg-white" />
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: translateY(100%);
}

.h-safe-bottom {
  height: env(safe-area-inset-bottom, 0px);
}
</style>
