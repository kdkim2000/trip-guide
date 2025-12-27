<script setup lang="ts">
const route = useRoute()

const navItems = [
  { path: '/', icon: 'home', label: '홈' },
  { path: '/schedule', icon: 'calendar', label: '일정' },
  { path: '/guide', icon: 'map', label: '가이드' },
  { path: '/settings', icon: 'settings', label: '설정' },
]
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <!-- 메인 컨텐츠 -->
    <main class="flex-1 pb-20">
      <slot />
    </main>

    <!-- 하단 네비게이션 -->
    <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom">
      <div class="flex justify-around items-center h-16 max-w-lg mx-auto">
        <NuxtLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="flex flex-col items-center justify-center w-16 h-full transition-colors"
          :class="route.path === item.path ? 'text-primary-500' : 'text-gray-400'"
        >
          <component :is="'Icon' + item.icon.charAt(0).toUpperCase() + item.icon.slice(1)" class="w-6 h-6" />
          <span class="text-xs mt-1">{{ item.label }}</span>
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>
