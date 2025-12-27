<script setup lang="ts">
import type { Place } from '~/types'

// Composable을 통한 데이터 로드
const { data: placesData } = await usePlaces()

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
  <div class="min-h-screen">
    <!-- 헤더 -->
    <header class="bg-white border-b border-gray-200 px-4 pt-12 pb-4 safe-top sticky top-0 z-10">
      <h1 class="text-xl font-bold mb-4">여행지 가이드</h1>

      <!-- 검색 -->
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="여행지 검색..."
          class="w-full px-4 py-2 pl-10 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <!-- 카테고리 필터 -->
      <div class="flex gap-2 mt-3 overflow-x-auto no-scrollbar -mx-4 px-4">
        <button
          class="flex-shrink-0 px-3 py-1 rounded-full text-sm transition-colors"
          :class="!selectedCategory ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'"
          @click="selectedCategory = null"
        >
          전체
        </button>
        <button
          v-for="cat in categories"
          :key="cat"
          class="flex-shrink-0 px-3 py-1 rounded-full text-sm transition-colors"
          :class="selectedCategory === cat ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'"
          @click="selectedCategory = cat"
        >
          {{ categoryNames[cat] || cat }}
        </button>
      </div>
    </header>

    <!-- 장소 목록 -->
    <div class="px-4 py-6 max-w-lg mx-auto">
      <p class="text-sm text-gray-500 mb-4">총 {{ filteredPlaces.length }}곳</p>

      <div v-for="(places, city) in placesByCity" :key="city" class="mb-6">
        <h2 class="text-lg font-semibold mb-3">{{ city }}</h2>

        <div class="space-y-3">
          <NuxtLink
            v-for="place in places"
            :key="place.id"
            :to="`/guide/${place.id}`"
            class="card block"
          >
            <div class="flex gap-3">
              <!-- 썸네일 이미지 -->
              <div v-if="place.images && place.images.length > 0" class="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
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
              <div v-else class="flex-shrink-0 w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0">
                    <h3 class="font-semibold truncate">{{ place.name }}</h3>
                    <p class="text-sm text-gray-500 truncate">{{ place.nameLocal }}</p>
                  </div>
                  <span class="flex-shrink-0 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {{ categoryNames[place.category] || place.category }}
                  </span>
                </div>
                <p class="text-sm text-gray-600 mt-1 line-clamp-2">
                  {{ place.description.summary }}
                </p>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>

      <div v-if="filteredPlaces.length === 0" class="text-center py-12 text-gray-500">
        검색 결과가 없습니다
      </div>
    </div>
  </div>
</template>
