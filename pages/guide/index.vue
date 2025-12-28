<script setup lang="ts">
import type { Place } from '~/types'

// Composable을 통한 데이터 로드 (pending, error 상태 추적)
const { data: placesData, pending, error, refresh } = await usePlaces()

// 검색어
const searchQuery = ref('')

// 선택된 카테고리
const selectedCategory = ref<string | null>(null)

// 카테고리 목록
const categories = computed(() => {
  if (!placesData.value) return []
  const cats = new Set(placesData.value.places.map(p => p.category))
  return Array.from(cats)
})

// 카테고리 한글명
const categoryNames: Record<string, string> = {
  cathedral: '성당',
  church: '교회',
  sanctuary: '성지',
  monastery: '수도원',
  palace: '궁전',
  garden: '정원',
  museum: '미술관/박물관',
  square: '광장',
  tower: '탑',
  bridge: '다리',
  street: '거리',
  park: '공원',
  building: '건물',
  arena: '경기장',
  hotel: '호텔',
  district: '지구',
  ruins: '유적',
}

// 필터링된 장소 목록
const filteredPlaces = computed(() => {
  if (!placesData.value) return []

  let places = placesData.value.places

  if (selectedCategory.value) {
    places = places.filter(p => p.category === selectedCategory.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    places = places.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.city.toLowerCase().includes(query) ||
      p.description.summary.toLowerCase().includes(query)
    )
  }

  return places
})

// 도시별 그룹화
const placesByCity = computed(() => {
  const grouped: Record<string, Place[]> = {}
  filteredPlaces.value.forEach(place => {
    if (!grouped[place.city]) {
      grouped[place.city] = []
    }
    grouped[place.city].push(place)
  })
  return grouped
})
</script>

<template>
  <div class="min-h-screen bg-flat-gray-50 dark:bg-flat-gray-900">
    <!-- 헤더 -->
    <header class="nav-bar pt-safe-top">
      <div class="max-w-lg mx-auto">
        <div class="px-4 pt-4 pb-2">
          <h1 class="text-title-large dark:text-white">가이드</h1>
        </div>

        <!-- 검색바 -->
        <div class="px-4 pb-3">
          <div class="search-bar">
            <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="검색"
              class="search-input"
            />
          </div>
        </div>

        <!-- 카테고리 필터 칩 -->
        <div class="flex gap-2 pb-4 overflow-x-auto no-scrollbar -mx-4 px-4">
          <button
            class="chip shrink-0"
            :class="{ active: !selectedCategory }"
            @click="selectedCategory = null"
          >
            전체
          </button>
          <button
            v-for="cat in categories"
            :key="cat"
            class="chip shrink-0"
            :class="{ active: selectedCategory === cat }"
            @click="selectedCategory = cat"
          >
            {{ categoryNames[cat] || cat }}
          </button>
        </div>
      </div>
    </header>

    <!-- 장소 목록 -->
    <div class="px-4 py-6 max-w-lg mx-auto">
      <!-- 로딩 상태 -->
      <template v-if="pending">
        <div class="h-5 w-20 bg-flat-gray-200 rounded animate-skeleton mb-4" />
        <SkeletonList :count="6" :show-thumbnail="true" />
      </template>

      <!-- 에러 상태 -->
      <ErrorState
        v-else-if="error"
        message="여행지 정보를 불러올 수 없습니다"
        @retry="refresh"
      />

      <!-- 콘텐츠 -->
      <template v-else>
        <p class="text-footnote text-flat-gray-500 mb-4">총 {{ filteredPlaces.length }}곳</p>

        <div v-for="(places, city) in placesByCity" :key="city" class="mb-8">
          <h2 class="text-footnote uppercase text-flat-gray-500 px-1 mb-3">{{ city }}</h2>

          <div class="card-apple overflow-hidden divide-y divide-flat-gray-200 dark:divide-flat-gray-700">
            <NuxtLink
              v-for="place in places"
              :key="place.id"
              :to="`/guide/${place.id}`"
              class="flex gap-3 p-3 touch-feedback"
            >
              <!-- 썸네일 이미지 -->
              <div v-if="place.images && place.images.length > 0" class="shrink-0 w-20 h-20 rounded-flat-md overflow-hidden bg-flat-gray-100">
                <NuxtImg
                  :src="place.images[0]"
                  :alt="place.name"
                  width="80"
                  height="80"
                  loading="lazy"
                  class="w-full h-full object-cover"
                  placeholder
                />
              </div>
              <div v-else class="shrink-0 w-20 h-20 bg-flat-gray-200 dark:bg-flat-gray-700 rounded-flat-md flex items-center justify-center">
                <svg class="w-8 h-8 text-flat-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div class="flex-1 min-w-0 py-0.5">
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0 flex-1">
                    <h3 class="text-body font-medium dark:text-white truncate">{{ place.name }}</h3>
                    <p class="text-footnote text-flat-gray-500 truncate">{{ place.nameLocal }}</p>
                  </div>
                  <svg class="w-5 h-5 text-flat-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
                <p class="text-footnote text-flat-gray-500 mt-1 line-clamp-2">
                  {{ place.description.summary }}
                </p>
              </div>
            </NuxtLink>
          </div>
        </div>

        <div v-if="filteredPlaces.length === 0" class="empty-state">
          <svg class="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p class="empty-state-title">검색 결과 없음</p>
          <p class="empty-state-description">다른 검색어로 시도해보세요</p>
        </div>
      </template>
    </div>
  </div>
</template>
