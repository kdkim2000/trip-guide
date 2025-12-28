<script setup lang="ts">
// 목록용 스켈레톤
defineProps<{
  count?: number
  showThumbnail?: boolean
}>()
</script>

<template>
  <div class="space-y-3">
    <div
      v-for="i in (count || 3)"
      :key="i"
      class="card-apple p-3"
    >
      <div class="flex gap-3">
        <!-- 썸네일 -->
        <div
          v-if="showThumbnail"
          class="animate-skeleton w-20 h-20 rounded-apple-md shrink-0 bg-apple-gray-200 dark:bg-apple-gray-700"
        />

        <!-- 텍스트 -->
        <div class="flex-1 space-y-2 py-1">
          <div class="animate-skeleton h-5 w-3/4 rounded bg-apple-gray-200 dark:bg-apple-gray-700" />
          <div class="animate-skeleton h-4 w-1/2 rounded bg-apple-gray-200 dark:bg-apple-gray-700" />
          <div class="animate-skeleton h-4 w-full rounded bg-apple-gray-200 dark:bg-apple-gray-700" />
        </div>
      </div>
    </div>
  </div>
</template>
