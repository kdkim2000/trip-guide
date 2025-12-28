<script setup lang="ts">
import type { TravelTipsData, ChecklistCategory, LanguageInfo } from '~/types'

const tripStore = useTripStore()

// 현재 여행 ID 기반으로 동적 데이터 로드
const { data: tipsData, status, refresh } = await useAsyncData<TravelTipsData>(
  () => `travel-tips-${tripStore.currentTripId}`,
  () => $fetch(`/data/trips/${tripStore.currentTripId}/tips.json`),
  { watch: [() => tripStore.currentTripId] }
)

// 지원 언어 목록 (데이터에서 동적으로 추출)
const availableLanguages = computed<LanguageInfo[]>(() => {
  if (!tipsData.value) return []

  // languages 필드가 있으면 사용
  if (tipsData.value.languages?.length) {
    return tipsData.value.languages
  }

  // 없으면 phrases에서 언어 추출
  const languageSet = new Set<string>()
  tipsData.value.phrases.forEach(p => languageSet.add(p.language))

  const labelMap: Record<string, string> = {
    spanish: '스페인어',
    portuguese: '포르투갈어',
    chinese: '중국어',
    english: '영어',
    japanese: '일본어',
  }

  return Array.from(languageSet).map(code => ({
    code,
    label: labelMap[code] || code,
  }))
})

// 약관 탭 표시 여부 (자유여행은 약관이 없을 수 있음)
const hasTerms = computed(() => !!tipsData.value?.termsAndConditions)

// 탭 정의 (동적)
const tabs = computed(() => {
  const baseTabs = [
    { id: 'precautions', label: '유의사항' },
  ]

  if (hasTerms.value) {
    baseTabs.push({ id: 'terms', label: '약관' })
  }

  if (availableLanguages.value.length > 0) {
    baseTabs.push({ id: 'language', label: '언어' })
  }

  baseTabs.push({ id: 'checklist', label: '준비물' })

  return baseTabs
})

const activeTab = ref('precautions')

// 언어 선택 (동적)
const selectedLanguage = ref<string>('')

// 언어 목록이 로드되면 첫 번째 언어 선택
watch(availableLanguages, (languages) => {
  if (languages.length > 0 && !selectedLanguage.value) {
    selectedLanguage.value = languages[0].code
  }
}, { immediate: true })

// 체크리스트 상태 관리
const checklistStates = ref<Record<string, boolean>>({})

// IndexedDB에서 체크리스트 상태 로드
onMounted(async () => {
  if (import.meta.client) {
    try {
      const db = useIndexedDB()
      checklistStates.value = await db.getChecklistStates()
    } catch (error) {
      console.error('Failed to load checklist states:', error)
    }
  }
})

// 체크리스트 토글
const toggleChecklistItem = async (itemId: string, checked: boolean) => {
  checklistStates.value[itemId] = checked
  if (import.meta.client) {
    try {
      const db = useIndexedDB()
      await db.saveChecklistItem(itemId, checked)
    } catch (error) {
      console.error('Failed to save checklist state:', error)
    }
  }
}

// 언어별 문구 필터
const filteredPhrases = computed(() => {
  if (!tipsData.value) return []
  return tipsData.value.phrases.filter(p => p.language === selectedLanguage.value)
})

// 문구 카테고리별 그룹화
const phrasesByCategory = computed(() => {
  const grouped: Record<string, typeof filteredPhrases.value> = {}
  for (const phrase of filteredPhrases.value) {
    if (!grouped[phrase.category]) {
      grouped[phrase.category] = []
    }
    grouped[phrase.category].push(phrase)
  }
  return grouped
})

// 체크리스트 진행률 계산
const checklistProgress = computed(() => {
  if (!tipsData.value) return { checked: 0, total: 0, percent: 0 }

  let total = 0
  let checked = 0

  for (const category of tipsData.value.checklist) {
    for (const item of category.items) {
      total++
      if (checklistStates.value[item.id]) {
        checked++
      }
    }
  }

  return {
    checked,
    total,
    percent: total > 0 ? Math.round((checked / total) * 100) : 0,
  }
})
</script>

