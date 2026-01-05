import type { Itinerary, ScheduleItem, DaySchedule } from '~/types'

/**
 * 시간 문자열("HH:mm")을 분 단위로 변환
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * 분 단위를 시간 문자열("HH:mm")로 변환
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60) % 24
  const mins = minutes % 60
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

/**
 * 시간 문자열 유효성 검증
 */
export function isValidTime(time: string): boolean {
  const regex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
  return regex.test(time)
}

/**
 * endTime 변경 시 이후 일정 자동 조정
 */
export function adjustSubsequentItems(
  itinerary: Itinerary,
  dayNumber: number,
  itemIndex: number,
  oldEndTime: string,
  newEndTime: string
): Itinerary {
  const diffMinutes = timeToMinutes(newEndTime) - timeToMinutes(oldEndTime)
  
  if (diffMinutes === 0) {
    return itinerary
  }

  // 깊은 복사
  const updatedItinerary: Itinerary = JSON.parse(JSON.stringify(itinerary))
  
  // 같은 일정 내 이후 아이템들 조정
  const schedule = updatedItinerary.schedules.find(s => s.dayNumber === dayNumber)
  if (schedule) {
    for (let i = itemIndex + 1; i < schedule.items.length; i++) {
      const item = schedule.items[i]
      const newStartMinutes = timeToMinutes(item.startTime) + diffMinutes
      const newEndMinutes = timeToMinutes(item.endTime) + diffMinutes
      
      item.startTime = minutesToTime(newStartMinutes)
      item.endTime = minutesToTime(newEndMinutes)
    }
  }

  // 다음 일정들의 첫 번째 아이템도 조정
  const currentScheduleIndex = updatedItinerary.schedules.findIndex(
    s => s.dayNumber === dayNumber
  )
  
  if (currentScheduleIndex >= 0 && currentScheduleIndex < updatedItinerary.schedules.length - 1) {
    const nextSchedule = updatedItinerary.schedules[currentScheduleIndex + 1]
    if (nextSchedule.items.length > 0) {
      const firstItem = nextSchedule.items[0]
      const newStartMinutes = timeToMinutes(firstItem.startTime) + diffMinutes
      const newEndMinutes = timeToMinutes(firstItem.endTime) + diffMinutes
      
      firstItem.startTime = minutesToTime(newStartMinutes)
      firstItem.endTime = minutesToTime(newEndMinutes)
    }
  }

  return updatedItinerary
}

/**
 * startTime 변경 시 검증 및 endTime 자동 조정
 */
export function adjustItemTimes(
  item: ScheduleItem,
  newStartTime: string,
  previousItemEndTime?: string
): { startTime: string; endTime: string } {
  const newStartMinutes = timeToMinutes(newStartTime)
  const currentEndMinutes = timeToMinutes(item.endTime)
  
  // startTime이 endTime보다 이후면 endTime을 자동 조정 (기본 1시간)
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
      // 이전 아이템과 겹치면 이전 아이템의 endTime 이후로 조정
      return {
        startTime: previousItemEndTime,
        endTime: item.endTime
      }
    }
  }

  return {
    startTime: newStartTime,
    endTime: item.endTime
  }
}

/**
 * 일정 아이템의 시간 업데이트
 */
