# 여행 플래너 & 가이드 애플리케이션 PRD

## 문서 정보

| 항목 | 내용 |
|------|------|
| 프로젝트명 | TripGuide (여행 가이드) |
| 버전 | 1.0.0 |
| 작성일 | 2024-12-28 |
| 상태 | Draft |

---

## 1. 프로젝트 개요

### 1.1 비전
여행자가 미리 계획한 일정에 따라 실시간으로 여행 가이드를 받을 수 있는 모바일 웹 애플리케이션. 오프라인에서도 완벽하게 동작하여 해외 여행 시에도 데이터 걱정 없이 사용 가능.

### 1.2 목표
- 여행 일정을 다양한 형식으로 쉽게 입력
- 현재 시간 기반 실시간 여행 비서 기능 제공
- 여행지별 상세 정보(역사, 문화, 주요 포인트) 제공
- 네트워크 없이도 완전한 기능 동작

### 1.3 대상 사용자
| 페르소나 | 특징 |
|----------|------|
| 자유 여행자 | 직접 일정을 계획하고 현지에서 가이드가 필요한 여행자 |
| 단체 여행 인솔자 | 팀원들에게 일정과 정보를 공유해야 하는 리더 |
| 출장자 | 비즈니스 일정과 여행 정보를 함께 관리하려는 사용자 |

---

## 2. 핵심 기능

### 2.1 여행 일정 입력

#### 2.1.1 지원 입력 형식
| 형식 | 설명 | 예시 |
|------|------|------|
| 텍스트 | 자연어 형태의 일정 입력 | "1월 15일 09:00 인천공항 출발" |
| JSON | 구조화된 데이터 직접 입력/가져오기 | JSON 파일 업로드 |
| 표 형식 | 엑셀 스타일 복사/붙여넣기 | 탭 구분 데이터 |
| 폼 입력 | UI 폼을 통한 단계별 입력 | 날짜/시간/장소 개별 입력 |

#### 2.1.2 일정 데이터 항목
- 날짜 (Date)
- 시작/종료 시간 (Time)
- 장소명 (Place)
- 장소 유형 (Type: 관광지, 식당, 숙소, 이동 등)
- 메모 (Notes)
- 연결된 여행지 정보 ID (PlaceInfoId)

### 2.2 시간 기반 여행 가이드

#### 2.2.1 실시간 비서 기능
- 현재 시간 기준 진행 중인 일정 표시
- 다음 일정까지 남은 시간 카운트다운
- 현재 위치에서의 주요 정보 하이라이트
- 일정 알림 (브라우저 Notification)

#### 2.2.2 타임라인 뷰
- 일자별 전체 일정 타임라인
- 완료/진행중/예정 상태 구분
- 시간대별 그룹핑

### 2.3 여행지 상세 정보

#### 2.3.1 정보 카테고리
| 카테고리 | 내용 |
|----------|------|
| 기본 정보 | 명칭, 주소, 운영시간, 입장료 |
| 역사/배경 | 역사적 의의, 건립 배경, 주요 사건 |
| 관람 포인트 | 놓치면 안 될 핵심 볼거리 |
| 실용 정보 | 소요시간, 팁, 주의사항 |
| 미디어 | 이미지, 오디오 가이드 (옵션) |

#### 2.3.2 콘텐츠 표시 방식
- 카드 형태의 요약 뷰
- 상세 페이지 확장 뷰
- 음성 안내 기능 (Web Speech API)

### 2.4 주요 포인트 하이라이트

- 여행 전체 하이라이트 요약
- 일자별 Best 포인트
- 사진 촬영 추천 스팟
- 현지인 추천 정보

---

## 3. 기술 스택

### 3.1 프론트엔드

| 기술 | 버전 | 용도 |
|------|------|------|
| Nuxt.js | 3.x | 메인 프레임워크 |
| Vue.js | 3.x | UI 컴포넌트 (Composition API) |
| TypeScript | 5.x | 타입 안정성 |
| Pinia | 2.x | 상태 관리 |
| VueUse | Latest | 유틸리티 Composables |
| Tailwind CSS | 3.x | 스타일링 |

