<script setup lang="ts">
interface Props {
  isRefreshing?: boolean
  pullDistance?: number
  canRefresh?: boolean
}

withDefaults(defineProps<Props>(), {
  isRefreshing: false,
  pullDistance: 0,
  canRefresh: false
})
</script>

<template>
  <div
    class="pull-indicator"
    :class="{
      'pulling': !isRefreshing && pullDistance > 0,
      'refreshing': isRefreshing
    }"
    :style="{ transform: `translate(-50%, ${pullDistance}px)` }"
  >
    <svg
      v-if="isRefreshing"
      class="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
    <svg
      v-else
      class="w-6 h-6 transition-transform"
      :class="{ 'rotate-180': canRefresh }"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M19 14l-7 7m0 0l-7-7m7 7V3"
      />
    </svg>
  </div>
</template>
