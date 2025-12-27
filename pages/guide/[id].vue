<script setup lang="ts">
import type { Place, TripHighlight, PhotoSpot } from '~/types'

const route = useRoute()
const placeId = route.params.id as string

// Composable을 통한 데이터 로드
const { data: placesData } = await usePlaces()
const { data: highlightsData } = await useHighlights()

// 현재 장소 정보
const place = computed<Place | undefined>(() => {
  return placesData.value?.places.find(p => p.id === placeId)
})

// 관련 하이라이트
const relatedHighlight = computed<TripHighlight | undefined>(() => {
  return highlightsData.value?.tripHighlights.find(h => h.placeId === placeId)
})

// 관련 사진 스팟
const relatedPhotoSpots = computed<PhotoSpot[]>(() => {
  return highlightsData.value?.photoSpots.filter(p => p.placeId === placeId) || []
})

// 뒤로가기
const goBack = () => {
  navigateTo('/guide')
}

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

// 탭 상태
const activeTab = ref<'info' | 'history' | 'tips'>('info')

// 이미지 갤러리 상태
const currentImageIndex = ref(0)
const galleryRef = ref<HTMLElement | null>(null)

// 다음 이미지
const nextImage = () => {
  if (!place.value?.images) return
  currentImageIndex.value = (currentImageIndex.value + 1) % place.value.images.length
}

// 이전 이미지
const prevImage = () => {
  if (!place.value?.images) return
  currentImageIndex.value = (currentImageIndex.value - 1 + place.value.images.length) % place.value.images.length
}

// 스와이프 제스처 지원
const { isSwiping, direction } = useSwipe(galleryRef, {
  onSwipeEnd() {
    if (!place.value?.images || place.value.images.length <= 1) return
    if (direction.value === 'left') {
      nextImage()
    } else if (direction.value === 'right') {
      prevImage()
    }
  },
})
</script>