### 3.2 PWA & 오프라인

| 기술 | 용도 |
|------|------|
| @vite-pwa/nuxt | PWA 지원 |
| Service Worker | 오프라인 캐싱 |
| IndexedDB | 로컬 데이터 저장 |
| LocalStorage | 설정 및 상태 저장 |

### 3.3 개발 도구

| 도구 | 용도 |
|------|------|
| Vite | 빌드 도구 |
| ESLint | 코드 린팅 |
| Prettier | 코드 포맷팅 |
| Vitest | 단위 테스트 |
| Playwright | E2E 테스트 |

---

## 4. 데이터 구조

> **실제 데이터**: `public/data/` 폴더에 스페인/포르투갈 9일 여행 데이터가 준비되어 있습니다.

### 4.1 여행 일정 (itinerary.json)

```json
{
  "tripInfo": {
    "id": "trip-spain-portugal-2026",
    "title": "스페인 포르투갈 9일",
    "subtitle": "가우디와 이슬람 건축의 걸작을 만나는 여행",
    "startDate": "2026-02-01",
    "endDate": "2026-02-09",
    "timezone": "Europe/Madrid",
    "airline": {
      "name": "대한항공",
      "mileage": "약 70~80% 적립 (성인기준)"
    },
    "accommodation": "전 일정 투어리스트급 또는 일급 호텔 (2인 1실 기준)",
    "highlights": [
      "가우디 투어의 중심지 바르셀로나",
      "이슬람 건축의 최고 걸작 알함브라궁전"
    ]
  },
  "schedules": [
    {
      "id": "day-1",
      "date": "2026-02-01",
      "dayNumber": 1,
      "dayOfWeek": "일",
      "title": "인천 - 마드리드",
      "cities": ["인천", "마드리드"],
      "items": [
        {
          "id": "d1-item-1",
          "startTime": "08:30",
          "endTime": "09:30",
          "title": "인천공항 미팅",
          "type": "meeting",
          "placeId": null,
          "location": "인천공항 제2터미널(T2) 3층",
          "notes": "가이드는 출발 2~3일전 개별 안내",
          "status": "pending"
        },
        {
          "id": "d1-item-2",
          "startTime": "12:10",
          "endTime": "19:25",
          "title": "인천 → 마드리드 (KE913)",
          "type": "transport",
          "transportType": "flight",
          "notes": "약 15시간 20분 소요"
        }
      ],
      "meals": {
        "breakfast": { "type": "불포함" },
        "lunch": { "type": "기내식" },
        "dinner": { "type": "기내식" }
      }
    }
  ],
  "specialFeatures": [
    {
      "title": "대표 도시 자유 시간",
      "description": "리스본, 바르셀로나, 마드리드에서 자유시간 제공"
    }
  ],
  "foodHighlights": {
    "desserts": ["하몽", "에그타르트", "발렌시아 오렌지", "타파스"],
    "mainDishes": ["바깔라우", "빠에야"],
    "drinks": ["샹그리아", "와인"]
  }
}
```

### 4.2 여행지 정보 (places.json)

```json
{
  "places": [
    {
      "id": "place-sagrada-familia",
      "name": "성가족 성당",
      "nameLocal": "Basílica de la Sagrada Familia",
      "city": "바르셀로나",
      "country": "스페인",
      "category": "cathedral",
      "location": {
        "address": "Carrer de Mallorca, 401, 08013 Barcelona, Spain",
        "coordinates": { "lat": 41.4036, "lng": 2.1744 }
      },
      "basicInfo": {
        "openingHours": "09:00-20:00",
        "admission": "약 26유로",
        "recommendedDuration": "2시간",
        "website": "https://sagradafamilia.org/"
      },
      "description": {
        "summary": "가우디가 40년간 생을 바친 미완의 걸작, 2026년 완공 목표",
        "history": "1883년 천재 건축가 가우디는 40년간 숨을 거둘 때까지 남은 생을 바쳐 설계하고 감독한 최대의 프로젝트...",
        "highlights": [
          "가우디의 최대 역작",
          "탄생의 파사드 vs 수난의 파사드",
          "스테인드글라스의 빛"
        ]
      },
      "tips": [
        "반드시 사전 예약 필수",
        "오전 방문 시 탄생의 파사드 쪽 빛이 좋음"
      ],
      "photoSpots": [
        "탄생의 파사드",
        "내부 기둥과 스테인드글라스"
      ]
    }
  ]
}
```

