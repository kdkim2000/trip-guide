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
      const transaction = database.transaction([STORES.USER_TRIPS], 'readwrite')
      const store = transaction.objectStore(STORES.USER_TRIPS)
      const request = store.put(tripData)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
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