<template>
  <div class="min-h-screen bg-white">
    <!-- 헤더 -->
    <header class="sticky top-0 z-10 bg-white border-b border-gray-200 safe-top">
      <div class="flex items-center gap-4 px-4 py-3">
        <button @click="goBack" class="p-2 -ml-2 rounded-full hover:bg-gray-100">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 class="text-lg font-semibold truncate">{{ place?.name }}</h1>
      </div>
    </header>

    <div v-if="place" class="max-w-lg mx-auto">
      <!-- 이미지 갤러리 (스와이프 지원) -->
      <div
        v-if="place.images && place.images.length > 0"
        ref="galleryRef"
        class="relative touch-pan-y"
      >
        <div class="aspect-video bg-gray-100 overflow-hidden">
          <NuxtImg
            :src="place.images[currentImageIndex]"
            :alt="`${place.name} - ${currentImageIndex + 1}`"
            width="640"
            height="360"
            class="w-full h-full object-cover transition-opacity duration-300"
            :class="{ 'opacity-80': isSwiping }"
            placeholder
          />
        </div>

        <!-- 이미지 네비게이션 (2개 이상일 때만) -->
        <template v-if="place.images.length > 1">
          <!-- 좌우 버튼 - 터치 타겟 44px 이상 -->
          <button
            @click="prevImage"
            class="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/50 text-white rounded-full flex items-center justify-center active:bg-black/70 transition-colors"
            aria-label="이전 이미지"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            @click="nextImage"
            class="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/50 text-white rounded-full flex items-center justify-center active:bg-black/70 transition-colors"
            aria-label="다음 이미지"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <!-- 이미지 인디케이터 - 터치 영역 확대 -->
          <div class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
            <button
              v-for="(_, index) in place.images"
              :key="index"
              @click="currentImageIndex = index"
              class="w-6 h-6 flex items-center justify-center"
              :aria-label="`이미지 ${index + 1}`"
            >
              <span
                class="w-2 h-2 rounded-full transition-all"
                :class="index === currentImageIndex ? 'bg-white scale-125' : 'bg-white/50'"
              />
            </button>
          </div>

          <!-- 스와이프 힌트 (첫 방문시에만 표시 가능) -->
          <div class="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/70 text-xs">
            좌우로 스와이프하여 이미지 넘기기
          </div>
        </template>
      </div>

      <!-- 이미지 없을 때 플레이스홀더 -->
      <div v-else class="aspect-video bg-gray-200 flex items-center justify-center">
        <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>

      <!-- 기본 정보 헤더 -->
      <div class="px-4 py-6 bg-gradient-to-b from-primary-50 to-white">
        <span class="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
          {{ categoryNames[place.category] || place.category }}
        </span>
        <h2 class="text-2xl font-bold mt-2">{{ place.name }}</h2>
        <p class="text-gray-500">{{ place.nameLocal }}</p>
        <p class="text-sm text-gray-600 mt-2">{{ place.city }}, {{ place.country }}</p>
      </div>

      <!-- 탭 네비게이션 -->
      <div class="flex border-b border-gray-200 px-4">
        <button
          class="px-4 py-3 text-sm font-medium border-b-2 transition-colors"
          :class="activeTab === 'info' ? 'border-primary-500 text-primary-500' : 'border-transparent text-gray-500'"
          @click="activeTab = 'info'"
        >
          기본정보
        </button>
        <button
          class="px-4 py-3 text-sm font-medium border-b-2 transition-colors"
          :class="activeTab === 'history' ? 'border-primary-500 text-primary-500' : 'border-transparent text-gray-500'"
          @click="activeTab = 'history'"
        >
          역사/소개
        </button>
        <button
          class="px-4 py-3 text-sm font-medium border-b-2 transition-colors"
          :class="activeTab === 'tips' ? 'border-primary-500 text-primary-500' : 'border-transparent text-gray-500'"
          @click="activeTab = 'tips'"
        >
          팁/사진
        </button>
      </div>

      <!-- 탭 콘텐츠 -->
      <div class="px-4 py-6">
        <!-- 기본 정보 탭 -->
        <div v-if="activeTab === 'info'" class="space-y-6">
          <div class="card">
            <h3 class="font-semibold mb-3">요약</h3>
            <p class="text-gray-600">{{ place.description.summary }}</p>
          </div>

          <div class="card">
            <h3 class="font-semibold mb-3">관람 정보</h3>
            <dl class="space-y-2 text-sm">
              <div class="flex justify-between">
                <dt class="text-gray-500">운영시간</dt>
                <dd>{{ place.basicInfo.openingHours }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-500">입장료</dt>
                <dd>{{ place.basicInfo.admission }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-500">소요시간</dt>
                <dd>{{ place.basicInfo.recommendedDuration }}</dd>
              </div>
            </dl>
          </div>

          <div class="card">
            <h3 class="font-semibold mb-3">주요 포인트</h3>
            <ul class="space-y-2">
              <li v-for="(highlight, index) in place.description.highlights" :key="index" class="flex gap-2">
                <span class="text-primary-500">•</span>
                <span class="text-gray-600">{{ highlight }}</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- 역사/소개 탭 -->
        <div v-if="activeTab === 'history'" class="space-y-6">
          <div class="card">
            <h3 class="font-semibold mb-3">역사 및 배경</h3>
            <p class="text-gray-600 leading-relaxed whitespace-pre-line">{{ place.description.history }}</p>
          </div>

          <div v-if="relatedHighlight" class="card bg-primary-50 border-primary-100">
            <span class="text-xs bg-primary-500 text-white px-2 py-0.5 rounded-full">
              Day {{ relatedHighlight.dayNumber }} 하이라이트
            </span>
            <h3 class="font-semibold mt-2">{{ relatedHighlight.title }}</h3>
            <p class="text-gray-600 mt-2">{{ relatedHighlight.description }}</p>
            <div class="flex flex-wrap gap-1 mt-3">
              <span v-for="tag in relatedHighlight.tags" :key="tag" class="text-xs bg-white text-primary-600 px-2 py-0.5 rounded-full">
                #{{ tag }}
              </span>
            </div>
          </div>
        </div>

        <!-- 팁/사진 탭 -->
        <div v-if="activeTab === 'tips'" class="space-y-6">
          <div class="card">
            <h3 class="font-semibold mb-3">관람 팁</h3>
            <ul class="space-y-2">
              <li v-for="(tip, index) in place.tips" :key="index" class="flex gap-2">
                <span class="text-amber-500">💡</span>
                <span class="text-gray-600">{{ tip }}</span>
              </li>
            </ul>
          </div>

          <div class="card">
            <h3 class="font-semibold mb-3">추천 사진 스팟</h3>
            <ul class="space-y-2">
              <li v-for="(spot, index) in place.photoSpots" :key="index" class="flex gap-2">
                <span class="text-pink-500">📸</span>
                <span class="text-gray-600">{{ spot }}</span>
              </li>
            </ul>
          </div>

          <div v-if="relatedPhotoSpots.length > 0" class="space-y-3">
            <h3 class="font-semibold">상세 촬영 가이드</h3>
            <div v-for="photoSpot in relatedPhotoSpots" :key="photoSpot.id" class="card">
              <h4 class="font-medium">{{ photoSpot.title }}</h4>
              <p class="text-sm text-gray-600 mt-1">{{ photoSpot.description }}</p>
              <div class="flex gap-4 mt-2 text-xs text-gray-500">
                <span>⏰ {{ photoSpot.bestTime }}</span>
              </div>
              <p class="text-sm text-amber-600 mt-2">💡 {{ photoSpot.tips }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 404 -->
    <div v-else class="flex flex-col items-center justify-center min-h-[50vh] text-gray-500">
      <p class="text-lg">장소를 찾을 수 없습니다</p>
      <NuxtLink to="/guide" class="text-primary-500 mt-4">목록으로 돌아가기</NuxtLink>
    </div>
  </div>
</template>
