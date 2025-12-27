<script setup lang="ts">
const { toasts, remove } = useToast()

// 토스트 타입별 아이콘
const icons: Record<string, string> = {
  success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  error: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
  warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
}
</script>

<template>
  <ClientOnly>
    <Teleport to="body">
      <TransitionGroup
        name="toast"
        tag="div"
        class="fixed bottom-24 left-4 right-4 z-50 flex flex-col items-center gap-2 pointer-events-none"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast pointer-events-auto"
          :class="`toast-${toast.type}`"
          @click="remove(toast.id)"
        >
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="icons[toast.type]" />
          </svg>
          <span class="text-sm">{{ toast.message }}</span>
        </div>
      </TransitionGroup>
    </Teleport>
  </ClientOnly>
</template>

<style scoped>
.toast-enter-active {
  animation: toast 0.3s ease-out;
}

.toast-leave-active {
  animation: toast 0.2s ease-in reverse;
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