### 4.3 하이라이트 정보 (highlights.json)

```json
{
  "tripHighlights": [
    {
      "id": "hl-001",
      "placeId": "place-sagrada-familia",
      "dayNumber": 7,
      "title": "가우디의 미완성 걸작, 성가족 성당",
      "description": "2026년 완공을 앞둔 가우디의 생애 역작",
      "priority": 1,
      "tags": ["필수방문", "가우디", "세계문화유산", "바르셀로나"]
    }
  ],
  "dailyBest": [
    {
      "dayNumber": 7,
      "title": "가우디의 세계",
      "bestMoment": "성가족 성당과 구엘 공원의 천재적 상상력"
    }
  ],
  "photoSpots": [
    {
      "id": "photo-001",
      "placeId": "place-sagrada-familia",
      "title": "성가족 성당 탄생의 파사드",
      "description": "오전 빛이 들어올 때 스테인드글라스와 함께 촬영",
      "bestTime": "오전 9-11시",
      "tips": "탄생의 파사드는 동쪽을 향해 있어 오전에 빛이 좋습니다"
    }
  ],
  "localTips": [
    {
      "category": "음식",
      "title": "하몽 (Jamón)",
      "description": "스페인 대표 생햄. 보케리아 시장에서 저렴하게 맛볼 수 있습니다.",
      "where": "바르셀로나, 마드리드"
    }
  ]
}
```

---

## 5. 화면 설계

### 5.1 화면 구성

```
┌─────────────────────────────────────┐
│           TripGuide                 │
├─────────────────────────────────────┤
│                                     │
│  [홈] [일정] [가이드] [설정]         │
│                                     │
└─────────────────────────────────────┘
```

### 5.2 주요 화면

#### 5.2.1 홈 화면 (Dashboard)
- 현재 일정 카드 (큰 표시)
- 다음 일정 미리보기
- 오늘의 하이라이트
- 여행 D-Day 또는 진행 상황

#### 5.2.2 일정 입력/관리 화면
- 입력 방식 선택 탭
- 일정 목록 (편집 가능)
- 일정 가져오기/내보내기

#### 5.2.3 시간별 가이드 화면
- 타임라인 뷰
- 현재 시간 표시선
- 일정 아이템 카드
- 상세 정보 연결

#### 5.2.4 여행지 상세 화면
- 기본 정보 헤더
- 탭 네비게이션 (소개/역사/포인트/팁)
- 이미지 갤러리
- 음성 가이드 버튼

#### 5.2.5 설정 화면
- 알림 설정
- 테마 설정 (다크모드)
- 데이터 관리 (백업/복원)
- 언어 설정

### 5.3 반응형 디자인

| 화면 크기 | 레이아웃 |
|-----------|----------|
| 모바일 (~768px) | 단일 컬럼, 하단 네비게이션 |
| 태블릿 (768px~1024px) | 2컬럼 가능, 사이드 네비게이션 |
| 데스크톱 (1024px~) | 멀티 패널, 사이드바 |

---

## 6. API 설계

### 6.1 내부 API (Composables)

오프라인 우선 설계로 외부 API 없이 내부 Composables로 구현

#### 6.1.1 일정 관리 API

