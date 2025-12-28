<script setup lang="ts">
import type { Place, TripHighlight, PhotoSpot } from '~/types'

const route = useRoute()
const placeId = route.params.id as string

// Composable을 통한 데이터 로드
const { data: placesData } = await usePlaces()
const { data: highlightsData } = await useHighlights()
const { getImagePath } = useImagePath()

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

// 뒤로가기 - 브라우저 히스토리 사용
const router = useRouter()
const goBack = () => {
  // 히스토리가 있으면 이전 페이지로, 없으면 가이드 목록으로
  if (window.history.length > 1) {
    router.back()
  } else {
    navigateTo('/guide')
  }
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
  <div class="min-h-screen bg-apple-gray-100 dark:bg-apple-gray-900">
    <!-- Apple 스타일 헤더 -->
    <header class="nav-bar pt-safe-top">
      <div class="nav-bar-content max-w-lg mx-auto">
        <button @click="goBack" class="nav-back-btn">
          <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h1 class="nav-title dark:text-white">{{ place?.name }}</h1>
        <div class="w-11"></div>
      </div>
    </header>

    <div v-if="place" class="max-w-lg mx-auto">
      <!-- 이미지 갤러리 (스와이프 지원) -->
      <div
        v-if="place.images && place.images.length > 0"
        ref="galleryRef"
        class="relative touch-pan-y"
      >
        <div class="aspect-[4/3] bg-apple-gray-100 dark:bg-apple-gray-800 overflow-hidden">
          <NuxtImg
            :src="getImagePath(place.images[currentImageIndex])"
            :alt="`${place.name} - ${currentImageIndex + 1}`"
            width="640"
            height="480"
            class="w-full h-full object-cover transition-opacity duration-300"
            :class="{ 'opacity-80': isSwiping }"
            placeholder
          />
        </div>

        <!-- 이미지 네비게이션 (2개 이상일 때만) -->
        <template v-if="place.images.length > 1">
          <!-- 좌우 버튼 -->
          <button
            @click="prevImage"
            class="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 backdrop-blur-sm text-white rounded-full flex items-center justify-center touch-feedback"
            aria-label="이전 이미지"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            @click="nextImage"
            class="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 backdrop-blur-sm text-white rounded-full flex items-center justify-center touch-feedback"
            aria-label="다음 이미지"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <!-- 이미지 인디케이터 -->
          <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            <button
              v-for="(_, index) in place.images"
              :key="index"
              @click="currentImageIndex = index"
              class="w-6 h-6 flex items-center justify-center"
              :aria-label="`이미지 ${index + 1}`"
            >
              <span
                class="w-1.5 h-1.5 rounded-full transition-all"
                :class="index === currentImageIndex ? 'bg-white w-2 h-2' : 'bg-white/50'"
              />
            </button>
          </div>
        </template>
      </div>

      <!-- 이미지 없을 때 플레이스홀더 -->
      <div v-else class="aspect-[4/3] bg-apple-gray-200 dark:bg-apple-gray-800 flex items-center justify-center">
        <svg class="w-16 h-16 text-apple-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>

      <!-- 기본 정보 헤더 -->
      <div class="bg-white dark:bg-apple-gray-800 px-4 py-5">
        <span class="badge badge-primary">
          {{ categoryNames[place.category] || place.category }}
        </span>
        <h2 class="text-title-2 dark:text-white mt-2">{{ place.name }}</h2>
        <p class="text-subhead text-apple-gray-500 mt-0.5">{{ place.nameLocal }}</p>
        <p class="text-footnote text-apple-gray-400 mt-2 flex items-center gap-1">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
          </svg>
          {{ place.city }}, {{ place.country }}
        </p>
      </div>

      <!-- 세그먼트 컨트롤 탭 -->
      <div class="bg-white dark:bg-apple-gray-800 px-4 py-3 border-t border-apple-gray-200/50 dark:border-apple-gray-700/50">
        <div class="segment-control">
          <button
            class="segment-item"
            :class="{ active: activeTab === 'info' }"
            @click="activeTab = 'info'"
          >
            기본정보
          </button>
          <button
            class="segment-item"
            :class="{ active: activeTab === 'history' }"
            @click="activeTab = 'history'"
          >
            역사
          </button>
          <button
            class="segment-item"
            :class="{ active: activeTab === 'tips' }"
            @click="activeTab = 'tips'"
          >
            팁
          </button>
        </div>
      </div>

      <!-- 탭 콘텐츠 -->
      <div class="px-4 py-6 space-y-6">
        <!-- 기본 정보 탭 -->
        <template v-if="activeTab === 'info'">
          <section>
            <h3 class="text-footnote uppercase text-apple-gray-500 px-1 mb-2">요약</h3>
            <div class="card-apple p-4">
              <p class="text-body text-apple-gray-600 dark:text-apple-gray-400">{{ place.description.summary }}</p>
            </div>
          </section>

          <section>
            <h3 class="text-footnote uppercase text-apple-gray-500 px-1 mb-2">관람 정보</h3>
            <div class="card-apple overflow-hidden divide-y divide-apple-gray-200/50 dark:divide-apple-gray-700/50">
              <div class="card-item">
                <span class="text-body dark:text-white">운영시간</span>
                <span class="text-body text-apple-gray-500">{{ place.basicInfo.openingHours }}</span>
              </div>
              <div class="card-item">
                <span class="text-body dark:text-white">입장료</span>
                <span class="text-body text-apple-gray-500">{{ place.basicInfo.admission }}</span>
              </div>
              <div class="card-item">
                <span class="text-body dark:text-white">소요시간</span>
                <span class="text-body text-apple-gray-500">{{ place.basicInfo.recommendedDuration }}</span>
              </div>
            </div>
          </section>

          <section>
            <h3 class="text-footnote uppercase text-apple-gray-500 px-1 mb-2">주요 포인트</h3>
            <div class="card-apple p-4">
              <ul class="space-y-2">
                <li v-for="(highlight, index) in place.description.highlights" :key="index" class="flex gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-apple-blue mt-2 shrink-0"></span>
                  <span class="text-body text-apple-gray-600 dark:text-apple-gray-400">{{ highlight }}</span>
                </li>
              </ul>
            </div>
          </section>
        </template>

        <!-- 역사/소개 탭 -->
        <template v-if="activeTab === 'history'">
          <section>
            <h3 class="text-footnote uppercase text-apple-gray-500 px-1 mb-2">역사 및 배경</h3>
            <div class="card-apple p-4">
              <p class="text-body text-apple-gray-600 dark:text-apple-gray-400 leading-relaxed whitespace-pre-line">{{ place.description.history }}</p>
            </div>
          </section>

          <section v-if="relatedHighlight">
            <h3 class="text-footnote uppercase text-apple-gray-500 px-1 mb-2">하이라이트</h3>
            <div class="card-apple p-4 bg-apple-blue/5 dark:bg-apple-blue/10">
              <span class="badge badge-primary">Day {{ relatedHighlight.dayNumber }}</span>
              <h4 class="text-headline dark:text-white mt-2">{{ relatedHighlight.title }}</h4>
              <p class="text-subhead text-apple-gray-600 dark:text-apple-gray-400 mt-2">{{ relatedHighlight.description }}</p>
              <div class="flex flex-wrap gap-1.5 mt-3">
                <span v-for="tag in relatedHighlight.tags" :key="tag" class="text-caption-1 text-apple-blue dark:text-apple-blue-dark">
                  #{{ tag }}
                </span>
              </div>
            </div>
          </section>
        </template>

        <!-- 팁/사진 탭 -->
        <template v-if="activeTab === 'tips'">
          <section>
            <h3 class="text-footnote uppercase text-apple-gray-500 px-1 mb-2">관람 팁</h3>
            <div class="card-apple p-4">
              <ul class="space-y-3">
                <li v-for="(tip, index) in place.tips" :key="index" class="flex gap-3">
                  <div class="w-6 h-6 rounded-full bg-apple-yellow/20 flex items-center justify-center shrink-0">
                    <svg class="w-3.5 h-3.5 text-apple-yellow" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                    </svg>
                  </div>
                  <span class="text-body text-apple-gray-600 dark:text-apple-gray-400">{{ tip }}</span>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h3 class="text-footnote uppercase text-apple-gray-500 px-1 mb-2">추천 사진 스팟</h3>
            <div class="card-apple p-4">
              <ul class="space-y-3">
                <li v-for="(spot, index) in place.photoSpots" :key="index" class="flex gap-3">
                  <div class="w-6 h-6 rounded-full bg-apple-pink/20 flex items-center justify-center shrink-0">
                    <svg class="w-3.5 h-3.5 text-apple-pink" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                    </svg>
                  </div>
                  <span class="text-body text-apple-gray-600 dark:text-apple-gray-400">{{ spot }}</span>
                </li>
              </ul>
            </div>
          </section>

          <section v-if="relatedPhotoSpots.length > 0">
            <h3 class="text-footnote uppercase text-apple-gray-500 px-1 mb-2">상세 촬영 가이드</h3>
            <div class="space-y-3">
              <div v-for="photoSpot in relatedPhotoSpots" :key="photoSpot.id" class="card-apple p-4">
                <h4 class="text-headline dark:text-white">{{ photoSpot.title }}</h4>
                <p class="text-subhead text-apple-gray-500 mt-1">{{ photoSpot.description }}</p>
                <div class="flex items-center gap-2 mt-2 text-footnote text-apple-gray-400">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  {{ photoSpot.bestTime }}
                </div>
                <p class="text-footnote text-apple-orange mt-2">{{ photoSpot.tips }}</p>
              </div>
            </div>
          </section>
        </template>
      </div>
    </div>

    <!-- 404 -->
    <div v-else class="empty-state min-h-[60vh]">
      <svg class="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
      </svg>
      <p class="empty-state-title">장소를 찾을 수 없습니다</p>
      <NuxtLink to="/guide" class="btn-text mt-4">목록으로 돌아가기</NuxtLink>
    </div>
  </div>
</template>
