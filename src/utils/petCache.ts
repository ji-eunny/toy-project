import { Pet } from '../types/pet'

const REGION_CACHE_TTL_MS = 30 * 60 * 1000 // 지역별: 30분

export const getCacheKey = (region?: string) => `pets_cache_${region ?? 'all'}`

export const getFromCache = (region?: string): Pet[] | null => {
  try {
    const raw = localStorage.getItem(getCacheKey(region))
    if (!raw) return null
    const { data, timestamp } = JSON.parse(raw)

    // 전체(region 없음)는 만료 없이 영구 캐시
    if (!region) return data

    if (Date.now() - timestamp > REGION_CACHE_TTL_MS) {
      localStorage.removeItem(getCacheKey(region))
      return null
    }
    return data
  } catch {
    return null
  }
}

export const setToCache = (data: Pet[], region?: string) => {
  try {
    localStorage.setItem(getCacheKey(region), JSON.stringify({ data, timestamp: Date.now() }))
  } catch {
    // localStorage 용량 초과 시 무시
  }
}

/** 모든 캐시된 지역에서 id로 pet 검색 */
export const findPetInAllCaches = (id: string): Pet | undefined => {
  try {
    // 1. 개별 pet 캐시 확인
    const individual = localStorage.getItem(`pet_cache_${id}`)
    if (individual) {
      return JSON.parse(individual) as Pet
    }

    // 2. 모든 pets_cache_* 키 순회
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key?.startsWith('pets_cache_')) continue
      try {
        const raw = localStorage.getItem(key)
        if (!raw) continue
        const { data } = JSON.parse(raw)
        if (Array.isArray(data)) {
          const found = (data as Pet[]).find((p) => p.id === id)
          if (found) return found
        }
      } catch {
        continue
      }
    }
  } catch {
    return undefined
  }
  return undefined
}
