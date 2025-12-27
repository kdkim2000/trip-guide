<script setup lang="ts">
interface Props {
  message?: string
  icon?: string
}

withDefaults(defineProps<Props>(), {
  message: '데이터를 불러올 수 없습니다',
  icon: '😢'
})

defineEmits<{
  retry: []
}>()
</script>

<template>
  <div class="card bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-center py-8">
    <div class="text-4xl mb-3">{{ icon }}</div>
    <p class="text-red-600 dark:text-red-400 mb-4">
      {{ message }}
    </p>
    <button @click="$emit('retry')" class="btn btn-primary">
      다시 시도
    </button>
  </div>
</template>
