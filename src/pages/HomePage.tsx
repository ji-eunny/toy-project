import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import PetCard from '../components/PetCard'
import Header from '../components/Header'
import RegionSelector from '../components/RegionSelector'
import StatusSelect from '../components/StatusSelect'
import { fetchPets } from '../services/petService'
import { Pet } from '../types/pet'
import { getFromCache, setToCache } from '../utils/petCache'

const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [pets, setPets] = useState<Pet[]>([])
  const [displayCount, setDisplayCount] = useState(20)
  const [allPets, setAllPets] = useState<Pet[]>([])
  const [selectedRegion, setSelectedRegion] = useState<string | undefined>(
    searchParams.get('region') || undefined
  )
  const [statusFilter, setStatusFilter] = useState<'all' | 'protected' | 'ended'>(
    (searchParams.get('status') as 'all' | 'protected' | 'ended') || 'all'
  )
  const [loading, setLoading] = useState(true)
  const isInitialLoad = useRef(true)
  const abortControllerRef = useRef<AbortController | null>(null)

  // URL QueryString 변경 감지
  useEffect(() => {
    const region = searchParams.get('region') || undefined
    const status = (searchParams.get('status') as 'all' | 'protected' | 'ended') || 'all'

    if (region !== selectedRegion) {
      setSelectedRegion(region)
    }
    if (status !== statusFilter) {
      setStatusFilter(status)
    }
  }, [searchParams])

  // 지역 변경 시 데이터 로드 (캐시 우선, 만료 시 재요청)
  useEffect(() => {
    // 이전 요청 취소
    abortControllerRef.current?.abort()
    abortControllerRef.current = new AbortController()
    const isCancelled = () => abortControllerRef.current?.signal.aborted

    const loadPets = async () => {
      setLoading(true)
      setDisplayCount(20)

      // 캐시 확인 (지역별 + 만료 시간 30분 적용)
      const cached = getFromCache(selectedRegion)
      if (cached) {
        if (isCancelled()) return
        setAllPets(cached)
        setPets(getFilteredPets(cached, statusFilter).slice(0, 20))
        setLoading(false)
        isInitialLoad.current = false
        return
      }

      // 캐시 없으면 API 요청
      const data = await fetchPets(1, 20, selectedRegion)
      if (isCancelled()) return

      setToCache(data, selectedRegion)
      setAllPets(data)
      setPets(getFilteredPets(data, statusFilter).slice(0, 20))
      setLoading(false)
      isInitialLoad.current = false
    }

    loadPets()
  }, [selectedRegion])

  const handleLoadMore = () => {
    const newCount = displayCount + 20
    setDisplayCount(newCount)
    const filtered = getFilteredPets(allPets, statusFilter)
    setPets(filtered.slice(0, newCount))
  }

  const handleRegionChange = (region: string | undefined) => {
    setSelectedRegion(region)
    if (region) {
      setSearchParams({ region, status: statusFilter })
    } else {
      setSearchParams({ status: statusFilter })
    }
  }

  const getFilteredPets = (petsToFilter: Pet[], filter: 'all' | 'protected' | 'ended'): Pet[] => {
    return petsToFilter.filter((pet) => {
      if (filter === 'protected') return pet.status === '보호중'
      if (filter === 'ended') return pet.status !== '보호중'
      return true
    })
  }

  const handleStatusFilter = (filter: 'all' | 'protected' | 'ended') => {
    setStatusFilter(filter)
    setDisplayCount(20)
    const filtered = getFilteredPets(allPets, filter)
    setPets(filtered.slice(0, 20))
    if (selectedRegion) {
      setSearchParams({ region: selectedRegion, status: filter })
    } else {
      setSearchParams({ status: filter })
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          {/* 지역 선택 및 필터 */}
          <div className="flex flex-col mb-8 items-end">
            <div className="w-full">
              <RegionSelector selectedRegion={selectedRegion} onRegionChange={handleRegionChange} />
            </div>

            {/* 상태 필터 - StatusSelect 컴포넌트 */}
            <StatusSelect value={statusFilter} onChange={handleStatusFilter} />
          </div>

          {/* 로딩 상태 */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">유기동물 정보를 불러오는 중...</p>
              </div>
            </div>
          ) : pets.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600 text-lg">해당 지역의 유기동물 정보가 없습니다.</p>
            </div>
          ) : (
            <div className="w-full">
              {/* 동물 카드 그리드 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {pets.map((pet) => (
                  <div key={pet.id} className="flex justify-center">
                    <PetCard pet={pet} />
                  </div>
                ))}
              </div>

              {/* 더보기 버튼 */}
              {pets.length > 0 && displayCount < getFilteredPets(allPets, statusFilter).length && (
                <div className="flex justify-center mt-4 mb-8">
                  <button
                    onClick={handleLoadMore}
                    className="px-10 py-4 text-white bg-gray-500 rounded-full font-bold text-base hover:cursor-pointer"
                  >
                    더보기 ({displayCount} / {getFilteredPets(allPets, statusFilter).length})
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default HomePage
