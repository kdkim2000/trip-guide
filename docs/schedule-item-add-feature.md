# 일정 추가 기능 구현 문서

## 개요

여행 일정에서 누락된 일정을 추가할 수 있는 기능을 구현했습니다. 사용자는 기존 일정 사이 또는 맨 끝에 새로운 일정을 추가할 수 있으며, 시간 충돌이 발생하면 이후 일정이 자동으로 조정됩니다.

## 구현 일자

2025년 1월 (정확한 날짜는 구현 완료 시점)

## 주요 기능

### 1. 일정 추가 UI
- 일정 리스트의 각 아이템 사이에 "+" 버튼 제공
- 일정 리스트 맨 끝에 추가 버튼 제공
- 하단 시트 형태의 일정 추가 폼

### 2. 시간 충돌 자동 처리
- 새 일정이 이전 일정과 겹치면 이전 일정의 `endTime` 자동 조정
- 새 일정이 다음 일정과 겹치면 이후 모든 일정을 자동으로 밀어내기
- 시간 유효성 검증

### 3. 데이터 저장
- 편집된 데이터는 IndexedDB에 저장되어 유지됨
- 정적 여행에 일정 추가 시 자동으로 사용자 여행으로 복사

## 변경된 파일

### 1. `components/ScheduleItemAddSheet.vue` (신규 생성)

일정 추가를 위한 하단 시트 컴포넌트입니다.

**주요 기능:**
- 필수 필드: 제목, 시작 시간, 종료 시간, 타입
- 선택 필드: 위치, 메모, 이동 수단(transport 타입일 때)
- 시간 유효성 검증
- 에러 메시지 표시

**Props:**
```typescript
{
  isOpen: boolean
  insertAfterItemId?: string | null
  defaultStartTime?: string
  defaultEndTime?: string
}
```

**Events:**
```typescript
{
  close: []
  save: [item: Omit<ScheduleItem, 'id' | 'status'>]
}
```

### 2. `composables/useTimeEditor.ts`

일정 삽입 로직을 추가했습니다.

**추가된 함수:**

#### `insertScheduleItem`
```typescript
export function insertScheduleItem(
  itinerary: Itinerary,
  dayNumber: number,
  newItem: Omit<ScheduleItem, 'id' | 'status'>,
  insertAfterItemId: string | null
): Itinerary
```

**기능:**
- 일정을 특정 위치에 삽입
- 새 아이템의 ID 자동 생성 (`d{dayNumber}-item-{timestamp}`)
- 시간 충돌 처리:
  - 이전 아이템과 겹치면 이전 아이템의 `endTime` 조정
  - 다음 아이템과 겹치면 이후 일정들을 자동으로 밀어내기

**예시:**
```typescript
const updatedItinerary = insertScheduleItem(
  itinerary,
  1, // dayNumber
  {
    title: '새 일정',
    startTime: '14:00',
    endTime: '15:00',
    type: 'activity',
    location: '서울',
    notes: '메모'
  },
  'd1-item-1' // insertAfterItemId (null이면 맨 끝에 추가)
)
```

### 3. `stores/trip.ts`

일정 추가를 위한 스토어 메서드를 추가했습니다.

**추가된 메서드:**

#### `addScheduleItem`
```typescript
const addScheduleItem = async (
  dayNumber: number,
  newItem: Omit<ScheduleItem, 'id' | 'status'>,
  insertAfterItemId: string | null
): Promise<void>
```

**기능:**
- 정적 여행인 경우 사용자 여행으로 자동 복사
- `insertScheduleItem` 함수를 사용하여 일정 삽입
- IndexedDB에 저장 (reactive 객체를 평면 객체로 변환)
- 현재 여행 ID 업데이트

**사용 예시:**
```typescript
const tripStore = useTripStore()

await tripStore.addScheduleItem(
  1, // dayNumber
  {
    title: '새 일정',
    startTime: '14:00',
    endTime: '15:00',
    type: 'activity'
  },
  'd1-item-1' // insertAfterItemId
)
```

### 4. `pages/schedule.vue`

일정 추가 UI를 통합했습니다.

**추가된 상태:**
```typescript
const isAddSheetOpen = ref(false)
const insertAfterItemId = ref<string | null>(null)
const isAdding = ref(false)
```

**추가된 함수:**
```typescript
// 일정 추가 시작
const openAddSheet = (afterItemId?: string | null) => {
  insertAfterItemId.value = afterItemId || null
  isAddSheetOpen.value = true
}

// 일정 추가 닫기
const closeAddSheet = () => {
  isAddSheetOpen.value = false
  insertAfterItemId.value = null
}

// 일정 추가 저장
const handleAddItem = async (newItem: Omit<ScheduleItem, 'id' | 'status'>) => {
  // ... 구현 내용
}
```

