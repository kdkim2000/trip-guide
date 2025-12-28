<script setup lang="ts">
import type { PrecautionCategory } from '~/types'

defineProps<{
  category: PrecautionCategory
}>()

const isExpanded = ref(true)

const getIconPath = (icon: string) => {
  const icons: Record<string, string> = {
    warning:
      'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z',
    hotel:
      'M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z',
    bus: 'M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12',
    water:
      'M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25',
    star: 'M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z',
    info: 'm11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z',
  }
  return icons[icon] || icons.info
}

const getIconColor = (icon: string) => {
  const colors: Record<string, string> = {
    warning: 'bg-apple-orange/10 text-apple-orange',
    hotel: 'bg-apple-purple/10 text-apple-purple',
    bus: 'bg-apple-blue/10 text-apple-blue',
    water: 'bg-apple-teal/10 text-apple-teal',
    star: 'bg-apple-yellow/10 text-apple-yellow',
    info: 'bg-apple-gray-200 dark:bg-apple-gray-700 text-apple-gray-500',
  }
  return colors[icon] || colors.info
}

const getImportanceDot = (importance?: 'high' | 'medium' | 'low') => {
  switch (importance) {
    case 'high':
      return 'bg-apple-red'
    case 'medium':
      return 'bg-apple-orange'
    case 'low':
      return 'bg-apple-blue'
    default:
      return 'bg-apple-gray-400'
  }
}
</script>

<template>
  <div class="card-apple overflow-hidden">
    <!-- 헤더 -->
    <button
      @click="isExpanded = !isExpanded"
      class="w-full flex items-center justify-between p-4 text-left touch-feedback"
    >
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-apple-md flex items-center justify-center"
          :class="getIconColor(category.icon)"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              :d="getIconPath(category.icon)"
            />
          </svg>
        </div>
        <span class="text-body font-medium dark:text-white">{{ category.title }}</span>
        <span class="badge badge-secondary">{{ category.items.length }}개</span>
      </div>
      <svg
        class="w-5 h-5 text-apple-gray-400 transition-transform duration-200"
        :class="{ 'rotate-180': isExpanded }"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="m19.5 8.25-7.5 7.5-7.5-7.5"
        />
      </svg>
    </button>

    <!-- 콘텐츠 -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      leave-active-class="transition-all duration-150 ease-in"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-[2000px]"
      leave-from-class="opacity-100 max-h-[2000px]"
      leave-to-class="opacity-0 max-h-0"
    >
      <div
        v-if="isExpanded"
        class="border-t border-apple-gray-200/50 dark:border-apple-gray-700/50"
      >
        <ul class="divide-y divide-apple-gray-200/50 dark:divide-apple-gray-700/50">
          <li
            v-for="item in category.items"
            :key="item.id"
            class="px-4 py-3"
          >
            <div class="flex items-start gap-3">
              <span
                v-if="item.importance"
                class="w-2 h-2 rounded-full shrink-0 mt-2"
                :class="getImportanceDot(item.importance)"
              ></span>
              <div class="flex-1 min-w-0">
                <p class="text-body font-medium dark:text-white">{{ item.title }}</p>
                <p class="text-footnote text-apple-gray-500 mt-1">{{ item.description }}</p>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>