<template>
  <div class="min-h-screen bg-apple-gray-100 dark:bg-apple-gray-900">
    <!-- Apple 스타일 헤더 -->
    <header class="nav-bar pt-safe-top">
      <div class="max-w-lg mx-auto">
        <div class="px-4 pt-4 pb-2">
          <h1 class="text-title-large dark:text-white">꿀팁</h1>
        </div>

        <!-- 세그먼트 컨트롤 스타일 탭 -->
        <div class="px-4 pb-4">
          <div class="segment-control">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              class="segment-item"
              :class="{ active: activeTab === tab.id }"
              @click="activeTab = tab.id"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- 컨텐츠 -->
    <div class="px-4 py-6 max-w-lg mx-auto">
      <!-- 로딩 상태 -->
      <template v-if="status === 'pending'">
        <div class="space-y-4">
          <SkeletonCard v-for="i in 3" :key="i" :show-image="false" :lines="3" />
        </div>
      </template>

      <!-- 유의사항 탭 -->
      <div v-else-if="activeTab === 'precautions' && tipsData" class="space-y-6">
        <TipsSection
          v-for="category in tipsData.precautions"
          :key="category.id"
          :category="category"
        />
      </div>

      <!-- 약관 탭 -->
      <div v-else-if="activeTab === 'terms' && tipsData?.termsAndConditions" class="space-y-6">
        <!-- 특별약관 -->
        <section>
          <h2 class="text-footnote uppercase text-apple-gray-500 px-1 mb-3">특별약관</h2>
          <div class="card-apple overflow-hidden">
            <ul class="divide-y divide-apple-gray-200/50 dark:divide-apple-gray-700/50">
              <li
                v-for="(term, idx) in tipsData.termsAndConditions.specialTerms"
                :key="idx"
                class="px-4 py-3 flex gap-3"
              >
                <span class="w-2 h-2 rounded-full bg-apple-blue shrink-0 mt-1.5"></span>
                <span class="text-body text-apple-gray-700 dark:text-apple-gray-300">{{ term }}</span>
              </li>
            </ul>
          </div>
        </section>

        <!-- 취소 수수료 -->
        <section>
          <h2 class="text-footnote uppercase text-apple-gray-500 px-1 mb-3">취소 수수료</h2>
          <div class="card-apple overflow-hidden">
            <div class="divide-y divide-apple-gray-200/50 dark:divide-apple-gray-700/50">
              <div
                v-for="(policy, idx) in tipsData.termsAndConditions.cancellationPolicy"
                :key="idx"
                class="px-4 py-3 flex justify-between items-start gap-4"
              >
                <span class="text-body dark:text-white flex-1">{{ policy.period }}</span>
                <span class="text-body text-apple-gray-500 text-right">{{ policy.fee }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 규정 안내 -->
        <div class="card-apple p-4 bg-apple-yellow/10 dark:bg-apple-yellow/5 border border-apple-yellow/20">
          <div class="flex gap-3">
            <svg
              class="w-5 h-5 text-apple-yellow shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
              />
            </svg>
            <p class="text-footnote text-apple-gray-700 dark:text-apple-gray-300">
              {{ tipsData.termsAndConditions.regulations }}
            </p>
          </div>
        </div>
      </div>

      <!-- 언어 탭 -->
      <div v-else-if="activeTab === 'language' && tipsData" class="space-y-6">
        <!-- 언어 선택 세그먼트 (동적) -->
        <div v-if="availableLanguages.length > 1" class="segment-control">
          <button
            v-for="lang in availableLanguages"
            :key="lang.code"
            class="segment-item"
            :class="{ active: selectedLanguage === lang.code }"
            @click="selectedLanguage = lang.code"
          >
            {{ lang.label }}
          </button>
        </div>
        <!-- 단일 언어일 경우 헤더 표시 -->
        <div v-else-if="availableLanguages.length === 1" class="text-subhead text-apple-gray-500">
          {{ availableLanguages[0].label }} 기본 표현
        </div>

        <!-- 카테고리별 문구 -->
        <section
          v-for="(phrases, category) in phrasesByCategory"
          :key="category"
        >
          <h2 class="text-footnote uppercase text-apple-gray-500 px-1 mb-3">{{ category }}</h2>
          <div class="card-apple overflow-hidden divide-y divide-apple-gray-200/50 dark:divide-apple-gray-700/50">
            <LanguagePhrase
              v-for="phrase in phrases"
              :key="phrase.id"
              :phrase="phrase"
            />
          </div>
        </section>
      </div>

      <!-- 준비물 탭 -->
      <div v-else-if="activeTab === 'checklist' && tipsData" class="space-y-6">
        <!-- 진행률 -->
        <div class="card-apple p-4">
          <div class="flex items-center justify-between mb-3">
            <span class="text-body font-medium dark:text-white">준비 완료</span>
            <span class="text-subhead text-apple-gray-500">
              {{ checklistProgress.checked }}/{{ checklistProgress.total }}
            </span>
          </div>
          <div class="w-full h-2 bg-apple-gray-200 dark:bg-apple-gray-700 rounded-full overflow-hidden">
            <div
              class="h-full bg-apple-green rounded-full transition-all duration-300"
              :style="{ width: `${checklistProgress.percent}%` }"
            ></div>
          </div>
          <p class="text-caption-1 text-apple-gray-500 mt-2">
            {{ checklistProgress.percent }}% 완료
          </p>
        </div>

        <!-- 카테고리별 체크리스트 -->
        <section
          v-for="category in tipsData.checklist"
          :key="category.id"
        >
          <div class="flex items-center justify-between px-1 mb-3">
            <h2 class="text-footnote uppercase text-apple-gray-500">{{ category.title }}</h2>
            <span class="badge badge-secondary">
              {{ category.items.filter(i => checklistStates[i.id]).length }}/{{ category.items.length }}
            </span>
          </div>
          <div class="card-apple overflow-hidden divide-y divide-apple-gray-200/50 dark:divide-apple-gray-700/50">
            <ChecklistItem
              v-for="item in category.items"
              :key="item.id"
              :item="item"
              :checked="checklistStates[item.id] || false"
              @toggle="toggleChecklistItem"
            />
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
