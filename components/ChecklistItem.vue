<script setup lang="ts">
import type { ChecklistItem } from '~/types'

const props = defineProps<{
  item: ChecklistItem
  checked: boolean
}>()

const emit = defineEmits<{
  toggle: [itemId: string, checked: boolean]
}>()

const handleToggle = () => {
  emit('toggle', props.item.id, !props.checked)
}
</script>

<template>
  <div
    @click="handleToggle"
    class="flex items-start gap-3 px-4 py-3 cursor-pointer touch-feedback"
  >
    <!-- Apple 스타일 체크박스 -->
    <div class="shrink-0 mt-0.5">
      <div
        class="w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center transition-all duration-200"
        :class="checked
          ? 'bg-apple-green border-apple-green'
          : 'border-apple-gray-300 dark:border-apple-gray-600'"
      >
        <svg
          v-if="checked"
          class="w-3 h-3 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="3"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m4.5 12.75 6 6 9-13.5"
          />
        </svg>
      </div>
    </div>

    <!-- 콘텐츠 -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2">
        <span
          class="text-body transition-colors"
          :class="checked
            ? 'text-apple-gray-400 line-through'
            : 'dark:text-white'"
        >
          {{ item.name }}
        </span>
        <span
          v-if="item.essential"
          class="badge badge-destructive"
        >
          필수
        </span>
      </div>
      <p
        v-if="item.description"
        class="text-footnote mt-0.5 transition-colors"
        :class="checked
          ? 'text-apple-gray-400'
          : 'text-apple-gray-500'"
      >
        {{ item.description }}
      </p>
    </div>
  </div>
</template>
