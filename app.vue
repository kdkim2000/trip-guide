<script setup lang="ts">
// 온라인/오프라인 상태 감지
const isOnline = useOnline()
const toast = useToast()

// 여행 스토어 초기화
const tripStore = useTripStore()
onMounted(() => {
  tripStore.loadTrips()
})

// 오프라인/온라인 알림
watch(isOnline, (online) => {
  if (!online) {
    toast.warning('오프라인 모드로 전환되었습니다')
  } else {
    toast.success('온라인 상태로 복귀했습니다')
  }
})
</script>

<template>
  <div>
    <!-- 오프라인 배너 -->
    <Transition name="slide-down">
      <div
        v-if="!isOnline"
        class="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white text-center py-2 text-sm font-medium safe-top"
      >
        오프라인 모드 - 저장된 데이터로 동작합니다
      </div>
    </Transition>

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <!-- 토스트 알림 컨테이너 -->
    <ToastContainer />
  </div>
</template>

<style>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>
