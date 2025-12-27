<script setup lang="ts">
// 스켈레톤 카드 - 로딩 중 표시
defineProps<{
  showImage?: boolean
  lines?: number
}>()
</script>

<template>
  <div class="card animate-pulse">
    <!-- 이미지 스켈레톤 -->
    <div v-if="showImage" class="skeleton aspect-video w-full mb-4 rounded-lg" />

    <!-- 텍스트 라인 스켈레톤 -->
    <div class="space-y-3">
      <div class="skeleton h-5 w-3/4 rounded" />
      <div v-for="i in (lines || 2)" :key="i" class="skeleton h-4 rounded" :class="i === (lines || 2) ? 'w-1/2' : 'w-full'" />
    </div>
  </div>
</template>
