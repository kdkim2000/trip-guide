<script setup lang="ts">
const route = useRoute()

const navItems = [
  { path: '/', icon: 'home', label: '홈' },
  { path: '/schedule', icon: 'calendar', label: '일정' },
  { path: '/guide', icon: 'map', label: '가이드' },
  { path: '/tips', icon: 'tips', label: '꿀팁' },
  { path: '/settings', icon: 'settings', label: '설정' },
]

// 현재 경로가 해당 네비게이션 아이템과 일치하는지 확인
const isActive = (path: string) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-flat-gray-50 dark:bg-flat-gray-900">
    <!-- 메인 컨텐츠 -->
    <main class="flex-1 pb-[65px]">
      <slot />
    </main>

    <!-- Apple 스타일 하단 탭바 -->
    <nav class="tab-bar">
      <div class="tab-bar-content">
        <NuxtLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="tab-item"
          :class="{ active: isActive(item.path) }"
        >
          <component
            :is="'Icon' + item.icon.charAt(0).toUpperCase() + item.icon.slice(1)"
            :filled="isActive(item.path)"
            class="tab-icon"
          />
          <span class="tab-label">{{ item.label }}</span>
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>
