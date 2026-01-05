# 일정 시간 조정 기능 구현 문서

## 개요

여행 일정에서 각 일정 아이템의 시작 시간(`startTime`)과 종료 시간(`endTime`)을 수정할 수 있는 기능을 구현했습니다. 종료 시간을 변경하면 이후 일정이 자동으로 조정되어 시간 충돌을 방지합니다.

## 구현 일자

2025년 1월 (정확한 날짜는 구현 완료 시점)

## 주요 기능

### 1. 시간 편집 UI
- 일정 아이템의 시간 영역 클릭 시 하단 시트 형태의 편집 폼 표시
- 시작 시간과 종료 시간을 개별적으로 수정 가능
- 시간 입력 유효성 검증 및 에러 메시지 표시

### 2. 자동 시간 조정
- **종료 시간 변경 시**: 이후 모든 일정이 자동으로 조정됨
- **시작 시간 변경 시**: 
  - 이전 일정과 겹치면 이전 일정의 종료 시간 이후로 자동 조정
  - 종료 시간이 시작 시간보다 이전이면 자동으로 1시간 후로 조정

### 3. 데이터 저장
- 편집된 데이터는 IndexedDB에 저장되어 유지됨
- 정적 여행에 시간을 수정하면 자동으로 사용자 여행으로 복사

## 변경된 파일

### 1. `components/TimeEditSheet.vue` (신규 생성)

시간 편집을 위한 하단 시트 컴포넌트입니다.

**주요 기능:**
- 시작 시간과 종료 시간 입력 필드
- 시간 유효성 검증 (HH:mm 형식, 시작 < 종료)
- 에러 메시지 표시
- ESC 키 및 배경 클릭으로 닫기

**Props:**
```typescript
{
  item: ScheduleItem | null
  isOpen: boolean
}
```

**Events:**
```typescript
{
  close: []
  save: [startTime: string, endTime: string]
}
```

**UI 특징:**
- 하단에서 슬라이드 업되는 시트 형태
- 다크 모드 지원
- 모바일 친화적인 터치 인터페이스
- 안전 영역(safe area) 고려

### 2. `composables/useTimeEditor.ts`

시간 조정 로직을 제공하는 유틸리티 함수들입니다.

#### 시간 변환 함수

**`timeToMinutes`**
```typescript
export function timeToMinutes(time: string): number
```
시간 문자열("HH:mm")을 분 단위로 변환합니다.

**`minutesToTime`**
```typescript
export function minutesToTime(minutes: number): string
```
분 단위를 시간 문자열("HH:mm")로 변환합니다. 24시간을 초과하면 자동으로 순환합니다.

**`isValidTime`**
```typescript
export function isValidTime(time: string): boolean
```
시간 문자열이 유효한 형식인지 검증합니다 (00:00 ~ 23:59).

#### 시간 조정 함수

**`adjustSubsequentItems`**
```typescript
export function adjustSubsequentItems(
  itinerary: Itinerary,
  dayNumber: number,
  itemIndex: number,
  oldEndTime: string,
  newEndTime: string
): Itinerary
```

종료 시간 변경 시 이후 일정을 자동으로 조정합니다.

**기능:**
- 같은 일정 내 이후 아이템들의 시간을 차이만큼 밀어내기
- 다음 일정의 첫 번째 아이템도 조정 (하루가 넘어가는 경우 대비)

**예시:**
```typescript
// 14:00-15:00 일정을 14:00-16:00으로 변경하면
// 이후 모든 일정이 1시간씩 밀려남
const updatedItinerary = adjustSubsequentItems(
  itinerary,
  1, // dayNumber
  2, // itemIndex
  '15:00', // oldEndTime
  '16:00'  // newEndTime
)
```

**`adjustItemTimes`**
```typescript
export function adjustItemTimes(
  item: ScheduleItem,
  newStartTime: string,
  previousItemEndTime?: string
): { startTime: string; endTime: string }
```

시작 시간 변경 시 검증 및 종료 시간 자동 조정을 수행합니다.

**기능:**
- 시작 시간이 종료 시간보다 이후면 종료 시간을 자동으로 1시간 후로 조정
- 이전 아이템과 겹치면 이전 아이템의 종료 시간 이후로 조정

**예시:**
```typescript
const adjusted = adjustItemTimes(
  item,
  '15:00', // newStartTime
  '14:00'  // previousItemEndTime
)
// { startTime: '15:00', endTime: '16:00' } (기본 1시간)
```

**`updateItemTime`**
```typescript
export function updateItemTime(
  itinerary: Itinerary,
  dayNumber: number,
  itemId: string,
  newStartTime?: string,
  newEndTime?: string
): Itinerary
```

일정 아이템의 시간을 업데이트하는 메인 함수입니다.

**기능:**
- 시작 시간 또는 종료 시간을 개별적으로 업데이트 가능
- 시작 시간 변경 시 `adjustItemTimes` 사용
- 종료 시간 변경 시 `adjustSubsequentItems` 사용
- 시간 유효성 검증