**UI 변경사항:**
- 일정 리스트의 각 아이템 사이에 "+" 버튼 추가
- 일정 리스트 맨 끝에 추가 버튼 제공
- `ScheduleItemAddSheet` 컴포넌트 통합

## 사용 방법

### 1. 일정 추가 버튼 클릭
- 일정 리스트의 각 아이템 사이에 있는 "+" 버튼을 클릭하면 해당 아이템 뒤에 일정이 추가됩니다.
- 일정 리스트 맨 끝의 "일정 추가" 버튼을 클릭하면 맨 끝에 일정이 추가됩니다.

### 2. 일정 정보 입력
- 필수 필드: 제목, 시작 시간, 종료 시간, 타입
- 선택 필드: 위치, 메모
- transport 타입 선택 시: 이동 수단 선택 가능

### 3. 저장
- "저장" 버튼을 클릭하면 일정이 추가되고, 시간 충돌이 있으면 자동으로 조정됩니다.
- 저장된 일정은 IndexedDB에 저장되어 유지됩니다.

## 기술적 세부사항

### 1. 시간 충돌 처리 알고리즘

```typescript
// 이전 아이템과의 충돌 처리
if (insertIndex > 0) {
  const previousItem = schedule.items[insertIndex - 1]
  const prevEndMinutes = timeToMinutes(previousItem.endTime)
  const newStartMinutes = timeToMinutes(newScheduleItem.startTime)
  
  if (newStartMinutes < prevEndMinutes) {
    // 이전 아이템의 endTime을 새 아이템의 startTime으로 조정
    previousItem.endTime = newScheduleItem.startTime
  }
}

// 다음 아이템과의 충돌 처리
const newDuration = timeToMinutes(newScheduleItem.endTime) - timeToMinutes(newScheduleItem.startTime)
if (newDuration > 0) {
  for (let i = insertIndex + 1; i < schedule.items.length; i++) {
    const item = schedule.items[i]
    const newStartMinutes = timeToMinutes(item.startTime) + newDuration
    const newEndMinutes = timeToMinutes(item.endTime) + newDuration
    item.startTime = minutesToTime(newStartMinutes)
    item.endTime = minutesToTime(newEndMinutes)
  }
}
```

### 2. Reactive 객체 처리

IndexedDB에 저장할 때 Vue의 reactive 객체를 평면 객체로 변환해야 합니다.

```typescript
// toRaw()로 reactive 래퍼 제거
const updatedItinerary = insertItemLogic(
  toRaw(userTrip.itinerary),
  dayNumber,
  newItem,
  insertAfterItemId
)

// JSON.parse(JSON.stringify())로 깊은 복사 및 평면화
const updatedUserTripRaw = {
  ...toRaw(userTrip),
  itinerary: updatedItinerary,
  updatedAt: new Date().toISOString(),
}
const updatedUserTrip: UserTripData = JSON.parse(JSON.stringify(updatedUserTripRaw))
```

### 3. 정적 여행 보호

정적 여행에 일정을 추가하면 자동으로 사용자 여행으로 복사됩니다.

```typescript
const isStaticTrip = trips.value.some(t => t.id === tripId)
let workingTripId = tripId

if (isStaticTrip) {
  workingTripId = await copyStaticTripToUser(tripId)
}
```

## 해결된 문제

### 1. DataCloneError
**문제:** IndexedDB에 Vue reactive 객체를 저장할 때 `DataCloneError` 발생

**해결:**
- `toRaw()`로 reactive 래퍼 제거
- `JSON.parse(JSON.stringify())`로 깊은 복사 및 평면화
- `useIndexedDB.saveTrip`에서도 최종 검증

### 2. 함수 스코프 문제
**문제:** `$setup.openAddSheet is not a function` 오류 발생

**해결:**
- 함수 정의 위치를 `openTimeEdit` 바로 다음으로 이동
- 함수 호출 방식을 `openTimeEdit`와 동일하게 통일

## 향후 개선 사항

1. **일정 삭제 기능**: 추가된 일정을 삭제할 수 있는 기능
2. **일정 순서 변경**: 드래그 앤 드롭으로 일정 순서 변경
3. **일정 복사**: 기존 일정을 복사하여 새 일정으로 추가
4. **일정 템플릿**: 자주 사용하는 일정을 템플릿으로 저장

## 관련 파일

- `components/ScheduleItemAddSheet.vue`
- `composables/useTimeEditor.ts`
- `stores/trip.ts`
- `pages/schedule.vue`
- `types/index.ts` (ScheduleItem 타입 정의)