```typescript
// composables/useItinerary.ts
interface UseItinerary {
  // 상태
  trip: Ref<Trip | null>
  schedules: Ref<Schedule[]>
  currentItem: Ref<ScheduleItem | null>
  nextItem: Ref<ScheduleItem | null>

  // 조회
  getScheduleByDate(date: string): Schedule | undefined
  getItemById(id: string): ScheduleItem | undefined

  // 수정
  addScheduleItem(item: ScheduleItem): void
  updateScheduleItem(id: string, item: Partial<ScheduleItem>): void
  deleteScheduleItem(id: string): void

  // 가져오기/내보내기
  importFromJson(json: string): void
  importFromText(text: string): void
  exportToJson(): string

  // 시간 기반
  updateCurrentStatus(): void
}
```

#### 6.1.2 여행지 정보 API

```typescript
// composables/usePlaces.ts
interface UsePlaces {
  // 상태
  places: Ref<Place[]>

  // 조회
  getPlaceById(id: string): Place | undefined
  getPlacesByCategory(category: string): Place[]
  searchPlaces(query: string): Place[]

  // 수정
  addPlace(place: Place): void
  updatePlace(id: string, place: Partial<Place>): void
}
```

#### 6.1.3 시간 관리 API

```typescript
// composables/useTimeGuide.ts
interface UseTimeGuide {
  // 상태
  currentTime: Ref<Date>
  timezone: Ref<string>

  // 계산
  isCurrentItem(item: ScheduleItem): boolean
  getTimeUntilNext(): number // 밀리초
  getProgressPercent(): number

  // 알림
  scheduleNotification(item: ScheduleItem): void
  cancelNotification(itemId: string): void
}
```

### 6.2 확장용 외부 API (향후)

향후 서버 연동 시 사용할 API 엔드포인트 설계

```
GET    /api/trips              - 여행 목록 조회
POST   /api/trips              - 여행 생성
GET    /api/trips/:id          - 여행 상세 조회
PUT    /api/trips/:id          - 여행 수정
DELETE /api/trips/:id          - 여행 삭제

GET    /api/places             - 여행지 목록 조회
GET    /api/places/:id         - 여행지 상세 조회
GET    /api/places/search      - 여행지 검색

POST   /api/sync               - 데이터 동기화
```

---

## 7. 테스트 전략

### 7.1 테스트 레벨

| 레벨 | 도구 | 범위 |
|------|------|------|
| 단위 테스트 | Vitest | Composables, 유틸리티 함수 |
| 컴포넌트 테스트 | Vitest + Vue Test Utils | Vue 컴포넌트 |
| E2E 테스트 | Playwright | 사용자 시나리오 |

### 7.2 단위 테스트 케이스

#### 7.2.1 일정 관리 테스트
```typescript
describe('useItinerary', () => {
  test('일정 항목 추가', () => {})
  test('일정 항목 수정', () => {})
  test('일정 항목 삭제', () => {})
  test('JSON 가져오기 정상 처리', () => {})
  test('JSON 가져오기 오류 처리', () => {})
  test('텍스트 파싱 정상 처리', () => {})
  test('현재 일정 상태 업데이트', () => {})
})
```

#### 7.2.2 시간 관리 테스트
```typescript
describe('useTimeGuide', () => {
  test('현재 일정 판단', () => {})
  test('다음 일정까지 시간 계산', () => {})
  test('진행률 계산', () => {})
  test('타임존 변환', () => {})
})
```

### 7.3 E2E 테스트 시나리오

| 시나리오 | 설명 |
|----------|------|
| 신규 여행 생성 | 빈 상태에서 새 여행 생성까지 |
| 일정 입력 플로우 | 다양한 형식으로 일정 입력 |
| 시간 기반 가이드 | 특정 시간에 올바른 가이드 표시 |
| 오프라인 동작 | 네트워크 차단 후 기능 동작 확인 |
| 데이터 가져오기/내보내기 | JSON 파일 처리 |

### 7.4 테스트 커버리지 목표

| 영역 | 목표 커버리지 |
|------|---------------|
| Composables | 90% 이상 |
| 컴포넌트 | 80% 이상 |
| 전체 | 85% 이상 |

---

## 8. 비기능 요구사항

### 8.1 성능