**예시:**
```typescript
// 시작 시간만 변경
const updated = updateItemTime(
  itinerary,
  1, // dayNumber
  'd1-item-1', // itemId
  '14:00', // newStartTime
  undefined // newEndTime
)

// 종료 시간만 변경 (이후 일정 자동 조정)
const updated = updateItemTime(
  itinerary,
  1, // dayNumber
  'd1-item-1', // itemId
  undefined, // newStartTime
  '16:00' // newEndTime
)
```

### 3. `stores/trip.ts`

일정 시간 업데이트를 위한 스토어 메서드를 추가했습니다.

**추가된 메서드:**

#### `updateItineraryItem`
```typescript
const updateItineraryItem = async (
  dayNumber: number,
  itemId: string,
  newStartTime?: string,
  newEndTime?: string
): Promise<void>
```

**기능:**
- 정적 여행인 경우 사용자 여행으로 자동 복사
- `updateItemTime` 함수를 사용하여 시간 업데이트
- IndexedDB에 저장 (reactive 객체를 평면 객체로 변환)
- 현재 여행 ID 업데이트

**사용 예시:**
```typescript
const tripStore = useTripStore()

// 시작 시간만 변경
await tripStore.updateItineraryItem(
  1, // dayNumber
  'd1-item-1', // itemId
  '14:00', // newStartTime
  undefined // newEndTime
)

// 종료 시간만 변경 (이후 일정 자동 조정)
await tripStore.updateItineraryItem(
  1, // dayNumber
  'd1-item-1', // itemId
  undefined, // newStartTime
  '16:00' // newEndTime
)

// 둘 다 변경
await tripStore.updateItineraryItem(
  1, // dayNumber
  'd1-item-1', // itemId
  '14:00', // newStartTime
  '16:00' // newEndTime
)
```

### 4. `pages/schedule.vue`

시간 편집 UI를 통합했습니다.

**추가된 상태:**
```typescript
const isTimeEditSheetOpen = ref(false)
const editingItem = ref<ScheduleItem | null>(null)
const isSaving = ref(false)
```

**추가된 함수:**
```typescript
// 시간 편집 시작
const openTimeEdit = (item: ScheduleItem) => {
  editingItem.value = item
  isTimeEditSheetOpen.value = true
}

// 시간 편집 닫기
const closeTimeEdit = () => {
  isTimeEditSheetOpen.value = false
  editingItem.value = null
}

// 시간 저장
const handleTimeSave = async (startTime: string, endTime: string) => {
  if (!editingItem.value || !currentDaySchedule.value) {
    return
  }

  isSaving.value = true
  try {
    const hasStartTimeChanged = editingItem.value.startTime !== startTime
    const hasEndTimeChanged = editingItem.value.endTime !== endTime

    if (!hasStartTimeChanged && !hasEndTimeChanged) {
      closeTimeEdit()
      return
    }

    await tripStore.updateItineraryItem(
      currentDaySchedule.value.dayNumber,
      editingItem.value.id,
      hasStartTimeChanged ? startTime : undefined,
      hasEndTimeChanged ? endTime : undefined
    )

    // 데이터 새로고침
    await refresh()

    toast.success('시간이 업데이트되었습니다')
    closeTimeEdit()
  } catch (error: any) {
    console.error('Failed to update time:', error)
    toast.error(error.message || '시간 업데이트에 실패했습니다')
  } finally {
    isSaving.value = false
  }
}
```

**UI 변경사항:**
- 일정 아이템의 시간 영역을 클릭 가능한 버튼으로 변경
- `TimeEditSheet` 컴포넌트 통합

## 사용 방법

### 1. 시간 편집 시작
일정 리스트에서 시간 영역(시작 시간과 종료 시간이 표시된 부분)을 클릭합니다.

### 2. 시간 수정
- 시작 시간과 종료 시간을 개별적으로 수정할 수 있습니다.
- 시간 형식은 `HH:mm` (예: 14:30)입니다.
- 종료 시간은 시작 시간보다 이후여야 합니다.

### 3. 저장
- "저장" 버튼을 클릭하면 시간이 업데이트됩니다.
- 종료 시간을 변경하면 이후 모든 일정이 자동으로 조정됩니다.
- 저장된 시간은 IndexedDB에 저장되어 유지됩니다.

### 4. 취소
- "취소" 버튼을 클릭하거나 ESC 키를 누르면 변경사항이 취소됩니다.
- 배경을 클릭해도 닫힙니다.

## 기술적 세부사항

### 1. 시간 조정 알고리즘

#### 종료 시간 변경 시

```typescript
// 시간 차이 계산
const diffMinutes = timeToMinutes(newEndTime) - timeToMinutes(oldEndTime)

// 같은 일정 내 이후 아이템들 조정
for (let i = itemIndex + 1; i < schedule.items.length; i++) {
  const item = schedule.items[i]
  const newStartMinutes = timeToMinutes(item.startTime) + diffMinutes
  const newEndMinutes = timeToMinutes(item.endTime) + diffMinutes
  
  item.startTime = minutesToTime(newStartMinutes)
  item.endTime = minutesToTime(newEndMinutes)
}

// 다음 일정의 첫 번째 아이템도 조정 (하루가 넘어가는 경우)
if (currentScheduleIndex < updatedItinerary.schedules.length - 1) {
  const nextSchedule = updatedItinerary.schedules[currentScheduleIndex + 1]
  if (nextSchedule.items.length > 0) {
    const firstItem = nextSchedule.items[0]
    // ... 시간 조정
  }
}
```

