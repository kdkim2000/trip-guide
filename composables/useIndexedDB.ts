import type { UserTripData } from '~/types'

const DB_NAME = 'TripGuideDB'
const DB_VERSION = 1

const STORES = {
  USER_TRIPS: 'userTrips',
  CHECKLIST_STATE: 'checklistState',
}

interface ChecklistState {
  itemId: string
  checked: boolean
  updatedAt: string
}

export const useIndexedDB = () => {
  let db: IDBDatabase | null = null

  // DB 초기화
  const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      if (!import.meta.client) {
        reject(new Error('IndexedDB is only available on client'))
        return
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        db = request.result
        resolve(db)
      }

      request.onupgradeneeded = (event) => {
        const database = (event.target as IDBOpenDBRequest).result

        // userTrips 스토어
        if (!database.objectStoreNames.contains(STORES.USER_TRIPS)) {
          const tripStore = database.createObjectStore(STORES.USER_TRIPS, {
            keyPath: 'id',
          })
          tripStore.createIndex('createdAt', 'createdAt', { unique: false })
        }

        // checklistState 스토어
        if (!database.objectStoreNames.contains(STORES.CHECKLIST_STATE)) {
          database.createObjectStore(STORES.CHECKLIST_STATE, {
            keyPath: 'itemId',
          })
        }
      }
    })
  }

  // DB 연결 보장
  const getDB = async (): Promise<IDBDatabase> => {
    if (db) return db
    return initDB()
  }

  // 여행 데이터 저장
  const saveTrip = async (tripData: UserTripData): Promise<void> => {
    const database = await getDB()
    return new Promise((resolve, reject) => {
      // #region agent log
      const canStringifyTripData = (() => { try { JSON.stringify(tripData); return true; } catch { return false; } })();
      fetch('http://127.0.0.1:7242/ingest/6d58e71f-f7ca-4deb-8a44-d47e17225386',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useIndexedDB.ts:64',message:'saveTrip entry',data:{tripDataId:tripData.id,canStringify:canStringifyTripData,itineraryType:typeof tripData.itinerary,placesType:typeof tripData.places,highlightsType:typeof tripData.highlights},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      // IndexedDB에 저장하기 전에 한 번 더 평면 객체로 변환 (안전장치)
      const plainData = JSON.parse(JSON.stringify(tripData))
      // #region agent log
      const canStringifyPlainData = (() => { try { JSON.stringify(plainData); return true; } catch { return false; } })();
      fetch('http://127.0.0.1:7242/ingest/6d58e71f-f7ca-4deb-8a44-d47e17225386',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useIndexedDB.ts:68',message:'before store.put',data:{plainDataId:plainData.id,canStringify:canStringifyPlainData},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      const transaction = database.transaction([STORES.USER_TRIPS], 'readwrite')
      const store = transaction.objectStore(STORES.USER_TRIPS)
      const request = store.put(plainData)

      request.onsuccess = () => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/6d58e71f-f7ca-4deb-8a44-d47e17225386',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useIndexedDB.ts:75',message:'store.put success',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        resolve()
      }
      request.onerror = () => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/6d58e71f-f7ca-4deb-8a44-d47e17225386',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useIndexedDB.ts:79',message:'store.put error',data:{errorName:request.error?.name,errorMessage:request.error?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        reject(request.error)
      }
    })
  }

  // 모든 여행 데이터 조회
  const getAllTrips = async (): Promise<UserTripData[]> => {
    const database = await getDB()
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORES.USER_TRIPS], 'readonly')
      const store = transaction.objectStore(STORES.USER_TRIPS)
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  // 특정 여행 데이터 조회
  const getTrip = async (id: string): Promise<UserTripData | undefined> => {
    const database = await getDB()
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORES.USER_TRIPS], 'readonly')
      const store = transaction.objectStore(STORES.USER_TRIPS)
      const request = store.get(id)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  // 여행 데이터 삭제
  const deleteTrip = async (id: string): Promise<void> => {
    const database = await getDB()
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORES.USER_TRIPS], 'readwrite')
      const store = transaction.objectStore(STORES.USER_TRIPS)
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // 체크리스트 상태 저장
  const saveChecklistItem = async (
    itemId: string,
    checked: boolean
  ): Promise<void> => {
    const database = await getDB()
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(
        [STORES.CHECKLIST_STATE],
        'readwrite'
      )
      const store = transaction.objectStore(STORES.CHECKLIST_STATE)
      const request = store.put({
        itemId,
        checked,
        updatedAt: new Date().toISOString(),
      } as ChecklistState)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // 체크리스트 상태 조회
  const getChecklistStates = async (): Promise<Record<string, boolean>> => {
    const database = await getDB()
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(
        [STORES.CHECKLIST_STATE],
        'readonly'
      )
      const store = transaction.objectStore(STORES.CHECKLIST_STATE)
      const request = store.getAll()

      request.onsuccess = () => {
        const states: Record<string, boolean> = {}
        request.result.forEach((item: ChecklistState) => {
          states[item.itemId] = item.checked
        })
        resolve(states)
      }
      request.onerror = () => reject(request.error)
    })
  }

  // 전체 데이터 초기화
  const clearAllData = async (): Promise<void> => {
    const database = await getDB()
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(
        [STORES.USER_TRIPS, STORES.CHECKLIST_STATE],
        'readwrite'
      )

      transaction.objectStore(STORES.USER_TRIPS).clear()
      transaction.objectStore(STORES.CHECKLIST_STATE).clear()

      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  }

  return {
    initDB,
    saveTrip,
    getAllTrips,
    getTrip,
    deleteTrip,
    saveChecklistItem,
    getChecklistStates,
    clearAllData,
  }
}