| 항목 | 목표 |
|------|------|
| 초기 로딩 | 3초 이내 (3G 네트워크) |
| 페이지 전환 | 300ms 이내 |
| Lighthouse 점수 | 90점 이상 |

### 8.2 오프라인 지원

- PWA 설치 지원
- 모든 정적 자산 Service Worker 캐싱
- JSON 데이터 IndexedDB 저장
- 오프라인 상태 표시 UI

### 8.3 접근성

- WCAG 2.1 AA 준수
- 스크린 리더 지원
- 키보드 네비게이션
- 고대비 모드

### 8.4 보안

- 민감 데이터 로컬 저장 시 암호화 고려
- CSP (Content Security Policy) 설정
- HTTPS 필수

---

## 9. 프로젝트 구조

```
trip-guide/
├── app/
│   ├── components/
│   │   ├── common/           # 공통 컴포넌트
│   │   ├── itinerary/        # 일정 관련 컴포넌트
│   │   ├── guide/            # 가이드 관련 컴포넌트
│   │   └── place/            # 여행지 관련 컴포넌트
│   ├── composables/          # Composition API 함수
│   │   ├── useItinerary.ts
│   │   ├── usePlaces.ts
│   │   ├── useTimeGuide.ts
│   │   └── useOffline.ts
│   ├── pages/                # 페이지 컴포넌트
│   │   ├── index.vue         # 홈
│   │   ├── schedule/         # 일정 관련 페이지
│   │   ├── guide/            # 가이드 페이지
│   │   └── settings.vue      # 설정
│   ├── layouts/              # 레이아웃
│   └── stores/               # Pinia 스토어
├── public/
│   └── data/                 # 샘플 JSON 데이터
│       ├── itinerary.json
│       ├── places.json
│       └── highlights.json
├── tests/
│   ├── unit/                 # 단위 테스트
│   └── e2e/                  # E2E 테스트
├── nuxt.config.ts
├── package.json
└── README.md
```

---

## 10. 마일스톤

### Phase 1: 기반 구축
- 프로젝트 초기 설정
- 기본 레이아웃 및 라우팅
- JSON 데이터 구조 확정
- PWA 설정

### Phase 2: 핵심 기능 구현
- 일정 입력 기능 (폼, JSON)
- 시간 기반 현재/다음 일정 표시
- 여행지 상세 정보 표시

### Phase 3: 고급 기능
- 텍스트 파싱 입력
- 알림 기능
- 음성 가이드
- 데이터 가져오기/내보내기

### Phase 4: 완성도 향상
- UI/UX 개선
- 테스트 작성
- 성능 최적화
- 문서화

---

## 11. 용어 정의

| 용어 | 정의 |
|------|------|
| Trip | 하나의 여행 전체 |
| Schedule | 특정 날짜의 일정 |
| ScheduleItem | 개별 일정 항목 |
| Place | 여행지 정보 |
| Highlight | 주요 포인트/하이라이트 |
| TimeGuide | 시간 기반 가이드 시스템 |

---

## 부록 A: 텍스트 입력 파싱 규칙

### 지원 형식 예시

```
# 날짜 형식
2024-03-15
3월 15일
3/15

# 시간 형식
09:00
오전 9시
9AM

# 전체 예시
3월 15일 09:00 나리타 공항 도착
3/15 14:00-16:00 센소지 관광
```

### 파싱 우선순위
1. 날짜 추출
2. 시간 추출 (시작-종료)
3. 장소/활동명 추출
4. 기타 메모 처리

---

## 부록 B: 지원 여행지 카테고리

| 코드 | 한글명 | 아이콘 |
|------|--------|--------|
| temple | 사찰/신사 | ⛩️ |
| museum | 박물관/미술관 | 🏛️ |
| park | 공원/정원 | 🌳 |
| shopping | 쇼핑 | 🛍️ |
| restaurant | 식당 | 🍽️ |
| cafe | 카페 | ☕ |
| hotel | 숙소 | 🏨 |
| transport | 이동 | 🚃 |
| activity | 액티비티 | 🎯 |
| landmark | 랜드마크 | 📍 |