#### 시작 시간 변경 시

```typescript
// 시작 시간이 종료 시간보다 이후면 종료 시간 자동 조정
if (newStartMinutes >= currentEndMinutes) {
  const newEndMinutes = newStartMinutes + 60 // 기본 1시간
  return {
    startTime: newStartTime,
    endTime: minutesToTime(newEndMinutes)
  }
}

// 이전 아이템과의 충돌 검증
if (previousItemEndTime) {
  const prevEndMinutes = timeToMinutes(previousItemEndTime)
  if (newStartMinutes < prevEndMinutes) {
    // 이전 아이템의 종료 시간 이후로 조정
    return {
      startTime: previousItemEndTime,
      endTime: item.endTime
    }
  }
}
```

### 2. Reactive 객체 처리

IndexedDB에 저장할 때 Vue의 reactive 객체를 평면 객체로 변환해야 합니다.

```typescript
// toRaw()로 reactive 래퍼 제거
const updatedItinerary = updateItemTimeLogic(
  toRaw(userTrip.itinerary),
  dayNumber,
  itemId,
  newStartTime,
  newEndTime
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

정적 여행에 시간을 수정하면 자동으로 사용자 여행으로 복사됩니다.

```typescript
const isStaticTrip = trips.value.some(t => t.id === tripId)
let workingTripId = tripId

if (isStaticTrip) {
  workingTripId = await copyStaticTripToUser(tripId)
}
```

### 4. 시간 유효성 검증

```typescript
// 형식 검증 (HH:mm, 00:00 ~ 23:59)
const isValidTime = (time: string): boolean => {
  const regex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
  return regex.test(time)
}

// 시작 시간 < 종료 시간 검증
const startMinutes = timeToMinutes(startTime)
const endMinutes = timeToMinutes(endTime)

if (endMinutes <= startMinutes) {
  throw new Error('종료 시간은 시작 시간보다 이후여야 합니다.')
}
```

## 해결된 문제

### 1. DataCloneError
**문제:** IndexedDB에 Vue reactive 객체를 저장할 때 `DataCloneError` 발생

**해결:**
- `toRaw()`로 reactive 래퍼 제거
- `JSON.parse(JSON.stringify())`로 깊은 복사 및 평면화
- `useIndexedDB.saveTrip`에서도 최종 검증

### 2. 시간 조정 로직
**문제:** 종료 시간 변경 시 이후 일정을 수동으로 조정해야 함

**해결:**
- `adjustSubsequentItems` 함수로 자동 조정
- 같은 일정 내 이후 아이템들과 다음 일정의 첫 번째 아이템까지 조정

### 3. 시간 충돌 처리
**문제:** 시작 시간 변경 시 이전 일정과 겹칠 수 있음

**해결:**
- `adjustItemTimes` 함수로 이전 일정과의 충돌 검증 및 자동 조정
- 시작 시간이 종료 시간보다 이후면 종료 시간 자동 조정

## 시나리오 예시

### 시나리오 1: 종료 시간 연장
1. 사용자가 14:00-15:00 일정의 종료 시간을 16:00으로 변경
2. 시스템이 1시간 차이를 계산
3. 15:00 이후의 모든 일정이 1시간씩 밀려남
   - 15:00-16:00 → 16:00-17:00
   - 16:00-17:00 → 17:00-18:00
   - ...

### 시나리오 2: 시작 시간 변경
1. 사용자가 15:00-16:00 일정의 시작 시간을 14:00으로 변경
2. 이전 일정(13:00-14:00)과 겹치지 않으므로 그대로 적용
3. 시작 시간이 종료 시간보다 이전이므로 종료 시간은 그대로 유지

### 시나리오 3: 시작 시간이 이전 일정과 겹침
1. 사용자가 15:00-16:00 일정의 시작 시간을 13:30으로 변경
2. 이전 일정(13:00-14:00)과 겹침
3. 시스템이 시작 시간을 14:00(이전 일정의 종료 시간)으로 자동 조정

## 향후 개선 사항

1. **일괄 시간 조정**: 여러 일정을 선택하여 한 번에 시간 조정
2. **시간 드래그**: 시각적으로 시간을 드래그하여 조정
3. **소요 시간 자동 계산**: 시작 시간과 종료 시간을 입력하면 소요 시간 자동 표시
4. **시간 충돌 경고**: 시간을 변경하기 전에 충돌 가능성 경고
5. **되돌리기/다시 실행**: 시간 변경 이력 관리 및 되돌리기 기능

## 관련 파일

- `components/TimeEditSheet.vue`
- `composables/useTimeEditor.ts`
- `stores/trip.ts`
- `pages/schedule.vue`
- `types/index.ts` (ScheduleItem 타입 정의)