export function updateItemTime(
  itinerary: Itinerary,
  dayNumber: number,
  itemId: string,
  newStartTime?: string,
  newEndTime?: string
): Itinerary {
  // #region agent log
  const canStringifyItinerary = (() => { try { JSON.stringify(itinerary); return true; } catch { return false; } })();
  fetch('http://127.0.0.1:7242/ingest/6d58e71f-f7ca-4deb-8a44-d47e17225386',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useTimeEditor.ts:128',message:'updateItemTime entry',data:{itineraryType:typeof itinerary,itineraryIsReactive:!!itinerary?.__v_isRef,canStringify:canStringifyItinerary},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  // #endregion
  const updatedItinerary: Itinerary = JSON.parse(JSON.stringify(itinerary))
  // #region agent log
  const canStringifyUpdatedItinerary = (() => { try { JSON.stringify(updatedItinerary); return true; } catch { return false; } })();
  fetch('http://127.0.0.1:7242/ingest/6d58e71f-f7ca-4deb-8a44-d47e17225386',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useTimeEditor.ts:129',message:'after JSON parse/stringify',data:{updatedItineraryType:typeof updatedItinerary,canStringify:canStringifyUpdatedItinerary},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  // #endregion
  
  const schedule = updatedItinerary.schedules.find(s => s.dayNumber === dayNumber)
  if (!schedule) {
    return itinerary
  }

  const itemIndex = schedule.items.findIndex(item => item.id === itemId)
  if (itemIndex === -1) {
    return itinerary
  }

  const item = schedule.items[itemIndex]
  const previousItem = itemIndex > 0 ? schedule.items[itemIndex - 1] : null

  // startTime 업데이트
  if (newStartTime) {
    if (!isValidTime(newStartTime)) {
      throw new Error('유효하지 않은 시작 시간 형식입니다.')
    }

    const adjusted = adjustItemTimes(item, newStartTime, previousItem?.endTime)
    item.startTime = adjusted.startTime
    item.endTime = adjusted.endTime
  }

  // endTime 업데이트
  if (newEndTime) {
    if (!isValidTime(newEndTime)) {
      throw new Error('유효하지 않은 종료 시간 형식입니다.')
    }

    const startMinutes = timeToMinutes(item.startTime)
    const endMinutes = timeToMinutes(newEndTime)

    if (endMinutes <= startMinutes) {
      throw new Error('종료 시간은 시작 시간보다 이후여야 합니다.')
    }

    const oldEndTime = item.endTime
    item.endTime = newEndTime

    // 이후 일정 자동 조정
    return adjustSubsequentItems(
      updatedItinerary,
      dayNumber,
      itemIndex,
      oldEndTime,
      newEndTime
    )
  }

  return updatedItinerary
}

/**
 * 일정 아이템 삽입 및 시간 조정
 */
export function insertScheduleItem(
  itinerary: Itinerary,
  dayNumber: number,
  newItem: Omit<ScheduleItem, 'id' | 'status'>,
  insertAfterItemId?: string | null
): Itinerary {
  // 깊은 복사
  const updatedItinerary: Itinerary = JSON.parse(JSON.stringify(itinerary))
  
  const schedule = updatedItinerary.schedules.find(s => s.dayNumber === dayNumber)
  if (!schedule) {
    return itinerary
  }

  // 새 아이템 ID 생성
  const dayId = schedule.id
  const newItemId = `${dayId}-item-${Date.now()}`

  // 새 아이템 생성
  const scheduleItem: ScheduleItem = {
    ...newItem,
    id: newItemId,
    status: 'pending'
  }

  // 삽입 위치 결정
  let insertIndex: number

  if (insertAfterItemId) {
    // 특정 아이템 뒤에 삽입
    const afterIndex = schedule.items.findIndex(item => item.id === insertAfterItemId)
    if (afterIndex === -1) {
      // 찾지 못하면 맨 끝에 추가
      insertIndex = schedule.items.length
    } else {
      insertIndex = afterIndex + 1
    }
  } else {
    // 맨 끝에 추가
    insertIndex = schedule.items.length
  }

  // 시간 충돌 처리
  const newStartMinutes = timeToMinutes(scheduleItem.startTime)
  const newEndMinutes = timeToMinutes(scheduleItem.endTime)

  // 이전 아이템과의 충돌 확인
  if (insertIndex > 0) {
    const previousItem = schedule.items[insertIndex - 1]
    const prevEndMinutes = timeToMinutes(previousItem.endTime)
    
    if (newStartMinutes < prevEndMinutes) {
      // 이전 아이템의 endTime을 새 일정의 startTime으로 조정
      previousItem.endTime = scheduleItem.startTime
    }
  }

  // 다음 아이템과의 충돌 확인 및 조정
  if (insertIndex < schedule.items.length) {
    const nextItem = schedule.items[insertIndex]
    const nextStartMinutes = timeToMinutes(nextItem.startTime)
    
    if (newEndMinutes > nextStartMinutes) {
      // 차이 계산
      const diffMinutes = newEndMinutes - nextStartMinutes
      
      // 다음 아이템부터 모든 이후 아이템을 차이만큼 밀어내기
      for (let i = insertIndex; i < schedule.items.length; i++) {
        const item = schedule.items[i]
        const itemStartMinutes = timeToMinutes(item.startTime) + diffMinutes
        const itemEndMinutes = timeToMinutes(item.endTime) + diffMinutes
        
        item.startTime = minutesToTime(itemStartMinutes)
        item.endTime = minutesToTime(itemEndMinutes)
      }
    }
  }

  // 아이템 삽입
  schedule.items.splice(insertIndex, 0, scheduleItem)

  return updatedItinerary
}

