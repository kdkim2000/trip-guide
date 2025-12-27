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
      class="card animate-pulse"
    >
      <div class="flex gap-3">
        <!-- 썸네일 -->
        <div v-if="showThumbnail" class="skeleton w-20 h-20 rounded-lg flex-shrink-0" />

        <!-- 텍스트 -->
        <div class="flex-1 space-y-2">
          <div class="skeleton h-5 w-3/4 rounded" />
          <div class="skeleton h-4 w-1/2 rounded" />
          <div class="skeleton h-4 w-full rounded" />
        </div>
      </div>
    </div>
  </div>
</template>
