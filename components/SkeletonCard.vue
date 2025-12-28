<script setup lang="ts">
// 스켈레톤 카드 - 로딩 중 표시
defineProps<{
  showImage?: boolean
  lines?: number
}>()
</script>

<template>
  <div class="card-apple p-4">
    <!-- 이미지 스켈레톤 -->
    <div v-if="showImage" class="animate-skeleton aspect-video w-full mb-4 rounded-apple-md bg-apple-gray-200 dark:bg-apple-gray-700" />

    <!-- 텍스트 라인 스켈레톤 -->
    <div class="space-y-3">
      <div class="animate-skeleton h-5 w-3/4 rounded bg-apple-gray-200 dark:bg-apple-gray-700" />
      <div
        v-for="i in (lines || 2)"
        :key="i"
        class="animate-skeleton h-4 rounded bg-apple-gray-200 dark:bg-apple-gray-700"
        :class="i === (lines || 2) ? 'w-1/2' : 'w-full'"
      />
    </div>
  </div>
</template>
