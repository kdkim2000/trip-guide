<script setup lang="ts">
interface Props {
  message?: string
}

withDefaults(defineProps<Props>(), {
  message: '데이터를 불러올 수 없습니다'
})

defineEmits<{
  retry: []
}>()
</script>

<template>
  <div class="card-apple p-8 text-center">
    <div class="w-12 h-12 mx-auto mb-4 rounded-full bg-apple-red/10 flex items-center justify-center">
      <svg class="w-6 h-6 text-apple-red" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
      </svg>
    </div>
    <p class="text-body text-apple-gray-700 dark:text-apple-gray-300 mb-4">
      {{ message }}
    </p>
    <button @click="$emit('retry')" class="btn-primary">
      다시 시도
    </button>
  </div>
</template>
